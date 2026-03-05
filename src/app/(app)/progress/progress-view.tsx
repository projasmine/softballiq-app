"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ProgressViewProps {
  data: {
    categoryStats: {
      category: string;
      correct: number;
      total: number;
      accuracy: number;
    }[];
    trend: { date: string; accuracy: number }[];
  } | null;
}

export function ProgressView({ data }: ProgressViewProps) {
  if (!data) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Complete some quizzes to see your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  const radarData = data.categoryStats.map((s) => ({
    subject: s.category.charAt(0).toUpperCase() + s.category.slice(1),
    value: s.accuracy,
    fullMark: 100,
  }));

  const hasData = data.categoryStats.some((s) => s.total > 0);

  return (
    <div className="space-y-6">
      {/* Radar chart */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-4">Category Breakdown</h3>
          {hasData ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#999", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#666", fontSize: 10 }}
                />
                <Radar
                  name="Accuracy"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Answer more questions to see your breakdown
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category stats */}
      <div className="grid grid-cols-2 gap-3">
        {data.categoryStats.map((stat) => (
          <Card key={stat.category}>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground capitalize">
                {stat.category}
              </p>
              <p className="text-2xl font-bold">{stat.accuracy}%</p>
              <p className="text-xs text-muted-foreground">
                {stat.correct}/{stat.total} correct
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend chart */}
      {data.trend.length > 1 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-4">Accuracy Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#999", fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#999", fontSize: 10 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
