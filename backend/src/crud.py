from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .models import Board, BoardColumn, Card


async def create_board(db: AsyncSession, title: str, owner_id: int):
    board = Board(title=title, owner_id=owner_id)
    db.add(board)
    await db.commit()
    await db.refresh(board)
    return board


async def get_user_boards(db: AsyncSession, user_id: int):
    result = await db.execute(select(Board).where(Board.owner_id == user_id))
    return result.scalars().all()


async def get_or_create_default_board_and_column(db: AsyncSession) -> tuple[Board, BoardColumn]:
    result = await db.execute(
        select(Board).where(Board.title == "Goals", Board.owner_id.is_(None))
    )
    board = result.scalars().first()

    if not board:
        board = Board(title="Goals", owner_id=None)
        db.add(board)
        await db.flush()

    result_col = await db.execute(
        select(BoardColumn).where(
            BoardColumn.board_id == board.id, BoardColumn.title == "Default"
        )
    )
    column = result_col.scalars().first()

    if not column:
        column = BoardColumn(title="Default", order=0, board_id=board.id)
        db.add(column)
        await db.flush()

    await db.commit()
    await db.refresh(board)
    await db.refresh(column)
    return board, column


async def create_goal(db: AsyncSession, text: str) -> Card:
    _, column = await get_or_create_default_board_and_column(db)
    max_order_result = await db.execute(
        select(Card.order).where(Card.column_id == column.id).order_by(Card.order.desc())
    )
    max_order = max_order_result.scalars().first() or 0

    card = Card(content=text, order=max_order + 1, column_id=column.id, done=False)
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card


async def list_goals(db: AsyncSession) -> list[Card]:
    _, column = await get_or_create_default_board_and_column(db)
    result = await db.execute(
        select(Card).where(Card.column_id == column.id).order_by(Card.order.asc())
    )
    return result.scalars().all()


async def toggle_goal(db: AsyncSession, goal_id: int) -> Card | None:
    result = await db.execute(select(Card).where(Card.id == goal_id))
    card = result.scalars().first()
    if not card:
        return None
    card.done = not card.done
    await db.commit()
    await db.refresh(card)
    return card


async def delete_all_goals(db: AsyncSession) -> None:
    _, column = await get_or_create_default_board_and_column(db)
    result = await db.execute(select(Card).where(Card.column_id == column.id))
    cards = result.scalars().all()
    for card in cards:
        await db.delete(card)
    await db.commit()
