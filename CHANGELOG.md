# Changelog

## N-7 — документация и UX сессии на фронте

### Документация

- Корневой `README.md`: кратко про auth, ссылка на `CHANGELOG`, **правило веток N-* от актуального main**.
- `backend/README.md`: 422 `detail`, ответ `refresh` с пользователем.
- Локальный (не в репозитории) `AUTHORIZATION_EXPLAINED_RU.md` приведён в соответствие: bootstrap без лишнего `/auth/me`, `ready` / `sessionStorage`, обработчик валидации.

### Frontend

- Восстановление сессии: один `POST /auth/refresh`, пользователь из ответа; убран полноэкранный текст «Проверка сессии…»; подсказка `lifeflow-session` в `sessionStorage`.

---

## N-6 — авторизация, валидация, доска по умолчанию

### Backend

- Роутер `/auth`: регистрация, логин, refresh (refresh-токен в HttpOnly cookie), logout, `/auth/me`.
- Модель `auth_sessions`, миграция Alembic, ротация refresh, JWT access.
- Зависимости `deps` (текущий пользователь), rate limit для login/refresh.
- Валидация запросов: `EmailStr`, пароль минимум 4 символа; единый ответ **422** с `{"detail": "<строка>"}` через обработчик `RequestValidationError`.
- Правки CRUD пользователей/досок, `security`, конфиг (cookie, CORS, TTL).

### Frontend

- Экран входа/регистрации (`AuthPanel`), хук `useAuth`, хранение access в памяти + refresh по cookie.
- После входа — доска; если у пользователя **нет досок**, создаётся **«Моя доска»** (`POST /boards`), чтобы был UI добавления задач.
- API: `auth.ts`, `createBoard` в `boards.ts`; разбор ошибок API в `useAuth`.

### Прочее

- Тесты (`pytest`), обновления `README`, `.env.example`.
- Приведение комментариев в коде и CSS к сути без лишнего шума.
