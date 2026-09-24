from pydantic import BaseModel
from typing import Optional

class BookCreate(BaseModel):
    title: str
    author: str
    category: Optional[str] = "General"

class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    category: str
    is_issued: bool
    issued_to: Optional[str] = None

    class Config:
        from_attributes = True

class IssueRequest(BaseModel):
    student_name: str