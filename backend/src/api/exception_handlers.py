"""Обработка ошибок валидации: ответ API с полем ``detail`` — строка."""

from __future__ import annotations

from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def _loc_to_dotted_path(loc: tuple[str | int, ...]) -> str:
    """Путь к полю без префикса body: ``email``, ``profile.email``, ``items.0.title``."""
    parts: list[str] = []
    for p in loc:
        if str(p) == "body":
            continue
        parts.append(str(p))
    return ".".join(parts)


def _tail_field(dotted_path: str) -> str:
    """Имя поля — последний сегмент (для плоских и вложенных моделей)."""
    if not dotted_path:
        return ""
    return dotted_path.rsplit(".", 1)[-1]


def message_for_validation_error(dotted_path: str, err: dict[str, Any]) -> str:
    """Сообщение для одной ошибки Pydantic (поле по пути, ``type``, ``ctx``)."""
    tail = _tail_field(dotted_path)
    err_type = str(err.get("type") or "")
    ctx: dict[str, Any] = dict(err.get("ctx") or {})
    raw_msg = str(err.get("msg") or "Некорректные данные")

    if err_type == "missing":
        return f"Заполните поле «{tail or '…'}»." if tail else "Заполните обязательные поля."

    if tail == "email":
        return "Введите корректный email (например, name@example.com)."

    if tail == "password":
        if err_type == "string_too_short":
            min_len = ctx.get("min_length")
            if isinstance(min_len, int):
                return f"Пароль должен быть не короче {min_len} символов."
            return "Пароль должен быть не короче 4 символов."
        return "Проверьте пароль."

    return raw_msg


def format_validation_errors(errors: list[dict[str, Any]]) -> str:
    messages: list[str] = []
    seen: set[str] = set()
    for err in errors:
        loc = tuple(err.get("loc") or ())
        path = _loc_to_dotted_path(loc)
        text = message_for_validation_error(path, err)
        if text not in seen:
            seen.add(text)
            messages.append(text)
    return " ".join(messages) if messages else "Проверьте введённые данные."


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    body = format_validation_errors(exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": body},
    )
