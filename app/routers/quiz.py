from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import QuizAttempt, Quiz, Student, PerformanceLog
from app.schemas import SubmitAnswerRequest
from app.services.ai_service import generate_feedback
from app.services.personalization import update_mastery

router = APIRouter()

@router.post("/submit-answer")
def submit_answer(request: SubmitAnswerRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    quiz = db.query(Quiz).filter(Quiz.id == request.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    is_correct = (
        request.submitted_answer.strip().lower()
        == quiz.correct_answer.strip().lower()
    )
    score = 100.0 if is_correct else 0.0

    attempt = QuizAttempt(
    student_id=request.student_id,
    quiz_id=request.quiz_id,
    topic_id=quiz.topic_id,
    submitted_answer=request.submitted_answer,
    is_correct=is_correct,
    score=score,
    time_spent=request.time_spent,
    )

    db.add(attempt)

    update_mastery(db, request.student_id, quiz.topic_id)

    db.commit()

    ai_feedback = generate_feedback(
        quiz.question,
        quiz.correct_answer,
        request.submitted_answer,
    )
    
    avg_score = db.query(func.avg(QuizAttempt.score)).filter(
        QuizAttempt.student_id == request.student_id
    ).scalar()

    total_attempts = db.query(func.count(QuizAttempt.id)).filter(
        QuizAttempt.student_id == request.student_id
    ).scalar()

    performance = db.query(PerformanceLog).filter(
        PerformanceLog.student_id == request.student_id
    ).first()

    if performance:
        performance.average_score =avg_score
        performance.total_attempts = total_attempts
    else:
        performance = PerformanceLog(
            student_id=request.student_id,
            average_score=avg_score,
            total_attempts=total_attempts,
        )
        db.add(performance)

    db.commit()


    return {"correct": is_correct,
            "score": score,
            "feedback": ai_feedback,
            "average_score": round(avg_score, 2),
            "total_attempts": total_attempts,
            }