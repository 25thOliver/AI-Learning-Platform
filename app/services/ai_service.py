from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key)

MODEL = "llama-3.1-8b-instant"

def generate_quiz(topic: str, difficulty: str) -> str:
    prompt = f"""
    You are a helpful teacher creating a quiz for a student.
    Generate ONE {difficulty}-level quiz question about: {topic}

    Rules:
    - Ask ONE clear question only
    - Provide ONE correct answer
    - Keep language simple and direct
    - Do NOT include explanations, just the question and answer

    Format strictly as:
    Question: <your question here>  
    Answer: <your answer here>
    """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content

def generate_feedback(question: str, correct_answer: str, student_answer: str) -> str:
    prompt = f"""
    You are a supportive and inclusive learning assistant helping a student.

    Quiz Question: {question}
    Correct Answer: {correct_answer}
    Student Answer: {student_answer}

    Provide feedback in this EXACT format: 
    1. Explanation:
    <Explain why the correct answer is right in 2-3 simple sentences.>
    2. Hint for the next time:
    <Give a short memory tip or trick to remember this concept.>
    3. Simplified explanation for cognitive support
    <Re-explain using very short sentences, simple words, and a real-life example.>

    Keep the tone positive and encouraging even if the answer is wrong.
    """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content