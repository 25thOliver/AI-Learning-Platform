def determine_difficulty(avg_score: float) -> str:
    if avg_score >= 80:
        return "hard"
    if avg_score >= 50:
        return "medium"
    return "easy"