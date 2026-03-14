from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.src.models.user import User
from backend.src.schemas.user import UserCreate
from backend.src.utils.security import hash_password


async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    hashed_pw = hash_password(user_in.password)
    user = User(email=user_in.email, hashed_password=hashed_pw)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()
