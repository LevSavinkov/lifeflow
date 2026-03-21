from collections import defaultdict, deque
from datetime import datetime, timezone
import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.config import settings
from src.crud.auth import (
    create_session,
    get_active_session_by_refresh_hash,
    revoke_all_sessions,
    revoke_session,
)
from src.crud.user import create_user, get_user_by_email
from src.database import get_db
from src.models.user import User
from src.schemas.auth import AuthTokenResponse, LoginRequest, RefreshRequest, RegisterRequest
from src.schemas.user import UserCreate, UserRead
from src.utils.security import (
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)
_rate_buckets: dict[str, deque[float]] = defaultdict(deque)
_REFRESH_COOKIE_NAME = "lifeflow_refresh"


def _rate_limit_or_429(bucket_key: str, limit_per_min: int) -> None:
    now = time.time()
    window_start = now - 60
    bucket = _rate_buckets[bucket_key]
    while bucket and bucket[0] < window_start:
        bucket.popleft()
    if len(bucket) >= limit_per_min:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests",
        )
    bucket.append(now)


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=_REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
        path=settings.COOKIE_PATH,
        max_age=settings.REFRESH_TTL_DAYS * 24 * 60 * 60,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=_REFRESH_COOKIE_NAME,
        domain=settings.COOKIE_DOMAIN,
        path=settings.COOKIE_PATH,
    )


def _auth_response(user: User, session_id: str) -> AuthTokenResponse:
    access = create_access_token(subject=str(user.id), session_id=session_id)
    return AuthTokenResponse(access_token=access, user=UserRead.model_validate(user))


@router.post("/register", response_model=AuthTokenResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    _rate_limit_or_429(f"register:{request.client.host if request.client else 'unknown'}", settings.RATE_LIMIT_LOGIN_PER_MIN)
    exists = await get_user_by_email(db, payload.email)
    if exists:
        raise HTTPException(status_code=409, detail="User already exists")

    user = await create_user(db, UserCreate(email=payload.email, password=payload.password))
    refresh = generate_refresh_token()
    session = await create_session(
        db=db,
        user_id=user.id,
        refresh_hash=hash_refresh_token(refresh),
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        device_name="web",
    )
    _set_refresh_cookie(response, refresh)
    logger.info("auth.register.success user_id=%s session_id=%s", user.id, session.id)
    return _auth_response(user, session.id)


@router.post("/login", response_model=AuthTokenResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else "unknown"
    _rate_limit_or_429(f"login:{ip}", settings.RATE_LIMIT_LOGIN_PER_MIN)
    user = await get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        logger.warning("auth.login.failed email=%s ip=%s", payload.email, ip)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    refresh = generate_refresh_token()
    session = await create_session(
        db=db,
        user_id=user.id,
        refresh_hash=hash_refresh_token(refresh),
        ip=ip,
        user_agent=request.headers.get("user-agent"),
        device_name=payload.device_name or "web",
    )
    _set_refresh_cookie(response, refresh)
    logger.info("auth.login.success user_id=%s session_id=%s", user.id, session.id)
    return _auth_response(user, session.id)


@router.post("/refresh", response_model=AuthTokenResponse)
async def refresh(
    request: Request,
    response: Response,
    payload: RefreshRequest | None = None,
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else "unknown"
    _rate_limit_or_429(f"refresh:{ip}", settings.RATE_LIMIT_REFRESH_PER_MIN)
    refresh_token = request.cookies.get(_REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    hashed = hash_refresh_token(refresh_token)
    active = await get_active_session_by_refresh_hash(db, hashed)
    if active is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    await revoke_session(db, active.id)
    new_refresh = generate_refresh_token()
    new_session = await create_session(
        db=db,
        user_id=active.user_id,
        refresh_hash=hash_refresh_token(new_refresh),
        ip=ip,
        user_agent=request.headers.get("user-agent"),
        device_name=(payload.device_name if payload else None) or active.device_name,
        rotated_from_id=active.id,
    )

    user = await db.get(User, active.user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    _set_refresh_cookie(response, new_refresh)
    logger.info("auth.refresh.success user_id=%s session_id=%s", user.id, new_session.id)
    return _auth_response(user, new_session.id)


@router.post("/logout", status_code=204)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    refresh_token = request.cookies.get(_REFRESH_COOKIE_NAME)
    if refresh_token:
        active = await get_active_session_by_refresh_hash(db, hash_refresh_token(refresh_token))
        if active is not None:
            await revoke_session(db, active.id)
            logger.info("auth.logout.success user_id=%s session_id=%s", active.user_id, active.id)
    _clear_refresh_cookie(response)


@router.post("/logout-all", status_code=204)
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await revoke_all_sessions(db, current_user.id)
    _clear_refresh_cookie(response)
    logger.info("auth.logout_all.success user_id=%s at=%s", current_user.id, datetime.now(timezone.utc))


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)):
    return UserRead.model_validate(current_user)
