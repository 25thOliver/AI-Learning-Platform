from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


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


class StudentBase(BaseModel):
    first_name: str
    second_name: str
    email: EmailStr


class StudentCreate(StudentBase):
    pass


class StudentLogin(BaseModel):
    email: EmailStr


class StudentOut(BaseModel):
    id: int
    first_name: str
    second_name: str
    email: EmailStr

    class Config:
        orm_mode = True