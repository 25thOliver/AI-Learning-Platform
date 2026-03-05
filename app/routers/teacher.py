from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import QuizAttempt, Quiz, Topic, Student


router = APIRouter()

@router.get("/teacher-report")
def get_teacher_report(db: Session = Depends(get_db)):
    avg_per_student = db.query(
        QuizAttempt.student_id,
        func.avg(QuizAttempt.score)
    ).group_by(QuizAttempt.student_id).all()

    avg_per_topic = db.query(
        Topic.name,
        func.avg(QuizAttempt.score)
    ).join(Quiz).join(QuizAttempt).group_by(Topic.name).all()

    struggling = db.query(
        QuizAttempt.student_id,
        func.avg(QuizAttempt.score).label("avg_score")
    ).group_by(QuizAttempt.student_id).having(
        func.avg(QuizAttempt.score) < 50
    ).all()

    return {
        "average_score_per_student": avg_per_student,
        "average_score_per_topic": avg_per_topic,
        "struggling_students": struggling,
    }

@router.get("/student-trend/{student_id}")
def get_student_trend(student_id: int, db: Session = Depends(get_db)):
    trend = db.query(
        QuizAttempt.created_at,
        QuizAttempt.score,
        Topic.name.label("topic")
    ).join(Quiz).join(Topic).filter(
        QuizAttempt.student_id == student_id
    ).order_by(QuizAttempt.created_at).all()

    return [
        {
            "date": str(row.created_at),
            "score": row.score,
            "topic": row.topic
        }
        for row in trend
    ]