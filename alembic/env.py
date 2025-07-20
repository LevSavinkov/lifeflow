import sys
import os
from dotenv import load_dotenv
from logging.config import fileConfig
from sqlalchemy import pool, create_engine
from alembic import context

load_dotenv()

from backend.src.models import *

# Alembic Config объект
config = context.config

# Настройка логгера
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Импорт моделей
from backend.src.database import Base

target_metadata = Base.metadata

# Получаем URL из конфигурации (alembic.ini или .env)
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Для миграций убираем +asyncpg из URL
sync_database_url = DATABASE_URL.replace("+asyncpg", "")


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
    # Используем create_engine для синхронного движка
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
