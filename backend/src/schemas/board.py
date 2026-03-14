from pydantic import BaseModel


class BoardCreate(BaseModel):
    title: str


class BoardOut(BaseModel):
    id: int
    title: str
    
    class Config:
        from_attributes = True
