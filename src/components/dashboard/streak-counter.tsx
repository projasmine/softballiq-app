"use client";

import { Flame } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

function getMilestone(streak: number): string | null {
  if (streak >= 30) return "Legend!";
  if (streak >= 10) return "MVP!";
  if (streak >= 5) return "On fire!";
  return null;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
}: StreakCounterProps) {
  const milestone = getMilestone(currentStreak);
  const highStreak = currentStreak >= 5;

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl p-4 border border-orange-500/20">
      <div className="relative">
        <Flame
          className={`${highStreak ? "h-12 w-12" : "h-10 w-10"} transition-all ${
            currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
          }`}
        />
        {currentStreak > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {currentStreak}
          </span>
        )}
      </div>
      <div>
        <p className="font-bold text-lg">
          {currentStreak} day{currentStreak !== 1 ? "s" : ""}
          {milestone && (
            <span className="ml-2 text-orange-400 text-sm">{milestone}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Best: {longestStreak} day{longestStreak !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
