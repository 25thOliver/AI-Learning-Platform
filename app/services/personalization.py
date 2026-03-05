from sqlalchemy.orm import Session
from app.models import StudentTopicMastery, QuizAttempt, Quiz

def determine_difficulty(avg_score: float) -> str:
    """
    Adaptive difficulty level based on student's average score.
    - Below 40% -> easy  (struggling student)
    - 40% - 69% -> medium (developing student)
    - 70% and above -> hard  (advanced student`)
    """
    if avg_score >= 70:
        return "hard"
    elif avg_score >= 40:
        return "medium"
    else:
        return "easy"

def determine_difficulty_from_topic(topic_mastery_score: float) -> str:
    """
    Adaptive difficulty based on mastery of a specific topic.
    More precise than using overall average score.
    """
    if topic_mastery_score >= 70:
        return "hard"
    elif topic_mastery_score >= 40:
        return "medium"
    else:
        return "easy"

def update_mastery(db: Session, student_id: int, topic_id: int):
    """
    Recalculates and updates a student's mastery score for a specific topic.
    Called after every quiz attempt.
    """

    attempts = db.query(QuizAttempt).join(Quiz).filter(
        QuizAttempt.student_id == student_id,
        Quiz.topic_id == topic_id
    ).all()

    if not attempts:
        return
    
    avg_score = sum(a.score for a in attempts) / len(attempts)

    mastery = db.query(StudentTopicMastery).filter_by(
        student_id=student_id,
        topic_id=topic_id   
    ).first()

    if mastery:
        mastery.mastery_score = avg_score
        mastery.attempts = len(attempts)
    else:
        mastery = StudentTopicMastery(
            student_id=student_id,
            topic_id=topic_id,
            mastery_score=avg_score,
            attempts=len(attempts)
        )
        db.add(mastery)

    db.commit()