from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_REPO_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str

    DEBUG: bool = False  # SQLAlchemy echo + FastAPI debug; в prod — False
    AUTO_CREATE_SCHEMA: bool = False
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALG: str = "HS256"
    ACCESS_TTL_MIN: int = 15
    REFRESH_TTL_DAYS: int = 30
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: str | None = None
    COOKIE_PATH: str = "/"
    RATE_LIMIT_LOGIN_PER_MIN: int = 10
    RATE_LIMIT_REFRESH_PER_MIN: int = 30

    CORS_ALLOW_ORIGIN_REGEX: str = r"https?://.*"  # в prod — домен приложения


settings = Settings()
