-- schema.sql

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    second_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id),
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    difficulty VARCHAR(50)
);

CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    quiz_id INTEGER REFERENCES quizzes(id),
    submitted_answer TEXT,
    is_correct BOOLEAN,
    score FLOAT,
    time_spent FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE performance_logs (
    id SERIAL PRIMARY KEY,
    student_id INTEGER UNIQUE REFERENCES students(id),
    average_score FLOAT,
    total_attempts INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_topic_mastery (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    topic_id INT REFERENCES topics(id),

    mastery_score FLOAT DEFAULT 0,
    attempts INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(student_id, topic_id)
);