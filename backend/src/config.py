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

    # Включает SQL-логи SQLAlchemy и отладочный режим FastAPI.
    # В prod оставьте False (или не задавайте).
    DEBUG: bool = False
    AUTO_CREATE_SCHEMA: bool = False

    # Регулярное выражение для CORS allow_origin_regex.
    # По умолчанию разрешает любой http/https origin — удобно для разработки
    # и доступа с других устройств в локальной сети (по IP сервера).
    # В prod замените на конкретный домен, например: https://myapp\.example\.com
    CORS_ALLOW_ORIGIN_REGEX: str = r"https?://.*"


settings = Settings()
