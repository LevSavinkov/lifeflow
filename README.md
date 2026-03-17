# lifeflow

Kanban‑MVP для задач в реальной жизни.

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
