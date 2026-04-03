# Lifeflow Backend

FastAPI, SQLAlchemy (async), PostgreSQL.

## Запуск

Из папки **backend**:

```bash
poetry install
poetry run alembic upgrade head
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Флаг `--host 0.0.0.0` нужен, чтобы API был доступен не только на `localhost`, но и по IP машины в локальной сети.

Переменные окружения берутся из файла **.env в корне репозитория** (на уровень выше `backend/`). Обязательна переменная `DATABASE_URL`.

## Доступ к API не через localhost

1. Узнайте IPv4 адрес машины:

```bash
ipconfig
```

2. Запустите backend с `--host 0.0.0.0` (см. команду выше).

3. Открывайте API с другого устройства по адресу:

```text
http://<ВАШ_IPV4>:8000
```

Пример: `http://192.168.1.45:8000`.

Если API не открывается с других устройств:

- проверьте, что устройства в одной сети;
- разрешите порт `8000` в Windows Firewall;
- проверьте `CORS_ALLOW_ORIGIN_REGEX` в `.env`, чтобы frontend с вашего IP/порта был разрешен.

## Миграции

Из папки **backend**:

```bash
poetry run alembic upgrade head
poetry run alembic revision --autogenerate -m "описание"
```

`AUTO_CREATE_SCHEMA` по умолчанию выключен. Если очень нужно быстро поднять локально пустую БД без миграций, можно временно включить `AUTO_CREATE_SCHEMA=true` в `.env`.

## Auth (JWT + refresh sessions)

- Ответ **422** при ошибках валидации тела запроса: `{"detail": "<одна строка>"}` (см. `src/api/exception_handlers.py`).
- `POST /auth/refresh` возвращает и access token, и **пользователя** — клиенту не нужен лишний `GET /auth/me` при восстановлении сессии.

Ключевые переменные в `.env`:

- `JWT_SECRET` — секрет для подписи access JWT (обязательно сменить в prod)
- `ACCESS_TTL_MIN` — TTL access токена (рекомендуется 10-15 минут)
- `REFRESH_TTL_DAYS` — TTL refresh сессии (рекомендуется 30 дней)
- `COOKIE_SECURE`, `COOKIE_SAMESITE`, `COOKIE_DOMAIN`, `COOKIE_PATH` — политика cookie
- `RATE_LIMIT_LOGIN_PER_MIN`, `RATE_LIMIT_REFRESH_PER_MIN` — ограничения на auth endpoint-ы
