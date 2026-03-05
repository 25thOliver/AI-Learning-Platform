from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Text, Boolean, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Student(Base):
    __tablename__="students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    second_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)

    quiz_attempts = relationship("QuizAttempt", back_populates="student")
    performance_logs = relationship("PerformanceLog", back_populates="student")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text)

    quizzes = relationship("Quiz", back_populates="topic")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    difficulty = Column(String(50), default="medium")

    topic = relationship("Topic", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), index=True)
    submitted_answer = Column(Text)
    is_correct = Column(Boolean)
    score = Column(Float)
    time_spent = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")


class PerformanceLog(Base):
    __tablename__ = "performance_logs"

    __tablename__ = "performance_logs"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), index=True)
    average_score = Column(Float)
    total_attempts = Column(Integer)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student = relationship("Student", back_populates="performance_logs")


class StudentTopicMastery(Base):
    __tablename__ = "student_topic_mastery"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), index=True)
    mastery_score = Column(Float, default=0.0)
    attempts = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student = relationship("Student")
    topic = relationship("Topic")