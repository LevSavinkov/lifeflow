from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.database import get_db
from backend.src.crud import create_board
from backend.src.schemas.board import BoardCreate, BoardOut
from backend.src.auth import get_current_user
from backend.src.models.user import User

router = APIRouter(
    prefix="/boards",
    tags=["boards"]
)


@router.post("/", response_model=BoardOut, status_code=status.HTTP_201_CREATED)
async def create_board_endpoint(
        board_data: BoardCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    return await create_board(
        db=db,
        title=board_data.title,
        owner_id=current_user.id
    )
