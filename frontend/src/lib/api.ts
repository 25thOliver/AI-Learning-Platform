const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export interface StudentProgress {
  student_id: number;
  average_score: number;
  total_attempts: number;
}

export interface TrendPoint {
  date: string;
  score: number;
  topic: string;
}

export interface TeacherReport {
  average_score_per_student: { student_id: number; avg_score: number }[];
  average_score_per_topic: { topic: string; avg_score: number }[];
  struggling_students: { student_id: number; avg_score: number }[];
}

export interface GeneratedQuiz {
  difficulty: string;
  quiz: string;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  score: number;
  feedback: string;
  average_score: number;
  total_attempts: number;
}

export interface Student {
  id: number;
  first_name: string;
  second_name: string;
  email: string;
}

export const api = {
  getStudentProgress: (id: number) =>
    fetchApi<StudentProgress>(`/student-progress/${id}`),

  getStudentTrend: (id: number) =>
    fetchApi<TrendPoint[]>(`/student-trend/${id}`),

  getTeacherReport: () =>
    fetchApi<TeacherReport>("/teacher-report"),

  generateQuiz: (studentId: number, topicId: number) =>
    fetchApi<GeneratedQuiz>(`/generate-quiz/${studentId}/${topicId}`, { method: "POST" }),

  submitAnswer: (body: {
    student_id: number;
    quiz_id: number;
    submitted_answer: string;
    time_spent: number;
  }) =>
    fetchApi<SubmitAnswerResponse>("/submit-answer", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  signupStudent: (body: {
    first_name: string;
    second_name: string;
    email: string;
  }) =>
    fetchApi<Student>("/students", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  loginStudent: (body: { email: string }) =>
    fetchApi<Student>("/students/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
