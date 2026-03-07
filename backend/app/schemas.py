from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubmitAnswerRequest(BaseModel):
    student_id: int
    quiz_id: int
    submitted_answer: str
    time_spent: float

class StudentProgressResponse(BaseModel):
    student_id: int
    average_score: float
    total_attempts: int

class TeacherReportResponse(BaseModel):
    average_score_per_student: list
    average_score_per_topic: list
    struggling_students: list