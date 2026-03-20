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
    pass


class GoalUpdate(BaseModel):
    text: str | None = None
    column_title: str | None = None


class GoalOut(GoalBase):
    id: int
    column_title: str = "to do"

    class Config:
        from_attributes = True
