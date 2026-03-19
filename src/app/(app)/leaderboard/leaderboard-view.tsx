"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, Zap } from "lucide-react";

interface LeaderboardViewProps {
  data: {
    players: {
      userId: string;
      displayName: string;
      totalScore: number;
      totalQuestions: number;
      accuracy: number;
      currentStreak: number;
      avgResponseTimeMs: number | null;
    }[];
    teamName: string;
  } | null;
}

export function LeaderboardView({ data }: LeaderboardViewProps) {
  if (!data || data.players.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center text-center min-h-[40vh] justify-center gap-3">
            <Trophy className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-semibold">The leaderboard is up for grabs!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first on your team to complete a daily rep and claim the top spot.
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
                {player.avgResponseTimeMs !== null && (
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    {(player.avgResponseTimeMs / 1000).toFixed(1)}s
                  </span>
                )}
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
