from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.database import Base, engine, get_db
from backend.src.crud.board import (
    create_goal,
    delete_all_goals,
    list_goals,
    toggle_goal,
)
from backend.src.schemas.board import GoalCreate, GoalOut

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


@app.get("/ping")
async def ping():
    return {"pong": True}


@app.get("/goals", response_model=list[GoalOut])
async def get_goals(db: AsyncSession = Depends(get_db)):
    return await list_goals(db)


@app.post("/goals", response_model=GoalOut)
async def create_goal_endpoint(
    payload: GoalCreate, db: AsyncSession = Depends(get_db)
):
    return await create_goal(db, text=payload.text)


@app.post("/goals/{goal_id}/toggle", response_model=GoalOut)
async def toggle_goal_endpoint(goal_id: int, db: AsyncSession = Depends(get_db)):
    goal = await toggle_goal(db, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@app.delete("/goals", status_code=204)
async def delete_all_goals_endpoint(db: AsyncSession = Depends(get_db)):
    await delete_all_goals(db)
