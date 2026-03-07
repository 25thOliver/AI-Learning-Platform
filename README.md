# AI Learning Platform 

An adaptive, AI-powered learning platform that personalises quiz difficulty in real time using a weighted mastery scoring system and generates contextual feedback via the Groq LLM API.

---

## Project Structure

```text
ai-learning-platform/          ← git repo root
├── backend/
│   ├── app/                   ← FastAPI application
│   │   ├── routers/           ← API route handlers (quiz, student, teacher, ai)
│   │   ├── services/          ← Business logic (ai_service, personalization)
│   │   ├── config.py          ← Settings (reads .env)
│   │   ├── database.py        ← SQLAlchemy engine & session
│   │   ├── main.py            ← FastAPI app factory
│   │   ├── models.py          ← ORM models
│   │   └── schemas.py         ← Pydantic schemas
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── schema.sql             ← DB schema (auto-loaded on first run)
│   ├── seed_data.sql          ← Seed data (auto-loaded on first run)
│   └── employees.sql          ← SQL practice file (FULL_NAME column demo)
├── frontend/                  ← (clone separately — see below)
├── docker-compose.yml         ← Orchestrates db + api (+ frontend placeholder)
├── .env                       ← Environment variables (never commit)
└── README.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2 |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> ai-learning-platform
cd ai-learning-platform

# 2. Create the environment file
cp .env.example .env          # then fill in GROQ_API_KEY

# 3. Start all services
docker compose up --build -d

# 4. Confirm the API is live
curl http://localhost:8000/docs
```

The Postgres database is initialised automatically on first run from `schema.sql` and `seed_data.sql`.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | API key from [console.groq.com](https://console.groq.com) |
| `DATABASE_URL` | Set automatically by docker-compose |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/student-progress/{id}` | Student mastery scores by topic |
| `POST` | `/quiz/attempt` | Submit a quiz attempt and get AI feedback |
| `GET` | `/teacher-report` | Aggregated report: all students & topic mastery |
| `POST` | `/ai/generate-quiz` | Generate an adaptive quiz question |

Full interactive docs: `http://localhost:8000/docs`

---

## Adaptive Learning System

Quiz difficulty adapts per topic based on a **weighted rolling average**:
- The last 5 attempts count **twice** as heavily as older ones
- This ensures recent performance drives difficulty faster than historical scores

| Mastery Score | Difficulty Assigned |
|--------------|-------------------|
| < 40% | Easy |
| 40 – 69% | Medium |
| ≥ 70% | Hard |
| ≥ 80% | Topic considered mastered |

---

## SQL Practice — `employees.sql`

`backend/employees.sql` demonstrates:
1. Creating an `employees` table with `first_name` / `second_name` fields
2. Using `CONCAT` to build a computed `full_name` in a `SELECT`
3. Adding a permanent `FULL_NAME` column via `ALTER TABLE`
4. Populating it with `UPDATE`
5. Bonus analytics: average salary by country, employees above average salary

Run it inside the DB container:
```bash
docker exec -i ai_learning_db psql -U postgres -d ai_learning < backend/employees.sql
```

---

## Development

```bash
# View logs
docker compose logs -f api

# Rebuild after code changes
docker compose up --build -d

# Stop everything (keep data)
docker compose down

# Stop + wipe DB volume
docker compose down -v
```

---

## Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy
- **Database**: PostgreSQL 15
- **AI**: Groq API (`llama-3.1-8b-instant`)
- **Containerisation**: Docker, Docker Compose
