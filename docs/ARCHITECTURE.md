# Обзор архитектуры и предложения по улучшению

## Текущая структура (обновлено: backend вынесен в backend/)

```
lifeflow/
├── backend/
│   ├── pyproject.toml, poetry.lock
│   ├── alembic.ini, alembic/
│   ├── README.md
│   └── src/
│       ├── main.py                # FastAPI, эндпоинты /goals и /ping
│       ├── database.py            # загрузка .env из корня репо, проверка DATABASE_URL
│       ├── api/                   # auth.py, board.py — закомментированы
│       ├── crud/, models/, schemas/, utils/
├── frontend/                      # Vite + React + TS
│   └── src/App.tsx
├── .env                           # в корне; используется backend'ом
└── README.md
```

**Плюсы:** разделение api/crud/models/schemas, async SQLAlchemy, типизация на фронте.

---

## 1. Разделение backend и frontend

**Сейчас:** Poetry и Alembic в корне, запуск backend из корня (`uvicorn backend.src.main:app`). Frontend — отдельный package.json в `frontend/`.

**Рекомендация:** Перенести Poetry и Alembic в `backend/`, оставить в корне только README, .env и две папки приложений. Тогда:
- `cd backend && poetry install && poetry run uvicorn src.main:app`
- `cd frontend && npm install && npm run dev`
- Импорты в backend станут `from src....` (при запуске из backend), без привязки к имени репозитория.

Опционально: оставить текущий вариант, но явно описать в README, что все команды backend запускаются из корня.

---

## 2. Роутеры и main.py

**Сейчас:** В `main.py` все эндпоинты описаны напрямую; в `api/auth.py` и `api/board.py` код закомментирован.

**Рекомендация:**
- Вынести эндпоинты целей в роутер, например `api/goals.py`, и подключать: `app.include_router(goals_router, prefix="/goals", tags=["goals"])`.
- Когда понадобится авторизация и доски — раскомментировать и донастроить `api/auth.py` и `api/board.py`, подключить их через `include_router`.
- В `main.py` оставить только создание `app`, CORS, startup (create_all), подключение роутеров и при необходимости `/ping`.

---

## 3. Конфигурация и .env

**Сейчас:** В `database.py` только `load_dotenv()` — ищет .env в текущей рабочей директории. При запуске из корня .env в корне подхватывается; при запуске из backend — нет.

**Рекомендация:**
- Явно загружать .env из корня репозитория (например, по `Path(__file__)` относительно `backend/src/database.py` → корень проекта) и при необходимости дублировать вызов `load_dotenv()` для текущей директории.
- Проверять наличие `DATABASE_URL` при старте и при его отсутствии выдавать понятную ошибку.
- CORS origins вынести в переменные окружения (например, `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`) с разумными значениями по умолчанию.

---

## 4. Frontend: API и конфиг

**Сейчас:** В `App.tsx` захардкожен `API_BASE = "http://localhost:8000"`.

**Рекомендация:**
- Ввести переменную окружения Vite, например `VITE_API_URL`, и использовать `import.meta.env.VITE_API_URL || "http://localhost:8000"`.
- Вынести запросы к API в отдельный модуль (например, `api/goals.ts`) с функциями `getGoals()`, `createGoal()`, `updateGoal()`, `deleteGoal()` — так проще менять базовый URL и переиспользовать логику.

---

## 5. Pydantic

**Сейчас:** В `schemas/board.py` у `BoardOut` — `orm_mode = True`, у `GoalOut` — `from_attributes = True`. В Pydantic v2 корректно использовать `from_attributes`.

**Рекомендация:** Заменить везде `orm_mode` на `from_attributes` для единообразия и совместимости с Pydantic v2.

---

## 6. Мусор и мелочи

- **Пустые файлы:** `backend/src/auth.py`, `backend/src/websocket_manager.py` — либо удалить, либо оставить с заглушкой и комментарием «будет использоваться для …».
- **Корневой package-lock.json:** Либо удалить из репозитория и добавить в .gitignore, либо явно указать, зачем он в корне (если не нужен — лучше убрать).
- **README:** Добавить описание структуры (backend/frontend), команды запуска (из корня или из backend/frontend), требование .env и переменной DATABASE_URL.
- **.gitignore:** При переносе Poetry в backend — добавить `backend/.venv/`, при использовании SQLite — `*.db`.

---

## Приоритеты

| Приоритет | Действие |
|-----------|----------|
| Высокий   | Загрузка .env из корня и проверка DATABASE_URL в database.py |
| Высокий   | README с командами запуска и описанием структуры |
| Средний   | Роутер api/goals.py и include_router в main.py |
| Средний   | Frontend: VITE_API_URL и отдельный api-клиент для целей |
| Низкий    | Унификация Pydantic (from_attributes), очистка пустых файлов |

Если нужно, могу по шагам реализовать пункты из таблицы (начиная с высокого приоритета).
