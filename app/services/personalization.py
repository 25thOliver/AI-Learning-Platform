from sqlalchemy.orm import Session
from app.models import StudentTopicMastery, QuizAttempt

def update_mastery(db: Session, student_id: int, topic_id: int):

    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == student_id,
        QuizAttempt.topic_id == topic_id
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