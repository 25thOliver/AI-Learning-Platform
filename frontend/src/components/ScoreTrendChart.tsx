import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TrendPoint } from "@/lib/api";

const TOPIC_COLORS: Record<string, string> = {
  Algebra: "#1E3A8A",
  Biology: "#22C55E",
  "Python Basics": "#F59E0B",
};

const ScoreTrendChart = ({ data }: { data: TrendPoint[] }) => {
  const topics = [...new Set(data.map((d) => d.topic))];

  // Group by date, spread scores per topic
  const grouped: Record<string, Record<string, number | string>> = {};
  data.forEach(({ date, score, topic }) => {
    if (!grouped[date]) grouped[date] = { date };
    grouped[date][topic] = score;
  });
  const chartData = Object.values(grouped).sort(
    (a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
  );

  return (
    <div className="rounded-lg bg-card p-6 card-shadow">
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">Score Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {topics.map((topic) => (
            <Line
              key={topic}
              type="monotone"
              dataKey={topic}
              stroke={TOPIC_COLORS[topic] || "#6366F1"}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreTrendChart;
