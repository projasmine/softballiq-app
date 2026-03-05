"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target } from "lucide-react";

interface LeaderboardViewProps {
  data: {
    players: {
      userId: string;
      displayName: string;
      totalScore: number;
      totalQuestions: number;
      accuracy: number;
      currentStreak: number;
    }[];
    teamName: string;
  } | null;
}

export function LeaderboardView({ data }: LeaderboardViewProps) {
  if (!data || data.players.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No scores yet. Complete quizzes to appear on the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-3">
      {data.teamName && (
        <p className="text-sm text-muted-foreground">{data.teamName}</p>
      )}

      {data.players.map((player, i) => (
        <Card
          key={player.userId}
          className={i < 3 ? "border-primary/20" : ""}
        >
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <div className="w-8 text-center">
              {i < 3 ? (
                <span className="text-xl">{medals[i]}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-mono">
                  {i + 1}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{player.displayName}</p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {player.accuracy}%
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {player.currentStreak}d
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{player.totalScore}</p>
              <p className="text-xs text-muted-foreground">pts</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
