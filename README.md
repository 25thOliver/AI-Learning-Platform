# AI-Powered Personalized Learning Platform

An adaptive learning backend built with **FastAPI**, **PostgreSQL**, and **Groq AI** (LLaMA 3.1).
The system personalizes quiz difficulty based on student performance, provides AI-generated
feedback, and gives teachers analytics dashboards.

---

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Backend     | FastAPI (Python)        |
| Database    | PostgreSQL 15           |
| AI          | Groq API (LLaMA 3.1)   |
| ORM         | SQLAlchemy              |
| Container   | Docker + Docker Compose |

---

## Project Structure

```text
ai-learning-platform/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment variable settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── routers/
│   │   ├── ai.py            # AI quiz generation
│   │   ├── quiz.py          # Answer submission + grading
│   │   ├── student.py       # Student progress
│   │   └── teacher.py       # Teacher analytics
│   └── services/
│       ├── ai_service.py    # Groq API integration
│       └── personalization.py  # Adaptive difficulty logic
├── schema.sql               # Database schema
├── seed_data.sql            # Sample test data
├── employees.sql            # SQL practice component
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```


## Setup & Running

### Prerequisites
- Docker and Docker Compose installed
- A [Groq API key](https://console.groq.com/)

### 1. Clone the repository
```bash
git clone https://github.com/25thOliver/AI-Learning-Platform.git
cd AI-Learning-Platform
```

### 2. Create a [.env](cci:7://file:///home/oliver/Documents/ai-learning-platform/.env:0:0-0:0) file
```env
DATABASE_URL=postgresql://postgres:password@db:5432/ai_learning
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Start the containers
```bash
docker compose up --build -d
```

The API will be available at: `http://localhost:8000`

---

## API Endpoints

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student-progress/{student_id}` | Returns avg score and total attempts |

### Teacher Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teacher-report` | Avg scores per student and topic; struggling students |
| GET | `/student-trend/{student_id}` | Score progression over time |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate-quiz/{student_id}/{topic_id}` | AI generates adaptive quiz question |
| POST | `/submit-answer` | Submit answer, receive grade + AI feedback |

**Submit Answer Request Body:**
```json
{
  "student_id": 1,
  "quiz_id": 3,
  "submitted_answer": "mitochondria",
  "time_spent": 25.0
}
```

---

## Personalization Logic

Difficulty is adapted based on a student's average score:

| Score Range   | Difficulty |
|---------------|------------|
| Below 40%     | Easy       |
| 40% – 69%     | Medium     |
| 70% and above | Hard       |

After every submission, the student's per-topic mastery score is recalculated
and stored, enabling topic-specific difficulty targeting.

---

## Inclusivity Features

- **Simplified explanations** — every AI feedback response includes a plain-language
  summary designed for students who need cognitive support
- **Structured feedback** — responses are split into: Explanation, Hint, and Simple Version
- **Adaptive difficulty** — students are never pushed beyond their current capability

---

## Database Schema

- `students` — student profiles
- `topics` — subject areas
- `quizzes` — questions with difficulty and correct answer
- `quiz_attempts` — every student submission with score and timestamp
- `performance_logs` — running average per student
- `student_topic_mastery` — per-topic mastery score per student

See [schema.sql](./schema.sql) for the full schema.

---

## SQL Practice Component

See [employees.sql](./employees.sql) for the standalone SQL exercise demonstrating
the `CONCAT` function and `ALTER TABLE` to create a `FULL_NAME` column.

---