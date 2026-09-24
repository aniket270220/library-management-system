from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Modern Library API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/books", response_model=List[schemas.BookResponse])
def get_books(db: Session = Depends(get_db)):
    return db.query(models.BookModel).all()

@app.post("/api/books", response_model=schemas.BookResponse)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    new_book = models.BookModel(**book.model_dump())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@app.post("/api/books/{book_id}/issue", response_model=schemas.BookResponse)
def issue_book(book_id: int, req: schemas.IssueRequest, db: Session = Depends(get_db)):
    book = db.query(models.BookModel).filter(models.BookModel.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.is_issued:
        raise HTTPException(status_code=400, detail="Book is already issued")
    
    book.is_issued = True
    book.issued_to = req.student_name
    db.commit()
    db.refresh(book)
    return book

@app.post("/api/books/{book_id}/return", response_model=schemas.BookResponse)
def return_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.BookModel).filter(models.BookModel.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if not book.is_issued:
        raise HTTPException(status_code=400, detail="Book is not issued")
    
    book.is_issued = False
    book.issued_to = None
    db.commit()
    db.refresh(book)
    return book

@app.delete("/api/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.BookModel).filter(models.BookModel.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": f"Book {book_id} deleted successfully"}