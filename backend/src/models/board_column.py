from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.src.database import Base


class BoardColumn(Base):
    __tablename__ = "columns"
    
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    order = Column(Integer)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    
    board = relationship("Board", back_populates="columns")
    cards = relationship("Card", back_populates="column", cascade="all, delete")
