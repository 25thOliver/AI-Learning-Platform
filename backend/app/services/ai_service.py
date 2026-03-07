from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key)

MODEL = "llama-3.1-8b-instant"


def generate_quiz(topic: str, difficulty: str) -> str:
    difficulty_guidance = {
        "easy": "Use simple vocabulary. Focus on basic definitions or fundamental concepts. "
                "The question should be answerable with a single word or short phrase.",
        "medium": "Expect some prior knowledge. Ask about how or why something works, "
                  "or require applying a concept to a simple scenario.",
        "hard": "Challenge the student with edge cases, multi-step reasoning, or nuanced "
                "distinctions that require deep understanding of the topic.",
    }.get(difficulty, "")

    prompt = f"""You are an experienced teacher creating a quiz question.

Topic: {topic}
Difficulty: {difficulty.upper()}
Guidance: {difficulty_guidance}

Rules:
- Ask ONE clear, unambiguous question
- Provide ONE concise correct answer (a word, phrase, or short sentence)
- Do NOT include explanations, multiple-choice options, or extra text

Format EXACTLY as:
Question: <your question here>
Answer: <your answer here>
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return response.choices[0].message.content


def generate_feedback(question: str, correct_answer: str, student_answer: str) -> str:
    is_correct_hint = (
        "The student answered correctly. Celebrate briefly, then deepen understanding."
        if student_answer.strip().lower() == correct_answer.strip().lower()
        else "The student answered incorrectly. Be kind, encouraging, and constructive."
    )

    prompt = f"""You are a warm, supportive learning assistant helping a student improve.

Quiz Question: {question}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}
Context: {is_correct_hint}

Provide feedback using this EXACT format (no extra text outside the sections):

1. Explanation:
<Explain why the correct answer is right in 2-3 clear sentences.>

2. Memory Tip:
<Give one short, memorable trick or analogy to help the student remember this concept.>

3. Simple Version:
<Re-explain the concept using very short sentences, everyday words, and one real-life example a 12-year-old would understand.>

Rules:
- Always use an encouraging, positive tone regardless of whether the answer was right or wrong
- Never use jargon without immediately explaining it
- Keep each section focused and under 4 sentences
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )
    return response.choices[0].message.content