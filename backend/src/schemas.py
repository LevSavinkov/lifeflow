from pydantic import BaseModel


class BoardCreate(BaseModel):
    title: str


class BoardOut(BaseModel):
    id: int
    title: str

    class Config:
        orm_mode = True


class GoalBase(BaseModel):
    text: str


class GoalCreate(GoalBase):
    pass


class GoalOut(GoalBase):
    id: int
    done: bool

    class Config:
        orm_mode = True
