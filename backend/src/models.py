from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    boards = relationship("Board", back_populates="owner")

class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="boards")
    columns = relationship("BoardColumn", back_populates="board", cascade="all, delete")

class BoardColumn(Base):
    __tablename__ = "columns"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    order = Column(Integer)
    board_id = Column(Integer, ForeignKey("boards.id"))

    board = relationship("Board", back_populates="columns")
    cards = relationship("Card", back_populates="column", cascade="all, delete")

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True)
    content = Column(Text)
    order = Column(Integer)
    column_id = Column(Integer, ForeignKey("columns.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    column = relationship("BoardColumn", back_populates="cards")
    