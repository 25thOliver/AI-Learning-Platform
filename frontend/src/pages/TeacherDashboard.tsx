import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type TrendPoint } from "@/lib/api";
import StatCard from "@/components/StatCard";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Target, AlertTriangle, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const scoreColor = (score: number) =>
  score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";

const progressColor = (score: number) =>
  score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-destructive";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const report = useQuery({ queryKey: ["teacher-report"], queryFn: api.getTeacherReport });
  const [trendId, setTrendId] = useState("");
  const [trendData, setTrendData] = useState<TrendPoint[] | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  const viewTrend = async () => {
    if (!trendId) return;
    setTrendLoading(true); setTrendError(null); setTrendData(null);
    try {
      const data = await api.getStudentTrend(Number(trendId));
      setTrendData(data);
    } catch {
      setTrendError("Could not fetch trend data.");
    } finally {
      setTrendLoading(false);
    }
  };

  const data = report.data;
  const classAvg = data
    ? (data.average_score_per_student.reduce((s, x) => s + x.avg_score, 0) / (data.average_score_per_student.length || 1)).toFixed(1)
    : "–";

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Teacher Analytics Dashboard</h1>
        </div>

        {report.isLoading && <LoadingSpinner />}
        {report.isError && <ErrorMessage />}

        {data && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <StatCard title="Total Students" value={data.average_score_per_student.length} icon={Users} />
              <StatCard title="Class Average Score" value={`${classAvg}%`} icon={Target} variant="success" />
              <StatCard title="Struggling Students" value={data.struggling_students.length} icon={AlertTriangle} variant="destructive" />
            </div>

            {/* Student Performance Table */}
            <div className="mb-6 rounded-lg bg-card p-6 card-shadow">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Student Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Student ID</th>
                      <th className="pb-3 font-medium">Average Score</th>
                      <th className="pb-3 font-medium">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.average_score_per_student.map((s) => (
                      <tr key={s.student_id} className="border-b border-border/50">
                        <td className="py-3 font-medium text-card-foreground">{s.student_id}</td>
                        <td className={`py-3 font-semibold ${scoreColor(s.avg_score)}`}>{s.avg_score.toFixed(1)}%</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-2 w-full max-w-[200px] rounded-full bg-muted overflow-hidden">
                              <div className={`absolute inset-y-0 left-0 rounded-full ${progressColor(s.avg_score)}`} style={{ width: `${Math.min(s.avg_score, 100)}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Topic Difficulty Table */}
            <div className="mb-6 rounded-lg bg-card p-6 card-shadow">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Topic Difficulty</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Topic</th>
                      <th className="pb-3 font-medium">Average Score</th>
                      <th className="pb-3 font-medium">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.average_score_per_topic.map((t) => {
                      const diff = t.avg_score >= 70 ? "Easy" : t.avg_score >= 40 ? "Medium" : "Hard";
                      const diffClass = t.avg_score >= 70 ? "bg-success/10 text-success" : t.avg_score >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
                      return (
                        <tr key={t.topic} className="border-b border-border/50">
                          <td className="py-3 font-medium text-card-foreground">{t.topic}</td>
                          <td className={`py-3 font-semibold ${scoreColor(t.avg_score)}`}>{t.avg_score.toFixed(1)}%</td>
                          <td className="py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${diffClass}`}>{diff}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Struggling Students */}
            {data.struggling_students.length > 0 && (
              <div className="mb-6 rounded-lg bg-card p-6 card-shadow">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">⚠️ Struggling Students</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.struggling_students.map((s) => (
                    <div key={s.student_id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                      <div>
                        <p className="font-semibold text-card-foreground">Student {s.student_id}</p>
                        <p className="text-sm text-destructive">{s.avg_score.toFixed(1)}% average</p>
                      </div>
                      <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">Needs Support</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Trend Viewer */}
        <div className="rounded-lg bg-card p-6 card-shadow">
          <h3 className="mb-4 text-lg font-semibold text-card-foreground">Student Trend Viewer</h3>
          <div className="flex gap-3">
            <Input
              placeholder="Enter Student ID..."
              value={trendId}
              onChange={(e) => setTrendId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && viewTrend()}
              className="max-w-[200px]"
            />
            <Button onClick={viewTrend} disabled={!trendId}>View Trend</Button>
          </div>
          {trendLoading && <LoadingSpinner text="Loading trend..." />}
          {trendError && <div className="mt-4"><ErrorMessage message={trendError} /></div>}
          {trendData && trendData.length > 0 && (
            <div className="mt-4"><ScoreTrendChart data={trendData} /></div>
          )}
          {trendData && trendData.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">No trend data available for this student.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
