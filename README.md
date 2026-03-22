# lifeflow

Kanban‑MVP для задач в реальной жизни.

**Авторизация:** access JWT в памяти фронта + refresh в HttpOnly cookie + таблица `auth_sessions`. Подробности для разработчиков — в [`CHANGELOG.md`](CHANGELOG.md); локальный разбор схемы (не в git): `AUTHORIZATION_EXPLAINED_RU.md`.

## Ветки и пуш

Каждая порция изменений — **отдельная ветка от актуального `main`**, имя: **`N-<n>`**, где `n` = номер предыдущей такой ветки **+ 1** (после `N-6` следующая — `N-7`). Перед работой: `git fetch origin && git checkout main && git pull`, затем `git checkout -b N-<n>`.

## Структура

- **backend/** — FastAPI, SQLAlchemy, PostgreSQL. Зависимости: Poetry. Запуск и миграции из папки `backend/`.
- **frontend/** — React + TypeScript + Vite. Зависимости: npm.
- **.env** — в корне репозитория; используется backend'ом (в т.ч. `DATABASE_URL`).

## Запуск

**Backend** (из папки `backend/`):

```bash
cd backend
poetry install
poetry run uvicorn src.main:app --reload
```

**Frontend** (из папки `frontend/`):

```bash
cd frontend
npm install
npm run dev
```

API: http://localhost:8000, фронт: http://localhost:5173.

## Миграции БД

Из папки `backend/`:

```bash
poetry run alembic upgrade head
```
