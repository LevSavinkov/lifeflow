# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.ext.asyncio import AsyncSession
# from backend.src.schemas.user import UserCreate, UserRead
# from backend.src.crud.user import create_user, get_user_by_email
# from backend.src.database import get_db
#
# router = APIRouter(prefix="/auth", tags=["auth"])
#
# @router.post("/register", response_model=UserRead)
# # async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
# async def register_user(user_in: UserCreate, db: AsyncSession):
#     existing = await get_user_by_email(db, user_in.email)
#     if existing:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="User with this email already exists"
#         )
#     user = await create_user(db, user_in)
#     return user
