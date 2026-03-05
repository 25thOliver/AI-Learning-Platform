from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key)

MODEL = "llama-3.1-8b-instant"

def generate_quiz(topic: str, difficulty: str) -> str:
    prompt = f"""
    GENERATE ONE {difficulty} level quiz question about {topic}.

    Return format:
    Question:
    Answer:
    """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content

def generate_feedback(question, correct_answer, student_answer) -> str:
    prompt = f"""
    Question: {question}
    Correct Answer: {correct_answer}
    Student Answer: {student_answer}

    Provide: 
    1. Explanation
    2. Hint
    3. Simplified explanation for cognitive support
    """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content