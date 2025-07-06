from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.src.models.board import Board


async def create_board(db: AsyncSession, title: str, owner_id: int):
    board = Board(title=title, owner_id=owner_id)
    db.add(board)
    await db.commit()
    await db.refresh(board)
    return board


async def get_user_boards(db: AsyncSession, user_id: int):
    result = await db.execute(select(Board).where(Board.owner_id == user_id))
    return result.scalars().all()
