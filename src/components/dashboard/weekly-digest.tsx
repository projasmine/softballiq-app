"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { getWeeklyDigest } from "@/app/actions";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface DigestData {
  players: {
    id: string;
    displayName: string;
    completions: boolean[];
  }[];
  todayIndex: number;
}

export function WeeklyDigest() {
  const [data, setData] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyDigest()
      .then((result) => {
        if (result) setData(result);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Weekly Reps
          </p>
          <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.players.length === 0) {
    return (
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Weekly Reps
          </p>
          <p className="text-sm text-muted-foreground text-center py-4">
            No players on the team yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const { players, todayIndex } = data;

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Weekly Reps
        </p>

        {/* Header row */}
        <div className="grid" style={{ gridTemplateColumns: "1fr repeat(7, 32px) 48px" }}>
          <div />
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className={`text-center text-[10px] font-semibold pb-1 ${
                i === todayIndex
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </div>
          ))}
          <div className="text-center text-[10px] font-semibold text-muted-foreground pb-1">
            %
          </div>
        </div>

        {/* Player rows */}
        <div className="space-y-1.5">
          {players.map((player) => {
            const completed = player.completions.filter(Boolean).length;
            const daysElapsed = todayIndex + 1;

            return (
              <div
                key={player.id}
                className="grid items-center"
                style={{ gridTemplateColumns: "1fr repeat(7, 32px) 48px" }}
              >
                <p className="text-xs font-medium truncate pr-2">
                  {player.displayName}
                </p>
                {player.completions.map((done, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center ${
                      i === todayIndex ? "rounded bg-primary/10" : ""
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                    )}
                  </div>
                ))}
                <p
                  className={`text-center text-xs font-semibold ${
                    completed === daysElapsed
                      ? "text-green-500"
                      : completed > 0
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {completed}/{daysElapsed}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
