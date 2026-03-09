import { useState, useRef, useEffect, useCallback } from "react";
import { api, type SubmitAnswerResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import ReactMarkdown from "react-markdown";
import { Send, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

const TOPICS = [
  { id: 1, name: "Algebra" },
  { id: 2, name: "Biology" },
  { id: 3, name: "Python Basics" },
  { id: 4, name: "Physics Fundamentals" },
  { id: 5, name: "World History" },
  { id: 6, name: "English Writing" },
  { id: 7, name: "Economics Basics" },
];

interface QuizState {
  question: string;
  quizId: number;
  difficulty: string;
}

const QuizSection = ({ studentId }: { studentId: number }) => {
  const [topicId, setTopicId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const startTimer = useCallback(() => {
    timerRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - timerRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    return (Date.now() - timerRef.current) / 1000;
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const generateQuiz = async () => {
    if (!topicId) return;
    setError(null); setResult(null); setQuiz(null); setAnswer(""); setLoading(true);
    try {
      const data = await api.generateQuiz(studentId, topicId);
      setQuiz({ question: data.question, quizId: data.quiz_id, difficulty: data.difficulty });
      setElapsed(0);
      startTimer();
    } catch {
      setError("Could not generate quiz — is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!quiz || !answer.trim()) return;
    setSubmitting(true); setError(null);
    const timeSpent = stopTimer();
    try {
      const res = await api.submitAnswer({
        student_id: studentId,
        quiz_id: quiz.quizId,
        submitted_answer: answer,
        time_spent: parseFloat(timeSpent.toFixed(1)),
      });
      setResult(res);
    } catch {
      setError("Could not submit answer — is the API running?");
    } finally {
      setSubmitting(false);
    }
  };

  const tryAnother = () => {
    setQuiz(null); setAnswer(""); setResult(null); setError(null); setElapsed(0);
  };

  const parseFeedback = (fb: string) => {
    const sections: { title: string; content: string }[] = [];
    const patterns = [
      { title: "Explanation", regex: /(?:\*\*)?Explanation(?:\*\*)?[:\s]*([\s\S]*?)(?=(?:\*\*)?Hint|(?:\*\*)?Simple|$)/i },
      { title: "Hint for Next Time", regex: /(?:\*\*)?Hint[^:]*(?:\*\*)?[:\s]*([\s\S]*?)(?=(?:\*\*)?Simple|$)/i },
      { title: "Simple Version", regex: /(?:\*\*)?Simple[^:]*(?:\*\*)?[:\s]*([\s\S]*)/i },
    ];
    patterns.forEach(({ title, regex }) => {
      const match = fb.match(regex);
      if (match) sections.push({ title, content: match[1].trim() });
    });
    if (sections.length === 0) sections.push({ title: "Feedback", content: fb });
    return sections;
  };

  return (
    <div className="rounded-lg bg-card p-6 card-shadow">
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">Take a Quiz</h3>

      {!quiz && !loading && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Select Topic</label>
            <Select onValueChange={(v) => setTopicId(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Choose a topic..." /></SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateQuiz} disabled={!topicId}>Generate Quiz</Button>
        </div>
      )}

      {loading && <LoadingSpinner text="AI is generating your question..." />}

      {error && <ErrorMessage message={error} />}

      {quiz && !result && (
        <div className="animate-slide-up space-y-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {quiz.difficulty}
            </span>
            <span className="text-sm font-mono text-muted-foreground">⏱ {elapsed}s</span>
          </div>
          <p className="text-base leading-relaxed text-card-foreground">{quiz.question}</p>
          <div className="flex gap-3">
            <Input
              placeholder="Type your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
              className="flex-1"
            />
            <Button onClick={submitAnswer} disabled={submitting || !answer.trim()}>
              {submitting ? <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="animate-slide-up space-y-4">
          <div className={`flex items-center gap-3 rounded-lg p-4 ${result.correct ? "bg-success/10" : "bg-destructive/10"}`}>
            {result.correct ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            <span className={`text-lg font-bold ${result.correct ? "text-success" : "text-destructive"}`}>
              {result.correct ? "Correct!" : "Incorrect"}
            </span>
            <span className="ml-auto text-sm text-muted-foreground">Score: {result.score}</span>
          </div>

          {parseFeedback(result.feedback).map((section) => (
            <div key={section.title} className="rounded-lg border border-border bg-secondary/30 p-4">
              <h4 className="mb-2 text-sm font-semibold text-primary">{section.title}</h4>
              <div className="prose prose-sm max-w-none text-card-foreground">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          <Button onClick={tryAnother} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Another Question
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
