from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class BookModel(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    category = Column(String, default="General")
    is_issued = Column(Boolean, default=False)
    issued_to = Column(String, nullable=True, default=None)