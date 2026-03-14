from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.src.database import Base


class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True)
    content = Column(Text)
    order = Column(Integer)
    column_id = Column(Integer, ForeignKey("columns.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    column = relationship("BoardColumn", back_populates="cards")
