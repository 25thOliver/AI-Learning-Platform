import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import StatCard from "@/components/StatCard";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import QuizSection from "@/components/QuizSection";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Target, Hash, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const StudentDashboard = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const idParam = params.get("id");
  const studentId = idParam ? Number(idParam) : NaN;

  // If the student code is missing or invalid, send the user back home
  useEffect(() => {
    if (!idParam || Number.isNaN(studentId)) {
      navigate("/", { replace: true });
    }
  }, [idParam, studentId, navigate]);

  // Avoid rendering while redirecting
  if (!idParam || Number.isNaN(studentId)) {
    return null;
  }

  const progress = useQuery({
    queryKey: ["student-progress", studentId],
    queryFn: () => api.getStudentProgress(studentId),
  });

  const trend = useQuery({
    queryKey: ["student-trend", studentId],
    queryFn: () => api.getStudentTrend(studentId),
  });

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              My Learning Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Signed in as student code {studentId}
            </p>
          </div>
        </div>

        {progress.isLoading && <LoadingSpinner />}
        {progress.isError && <ErrorMessage />}

        {progress.data && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <StatCard
              title="Average Score"
              value={`${progress.data.average_score.toFixed(1)}%`}
              icon={Target}
              variant="default"
            />
            <StatCard
              title="Total Attempts"
              value={progress.data.total_attempts}
              icon={Hash}
              variant="success"
            />
          </div>
        )}

        {trend.isLoading && (
          <LoadingSpinner text="Loading trend data..." />
        )}
        {trend.isError && <ErrorMessage />}
        {trend.data && trend.data.length > 0 && (
          <div className="mb-6">
            <ScoreTrendChart data={trend.data} />
          </div>
        )}

        <QuizSection studentId={studentId} />
      </div>
    </div>
  );
};

export default StudentDashboard;