from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import QuizAttempt
from app.schemas import StudentProgressResponse

router = APIRouter()

@router.get("/student-progress/{student_id}", response_model=StudentProgressResponse)
def get_student_progres(student_id: int, db: Session = Depends(get_db)):
    avg_score = db.query(func.avg(QuizAttempt.score)).filter(
        QuizAttempt.student_id == student_id
    ).scalar() or 0.0

    total_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == student_id
    ).count()

    return StudentProgressResponse(
        student_id=student_id,
        average_score=round(avg_score, 2),
        total_attempts=total_attempts,
    )