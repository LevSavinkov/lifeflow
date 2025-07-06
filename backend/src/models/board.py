from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.src.database import Base


class Board(Base):
    __tablename__ = "boards"
    
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    owner = relationship("User", back_populates="boards")
    columns = relationship("BoardColumn", back_populates="board", cascade="all, delete")
