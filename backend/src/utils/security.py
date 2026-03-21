import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from argon2 import PasswordHasher
from jose import jwt

from src.config import settings

ph = PasswordHasher()


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return ph.verify(hashed_password, plain_password)


def create_access_token(subject: str, session_id: str, role: str = "user") -> str:
    now = datetime.now(timezone.utc)
    expire_at = now + timedelta(minutes=settings.ACCESS_TTL_MIN)
    payload: dict[str, Any] = {
        "sub": subject,
        "sid": session_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire_at.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
