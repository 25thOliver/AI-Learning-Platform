from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import QuizAttempt, Student
from app.schemas import (
    StudentCreate,
    StudentLogin,
    StudentOut,
    StudentProgressResponse,
)

router = APIRouter()


@router.get("/student-progress/{student_id}", response_model=StudentProgressResponse)
def get_student_progres(student_id: int, db: Session = Depends(get_db)):
    avg_score = (
        db.query(func.avg(QuizAttempt.score))
        .filter(QuizAttempt.student_id == student_id)
        .scalar()
        or 0.0
    )

    total_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student_id)
        .count()
    )

    return StudentProgressResponse(
        student_id=student_id,
        average_score=round(avg_score, 2),
        total_attempts=total_attempts,
    )


@router.post("/students", response_model=StudentOut)
def create_or_get_student(payload: StudentCreate, db: Session = Depends(get_db)):
    """
    Sign up a new student, or return the existing student if email already exists.
    """
    student = db.query(Student).filter(Student.email == payload.email).first()
    if student:
        return student

    student = Student(
        first_name=payload.first_name,
        second_name=payload.second_name,
        email=payload.email,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.post("/students/login", response_model=StudentOut)
def login_student(payload: StudentLogin, db: Session = Depends(get_db)):
    """
    Sign in an existing student by email.
    """
    student = db.query(Student).filter(Student.email == payload.email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student