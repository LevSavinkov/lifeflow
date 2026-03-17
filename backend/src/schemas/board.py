from pydantic import BaseModel, model_validator


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
    done: bool
    column_title: str = "to do"

    class Config:
        from_attributes = True

    @model_validator(mode="before")
    @classmethod
    def from_card(cls, v):
        if hasattr(v, "content"):
            col = getattr(v, "column", None)
            return {
                "id": v.id,
                "text": v.content,
                "done": v.done,
                "column_title": col.title if col else "to do",
            }
        return v
