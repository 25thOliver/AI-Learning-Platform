from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import QuizAttempt, Quiz
from app.schemas import SubmitAnswerRequest

router = APIRouter()

@router.post("/submit-answer")
def submit_answer(request: SubmitAnswerRequest, db: Session = Depends|(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == request.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    is_correct = request.submitted_answer.strip().lower() == correct_answer.strip().lower()
    score = 100.0 if is_correct else 0.0

    attempt = QuizAttempt(
        student_id=request.student_id,
        quiz_id=request.quiz_id,
        submitted_answer=request.submitted_answer,
        is_correct=is_correct,
        score=score,
        time_spent=request.time_spent,
    )

    db.add(attempt)
    db.commit()

    return {"correct": is_correct, "score": score}