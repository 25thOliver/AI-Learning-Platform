from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Topic, QuizAttempt, Quiz
from app.services.ai_service import generate_quiz
from app.services.personalization import determine_difficulty

router = APIRouter()

@router.post("/generate-quiz/{student_id}/{topic_id}")
def generate_ai_quiz(student_id: int, topic_id: int, db: Session = Depends(get_db)):

    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(404, "Topic not found")
    
    avg_score = db.query(func.avg(QuizAttempt.score)).filter(
        QuizAttempt.student_id == student_id
    ).scalar() or 0

    difficulty = determine_difficulty(avg_score)

    ai_output = generate_quiz(topic.name, difficulty)

    quiz = Quiz(
        topic_id=topic_id,
        question=ai_output,
        correct_answer="AI_GENERATED",
        difficulty=difficulty,
    )

    db.add(quiz)
    db.commit()

    return {
        "difficulty": difficulty,
        "quiz": ai_output,
    }