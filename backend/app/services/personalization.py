from sqlalchemy.orm import Session
from app.models import StudentTopicMastery, QuizAttempt, Quiz

# Difficulty thresholds
EASY_THRESHOLD = 40.0
HARD_THRESHOLD = 70.0
MASTERY_THRESHOLD = 80.0 


def determine_difficulty(avg_score: float) -> str:
    """
    Adaptive difficulty based on a student's overall average score.

    < 40  → easy   (struggling — build confidence with fundamentals)
    40-69 → medium (developing — reinforce understanding)
    ≥ 70  → hard   (advanced — challenge with deeper concepts)
    """
    if avg_score >= HARD_THRESHOLD:
        return "hard"
    elif avg_score >= EASY_THRESHOLD:
        return "medium"
    else:
        return "easy"


def determine_difficulty_from_topic(topic_mastery_score: float) -> str:
    """
    Adaptive difficulty based on mastery of a specific topic.
    Preferred over overall average because it is topic-specific.

    < 40  → easy
    40-69 → medium
    ≥ 70  → hard
    """
    if topic_mastery_score >= HARD_THRESHOLD:
        return "hard"
    elif topic_mastery_score >= EASY_THRESHOLD:
        return "medium"
    else:
        return "easy"


def is_topic_mastered(mastery_score: float) -> bool:
    """Returns True when a student has mastered a topic (score ≥ 80%)."""
    return mastery_score >= MASTERY_THRESHOLD


def update_mastery(db: Session, student_id: int, topic_id: int) -> StudentTopicMastery | None:
    """
    Recalculates and persists a student's mastery score for a specific topic.

    Uses a weighted rolling average:
      - Recent attempts (last 5) are weighted twice as heavily as older ones.
      - Falls back to a simple average when fewer than 5 attempts exist.

    Returns the updated (or newly created) StudentTopicMastery record.
    Called automatically after every quiz attempt.
    """
    attempts = (
        db.query(QuizAttempt)
        .join(Quiz)
        .filter(
            QuizAttempt.student_id == student_id,
            Quiz.topic_id == topic_id,
        )
        .order_by(QuizAttempt.id)
        .all()
    )

    if not attempts:
        return None

    # Weighted average: recent 5 attempts count double
    RECENT_N = 5
    older = attempts[:-RECENT_N] if len(attempts) > RECENT_N else []
    recent = attempts[-RECENT_N:]

    older_scores = [a.score for a in older]
    recent_scores = [a.score for a in recent]

    total_weight = len(older_scores) + 2 * len(recent_scores)
    weighted_sum = sum(older_scores) + 2 * sum(recent_scores)
    avg_score = weighted_sum / total_weight if total_weight else 0.0

    mastery = (
        db.query(StudentTopicMastery)
        .filter_by(student_id=student_id, topic_id=topic_id)
        .first()
    )

    if mastery:
        mastery.mastery_score = round(avg_score, 2)
        mastery.attempts = len(attempts)
    else:
        mastery = StudentTopicMastery(
            student_id=student_id,
            topic_id=topic_id,
            mastery_score=round(avg_score, 2),
            attempts=len(attempts),
        )
        db.add(mastery)

    db.commit()
    db.refresh(mastery)
    return mastery