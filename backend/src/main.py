from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from .database import Base, engine, get_db
from . import crud, schemas, models  # noqa: F401

app = FastAPI(title="Lifeflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/goals", response_model=list[schemas.GoalOut])
async def get_goals(db: AsyncSession = Depends(get_db)):
    return await crud.list_goals(db)


@app.post("/goals", response_model=schemas.GoalOut)
async def create_goal(payload: schemas.GoalCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_goal(db, text=payload.text)


@app.post("/goals/{goal_id}/toggle", response_model=schemas.GoalOut)
async def toggle_goal(goal_id: int, db: AsyncSession = Depends(get_db)):
    goal = await crud.toggle_goal(db, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@app.delete("/goals", status_code=204)
async def delete_all_goals(db: AsyncSession = Depends(get_db)):
    await crud.delete_all_goals(db)

