"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { categoryLabel } from "@/lib/utils";
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
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center text-center min-h-[40vh] justify-center gap-3">
            <Brain className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-semibold">Your stats are waiting!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your first daily rep and we&apos;ll start tracking your accuracy, streaks, and category breakdowns.
              </p>
            </div>
            <Button asChild className="mt-2">
              <Link href="/daily-rep">Start Your First Rep</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const radarData = data.categoryStats.map((s) => ({
    subject: categoryLabel[s.category] ?? s.category,
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
            <div className="flex flex-col items-center text-center py-8 gap-2">
              <Brain className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Keep answering questions to unlock your category breakdown!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category stats */}
      <div className="grid grid-cols-2 gap-3">
        {data.categoryStats.map((stat) => (
          <Card key={stat.category}>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground">
                {categoryLabel[stat.category] ?? stat.category}
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
