# Lifeflow Backend

FastAPI, SQLAlchemy (async), PostgreSQL.

## Запуск

Из папки **backend**:

```bash
poetry install
poetry run alembic upgrade head
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

`AUTO_CREATE_SCHEMA` по умолчанию выключен. Если очень нужно быстро поднять локально пустую БД без миграций, можно временно включить `AUTO_CREATE_SCHEMA=true` в `.env`.

## Auth конфиг (JWT + refresh sessions)

Ключевые переменные:

- `JWT_SECRET` — секрет для подписи access JWT (обязательно сменить в prod)
- `ACCESS_TTL_MIN` — TTL access токена (рекомендуется 10-15 минут)
- `REFRESH_TTL_DAYS` — TTL refresh сессии (рекомендуется 30 дней)
- `COOKIE_SECURE`, `COOKIE_SAMESITE`, `COOKIE_DOMAIN`, `COOKIE_PATH` — политика cookie
- `RATE_LIMIT_LOGIN_PER_MIN`, `RATE_LIMIT_REFRESH_PER_MIN` — ограничения на auth endpoint-ы
