"use client";

import { Flame } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

function getMilestone(streak: number): string | null {
  if (streak >= 30) return "Legend";
  if (streak >= 10) return "MVP";
  if (streak >= 5) return "On fire";
  return null;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
}: StreakCounterProps) {
  const milestone = getMilestone(currentStreak);

  return (
    <div className="flex items-center gap-3 rounded-xl p-4 border border-border bg-card">
      <Flame
        className={`h-8 w-8 ${
          currentStreak > 0 ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <div className="flex-1">
        <p className="font-bold">
          {currentStreak} day{currentStreak !== 1 ? "s" : ""}
          {milestone && (
            <span className="ml-2 text-primary text-xs font-semibold">{milestone}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Best: {longestStreak} day{longestStreak !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
