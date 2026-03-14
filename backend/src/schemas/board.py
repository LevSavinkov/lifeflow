from pydantic import BaseModel, model_validator


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
        from_attributes = True

    @model_validator(mode="before")
    @classmethod
    def from_card(cls, v):
        if hasattr(v, "content"):
            return {"id": v.id, "text": v.content, "done": v.done}
        return v
