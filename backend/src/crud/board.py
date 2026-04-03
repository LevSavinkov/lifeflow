from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from src.models.board import Board
from src.models.board_column import BoardColumn
from src.models.card import Card

COLUMN_TITLES = ("to do", "in progress", "done")
DEFAULT_BOARD_TITLES = (
    "Краткосрочные",
    "Среднесрочные",
    "Долгосрочные",
)
LEGACY_BOARD_TITLE_MAPPING = {
    "Быстрые цели (дневные)": "Краткосрочные",
    "Средне срочные цели (недельные)": "Среднесрочные",
    "Долгосрочные цели (месяц и более)": "Долгосрочные",
}
LEGACY_SINGLE_BOARD_TITLE = "Моя доска"


async def create_board(db: AsyncSession, title: str, owner_id: int):
    board = Board(title=title, owner_id=owner_id)
    db.add(board)
    await db.flush()

    for i, col_title in enumerate(COLUMN_TITLES):
        col = BoardColumn(title=col_title, order=i, board_id=board.id)
        db.add(col)

    await db.commit()
    await db.refresh(board)
    return board


async def list_boards(db: AsyncSession, owner_id: int) -> list[Board]:
    result = await db.execute(
        select(Board).where(Board.owner_id == owner_id).order_by(Board.id.asc())
    )
    return result.scalars().all()


async def ensure_default_boards(db: AsyncSession, owner_id: int) -> list[Board]:
    existing = await list_boards(db, owner_id=owner_id)
    changed = False

    # Rename legacy default boards to the current naming.
    for board in existing:
        renamed = LEGACY_BOARD_TITLE_MAPPING.get(board.title)
        if renamed and renamed not in {b.title for b in existing}:
            board.title = renamed
            changed = True

    # Remove old single default board if it still exists.
    legacy_single = next((b for b in existing if b.title == LEGACY_SINGLE_BOARD_TITLE), None)
    if legacy_single is not None:
        await db.delete(legacy_single)
        changed = True
        existing = [b for b in existing if b.id != legacy_single.id]

    existing_titles = {board.title for board in existing}
    missing_titles = [title for title in DEFAULT_BOARD_TITLES if title not in existing_titles]

    if not missing_titles:
        if changed:
            await db.commit()
        return existing

    for board_title in missing_titles:
        board = Board(title=board_title, owner_id=owner_id)
        db.add(board)
        await db.flush()
        for i, col_title in enumerate(COLUMN_TITLES):
            db.add(BoardColumn(title=col_title, order=i, board_id=board.id))

    await db.commit()
    return await list_boards(db, owner_id=owner_id)


async def get_board_columns(
    db: AsyncSession, board_id: int, owner_id: int | None = None
) -> list[BoardColumn]:
    result = await db.execute(
        select(BoardColumn)
        .join(Board, Board.id == BoardColumn.board_id)
        .where(BoardColumn.board_id == board_id)
        .where(Board.owner_id == owner_id if owner_id is not None else True)
        .order_by(BoardColumn.order.asc())
    )
    return list(result.scalars().all())


async def get_board_column_by_title(
    db: AsyncSession, board_id: int, title: str, owner_id: int | None = None
) -> BoardColumn | None:
    result = await db.execute(
        select(BoardColumn)
        .join(Board, Board.id == BoardColumn.board_id)
        .where(BoardColumn.board_id == board_id, BoardColumn.title == title)
        .where(Board.owner_id == owner_id if owner_id is not None else True)
    )
    return result.scalars().first()


async def get_todo_column(
    db: AsyncSession, board_id: int, owner_id: int | None = None
) -> BoardColumn | None:
    col = await get_board_column_by_title(db, board_id, "to do", owner_id=owner_id)
    if col:
        return col
    columns = await get_board_columns(db, board_id, owner_id=owner_id)
    return columns[0] if columns else None


async def _get_card_with_column(db: AsyncSession, card_id: int) -> Card | None:
    result = await db.execute(
        select(Card).where(Card.id == card_id).options(selectinload(Card.column))
    )
    return result.scalars().first()


async def create_goal(
    db: AsyncSession, text: str, board_id: int, owner_id: int | None = None
) -> Card | None:
    column = await get_todo_column(db, board_id, owner_id=owner_id)
    if not column:
        return None
    max_order_result = await db.execute(
        select(Card.order).where(Card.column_id == column.id).order_by(Card.order.desc())
    )
    max_order = max_order_result.scalars().first() or 0

    card = Card(text=text, order=max_order + 1, column_id=column.id)
    db.add(card)
    await db.commit()
    return await _get_card_with_column(db, card.id)


async def list_goals(
    db: AsyncSession, board_id: int, owner_id: int | None = None
) -> list[Card]:
    columns = await get_board_columns(db, board_id, owner_id=owner_id)
    if not columns:
        return []
    col_ids = [c.id for c in columns]
    result = await db.execute(
        select(Card)
        .where(Card.column_id.in_(col_ids))
        .options(selectinload(Card.column))
        .order_by(Card.column_id, Card.order.asc())
    )
    cards = result.scalars().all()
    order_by_col = {c.id: i for i, c in enumerate(columns)}
    cards.sort(key=lambda card: (order_by_col.get(card.column_id, 0), card.order))
    return cards


async def update_goal(
    db: AsyncSession,
    goal_id: int,
    text: str | None = None,
    column_title: str | None = None,
    owner_id: int | None = None,
) -> Card | None:
    result = await db.execute(
        select(Card).where(Card.id == goal_id).options(selectinload(Card.column))
    )
    card = result.scalars().first()
    if not card:
        return None
    if text is not None:
        card.text = text
    if column_title is not None:
        board_id = card.column.board_id
        new_col = await get_board_column_by_title(
            db, board_id, column_title, owner_id=owner_id
        )
        if new_col:
            card.column_id = new_col.id
    await db.commit()
    db.expire(card, ["column"])
    return await _get_card_with_column(db, goal_id)


async def delete_goal(db: AsyncSession, goal_id: int, owner_id: int | None = None) -> bool:
    result = await db.execute(select(Card).where(Card.id == goal_id))
    card = result.scalars().first()
    if not card:
        return False
    if owner_id is not None:
        col = await db.get(BoardColumn, card.column_id)
        board = await db.get(Board, col.board_id) if col else None
        if board is None or board.owner_id != owner_id:
            return False
    await db.delete(card)
    await db.commit()
    return True


async def delete_board(db: AsyncSession, board_id: int, owner_id: int | None = None) -> bool:
    result = await db.execute(
        select(Board).where(
            Board.id == board_id, Board.owner_id == owner_id if owner_id is not None else True
        )
    )
    board = result.scalars().first()
    if not board:
        return False
    await db.delete(board)
    await db.commit()
    return True
