import os
from pathlib import Path

from dotenv import load_dotenv
from logging.config import fileConfig
from sqlalchemy import pool, create_engine
from alembic import context

# Корень репозитория (родитель backend/) — там лежит .env
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(_REPO_ROOT / ".env")
load_dotenv()  # и из текущей рабочей папки

# prepend_sys_path в alembic.ini = . (backend/), поэтому импорт src.* корректен
from src.models import *

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from src.database import Base

target_metadata = Base.metadata

DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite+aiosqlite:///:memory:"
sync_database_url = DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")


def run_migrations_offline() -> None:
    url = sync_database_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(
        sync_database_url,
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
