from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Quiz, QuizAttempt, Topic
from app.services.ai_service import generate_quiz
from app.services.personalization import determine_difficulty

router = APIRouter()


@router.post("/generate-quiz/{student_id}/{topic_id}")
def generate_ai_quiz(student_id: int, topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(404, "Topic not found")

    avg_score = (
        db.query(func.avg(QuizAttempt.score))
        .filter(QuizAttempt.student_id == student_id)
        .scalar()
        or 0
    )

    difficulty = determine_difficulty(avg_score)

    ai_output = generate_quiz(topic.name, difficulty)

    # Parse LLM output of the form
    # Question
    # Answer
    question_text = ai_output.strip()
    correct_answer = "AI_GENERATED"

    lower = ai_output.lower()
    if "question:" in lower and "answer:" in lower:
        # Do a simple, case-insensitive split
        try:
            _, after_question = ai_output.split("Question:", 1)
            question_part, answer_part = after_question.split("Answer:", 1)
            question_text = question_part.strip()
            # Take only the first non-empty line: the LLM sometimes appends
            # extra sentences/notes after the answer on subsequent lines.
            first_line = next(
                (ln.strip() for ln in answer_part.splitlines() if ln.strip()), ""
            )
            correct_answer = first_line if first_line else answer_part.strip()
        except ValueError:
            # Fall back to raw output if the format isn't exactly as expected
            question_text = ai_output.strip()
            correct_answer = ai_output.strip()

    quiz = Quiz(
        topic_id=topic_id,
        question=question_text,
        correct_answer=correct_answer,
        difficulty=difficulty,
    )

    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return {
        "difficulty": difficulty,
        "question": question_text,
        "quiz_id": quiz.id,
    }