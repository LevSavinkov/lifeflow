from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import src.models  # noqa: F401 — регистрирует все модели до create_all
from src.config import settings
from src.database import Base, engine
from src.routers.boards import router as boards_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.AUTO_CREATE_SCHEMA:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Lifeflow API", debug=settings.DEBUG, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # allow_origin_regex принимает любой http/https origin.
    # Это нужно для доступа с других устройств в локальной сети (по IP сервера).
    # Для прода задайте CORS_ALLOW_ORIGIN_REGEX в .env, например:
    #   CORS_ALLOW_ORIGIN_REGEX=https://myapp\.example\.com
    allow_origin_regex=settings.CORS_ALLOW_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(boards_router)


@app.get("/ping", tags=["health"])
async def ping():
    return {"pong": True}
