from fastapi import FastAPI
from app.database import engine, Base
from app.routers import student, teacher, quiz

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Learning Platform")

app.include_router(quiz.router)
app.include_router(student.router)
app.include_router(teacher.router)