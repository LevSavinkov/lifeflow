# Lifeflow Backend

FastAPI, SQLAlchemy (async), PostgreSQL.

## Запуск

Из папки **backend**:

```bash
poetry install
poetry run uvicorn src.main:app --reload --host 0.0.0.0
```

Флаг `--host 0.0.0.0` нужен на Windows, чтобы запросы по `http://localhost:8000` доходили до приложения (иначе браузер может стучаться по IPv6, а сервер слушает только 127.0.0.1, и в логах uvicorn запросы не появляются).

Переменные окружения берутся из файла **.env в корне репозитория** (на уровень выше `backend/`). Обязательна переменная `DATABASE_URL`.

## Миграции

Из папки **backend**:

```bash
poetry run alembic upgrade head
poetry run alembic revision --autogenerate -m "описание"
```
