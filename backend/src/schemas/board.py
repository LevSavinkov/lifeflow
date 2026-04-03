from datetime import date, datetime

from pydantic import BaseModel


class BoardCreate(BaseModel):
    title: str


class BoardOut(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class GoalBase(BaseModel):
    text: str


class GoalCreate(GoalBase):
    """Для доски «Долгосрочные» поле обязательно; для «Краткосрочные» игнорируется."""

    due_date: date | None = None


class GoalUpdate(BaseModel):
    text: str | None = None
    column_title: str | None = None


class GoalOut(GoalBase):
    id: int
    column_title: str = "to do"
    due_at: datetime | None = None

    class Config:
        from_attributes = True
