"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, Zap, Crown } from "lucide-react";

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
    weekOf?: string;
    allTimeMVP?: {
      userId: string;
      displayName: string;
      totalScore: number;
      totalQuestions: number;
      accuracy: number;
    } | null;
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

  const weekLabel = data.weekOf
    ? `Week of ${new Date(data.weekOf).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "This Week";

  return (
    <div className="space-y-4">
      {/* All-Time MVP */}
      {data.allTimeMVP && data.allTimeMVP.totalScore > 0 && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <Crown className="h-6 w-6 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                All-Time MVP
              </p>
              <p className="font-medium truncate">{data.allTimeMVP.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {data.allTimeMVP.totalScore} correct &middot; {data.allTimeMVP.accuracy}% accuracy
              </p>
            </div>
            <Trophy className="h-5 w-5 text-primary/50" />
          </CardContent>
        </Card>
      )}

      {/* Weekly header */}
      <div className="flex items-center justify-between">
        {data.teamName && (
          <p className="text-sm text-muted-foreground">{data.teamName}</p>
        )}
        <Badge variant="outline" className="text-[10px]">
          {weekLabel}
        </Badge>
      </div>

      {/* Weekly rankings */}
      {data.players.every((p) => p.totalScore === 0) ? (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-sm text-muted-foreground">
              No scores yet this week. Complete a daily rep to get on the board!
            </p>
          </CardContent>
        </Card>
      ) : (
        data.players.map((player, i) => (
          <Card
            key={player.userId}
            className={i < 3 && player.totalScore > 0 ? "border-primary/20" : ""}
          >
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              <div className="w-8 text-center">
                {i < 3 && player.totalScore > 0 ? (
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
        ))
      )}
    </div>
  );
}
