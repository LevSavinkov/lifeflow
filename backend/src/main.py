from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import Base, engine, get_db
from src.crud.board import (
    create_board,
    create_goal,
    delete_all_goals,
    delete_board,
    delete_goal,
    list_boards,
    list_goals,
    update_goal,
)
from src.schemas.board import BoardCreate, BoardOut, GoalCreate, GoalOut, GoalUpdate

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


@app.get("/boards", response_model=list[BoardOut])
async def get_boards(db: AsyncSession = Depends(get_db)):
    return await list_boards(db)


@app.post("/boards", response_model=BoardOut)
async def create_board_endpoint(
    payload: BoardCreate, db: AsyncSession = Depends(get_db)
):
    return await create_board(db, title=payload.title, owner_id=None)


@app.get("/boards/{board_id}/goals", response_model=list[GoalOut])
async def get_goals(board_id: int, db: AsyncSession = Depends(get_db)):
    return await list_goals(db, board_id=board_id)


@app.post("/boards/{board_id}/goals", response_model=GoalOut)
async def create_goal_endpoint(
    board_id: int, payload: GoalCreate, db: AsyncSession = Depends(get_db)
):
    goal = await create_goal(db, text=payload.text, board_id=board_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Board not found")
    return goal


@app.patch("/goals/{goal_id}", response_model=GoalOut)
async def update_goal_endpoint(
    goal_id: int, payload: GoalUpdate, db: AsyncSession = Depends(get_db)
):
    goal = await update_goal(
        db, goal_id, text=payload.text, column_title=payload.column_title
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@app.delete("/goals/{goal_id}", status_code=204)
async def delete_goal_endpoint(goal_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_goal(db, goal_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Goal not found")


@app.delete("/boards/{board_id}/goals", status_code=204)
async def delete_all_goals_endpoint(board_id: int, db: AsyncSession = Depends(get_db)):
    await delete_all_goals(db, board_id=board_id)


@app.delete("/boards/{board_id}", status_code=204)
async def delete_board_endpoint(board_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_board(db, board_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Board not found")