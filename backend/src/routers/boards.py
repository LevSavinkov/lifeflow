from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

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
from src.database import get_db
from src.schemas.board import BoardCreate, BoardOut, GoalCreate, GoalOut, GoalUpdate

router = APIRouter()


@router.get("/boards", response_model=list[BoardOut])
async def get_boards(db: AsyncSession = Depends(get_db)):
    return await list_boards(db)


@router.post("/boards", response_model=BoardOut, status_code=201)
async def create_board_endpoint(
    payload: BoardCreate, db: AsyncSession = Depends(get_db)
):
    return await create_board(db, title=payload.title, owner_id=None)


@router.get("/boards/{board_id}/goals", response_model=list[GoalOut])
async def get_goals(board_id: int, db: AsyncSession = Depends(get_db)):
    return await list_goals(db, board_id=board_id)


@router.post("/boards/{board_id}/goals", response_model=GoalOut, status_code=201)
async def create_goal_endpoint(
    board_id: int, payload: GoalCreate, db: AsyncSession = Depends(get_db)
):
    goal = await create_goal(db, text=payload.text, board_id=board_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Board not found")
    return goal


@router.patch("/goals/{goal_id}", response_model=GoalOut)
async def update_goal_endpoint(
    goal_id: int, payload: GoalUpdate, db: AsyncSession = Depends(get_db)
):
    goal = await update_goal(
        db, goal_id, text=payload.text, column_title=payload.column_title
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.delete("/goals/{goal_id}", status_code=204)
async def delete_goal_endpoint(goal_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_goal(db, goal_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Goal not found")


@router.delete("/boards/{board_id}/goals", status_code=204)
async def delete_all_goals_endpoint(
    board_id: int, db: AsyncSession = Depends(get_db)
):
    await delete_all_goals(db, board_id=board_id)


@router.delete("/boards/{board_id}", status_code=204)
async def delete_board_endpoint(board_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_board(db, board_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Board not found")
