from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.config import settings
from src.models.auth_session import AuthSession


async def create_session(
    db: AsyncSession,
    user_id: int,
    refresh_hash: str,
    ip: str | None,
    user_agent: str | None,
    device_name: str | None,
    rotated_from_id: str | None = None,
) -> AuthSession:
    now = datetime.now(timezone.utc)
    session = AuthSession(
        id=str(uuid4()),
        user_id=user_id,
        refresh_hash=refresh_hash,
        expires_at=now + timedelta(days=settings.REFRESH_TTL_DAYS),
        ip=ip,
        user_agent=user_agent,
        device_name=device_name,
        rotated_from_id=rotated_from_id,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def get_active_session_by_refresh_hash(
    db: AsyncSession, refresh_hash: str
) -> AuthSession | None:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(AuthSession).where(
            AuthSession.refresh_hash == refresh_hash,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
        )
    )
    return result.scalar_one_or_none()


async def revoke_session(db: AsyncSession, session_id: str) -> None:
    now = datetime.now(timezone.utc)
    await db.execute(
        update(AuthSession)
        .where(AuthSession.id == session_id, AuthSession.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    await db.commit()


async def revoke_all_sessions(db: AsyncSession, user_id: int) -> None:
    now = datetime.now(timezone.utc)
    await db.execute(
        update(AuthSession)
        .where(AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    await db.commit()
