import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import QuizAttempt, Quiz, Student, PerformanceLog, StudentTopicMastery
from app.schemas import SubmitAnswerRequest
from app.services.ai_service import generate_feedback
from app.services.personalization import update_mastery

router = APIRouter()


def _clean(text: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    text = text.strip().lower()
    text = re.sub(r"[^\w\s]", "", text)   # remove punctuation
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _answers_match(student: str, correct: str) -> bool:
    """
    Return True when the student's answer is functionally equivalent to the
    stored correct answer.

    Handles common LLM quirks:
      - trailing punctuation   ("Photosynthesis." vs "Photosynthesis")
      - extra preamble phrases ("The process of photosynthesis" vs "photosynthesis")
      - minor casing/spacing differences
    """
    s = _clean(student)
    c = _clean(correct)
    if s == c:
        return True
    # Bidirectional containment: covers cases where the LLM stored a phrase
    # but the student correctly named just the key term, or vice-versa.
    # The len >= 3 guard prevents single-letter false positives.
    if len(s) >= 3 and len(c) >= 3:
        if s in c or c in s:
            return True
    return False

@router.post("/submit-answer")
def submit_answer(request: SubmitAnswerRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    quiz = db.query(Quiz).filter(Quiz.id == request.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    is_correct = _answers_match(request.submitted_answer, quiz.correct_answer)
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
    db.flush()

    # AI Feedback — pass the pre-computed correctness so the LLM narrative
    # is always consistent with the badge shown to the student.
    ai_feedback = generate_feedback(
        quiz.question,
        quiz.correct_answer,
        request.submitted_answer,
        is_correct=is_correct,
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

    # Update student topic mastery
    topic_id = quiz.topic_id
    topic_mastery = db.query(StudentTopicMastery).filter(
        StudentTopicMastery.student_id == request.student_id,
        StudentTopicMastery.topic_id == topic_id
    ).first()

    if topic_mastery:
        topic_mastery.attempts += 1
        topic_mastery.mastery_score = (topic_mastery.mastery_score * (topic_mastery.attempts - 1) + score) / topic_mastery.attempts
    else:
        topic_mastery = StudentTopicMastery(
            student_id=request.student_id,
            topic_id=topic_id,
            mastery_score=score,
            attempts=1
        )
        db.add(topic_mastery)

    db.commit()


    return {"correct": is_correct,
            "score": score,
            "feedback": ai_feedback,
            "average_score": round(avg_score, 2),
            "total_attempts": total_attempts,
            }