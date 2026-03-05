"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Target, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TeamRosterViewProps {
  members: {
    userId: string;
    displayName: string;
    role: string;
    positions: unknown;
    totalScore: number;
    totalQuestions: number;
    accuracy: number;
    currentStreak: number;
    quizCount: number;
  }[];
  joinCode: string;
}

export function TeamRosterView({ members, joinCode }: TeamRosterViewProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const players = members.filter((m) => m.role === "player");
  const coaches = members.filter((m) => m.role === "coach");

  return (
    <div className="space-y-4">
      {/* Join code */}
      <Card>
        <CardContent className="pt-3 pb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Join Code</p>
            <p className="font-mono font-bold tracking-widest">{joinCode}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={copyCode}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {/* Coaches */}
      {coaches.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Coaches ({coaches.length})
          </h3>
          {coaches.map((coach) => (
            <Card key={coach.userId}>
              <CardContent className="pt-3 pb-3">
                <p className="font-medium">{coach.displayName}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Players */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Players ({players.length})
        </h3>
        {players.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                No players yet. Share the join code!
              </p>
            </CardContent>
          </Card>
        ) : (
          players.map((player) => (
            <Link key={player.userId} href={`/team/${player.userId}`}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {player.displayName}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {player.accuracy}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {player.currentStreak}d
                      </span>
                      <span>{player.quizCount} quizzes</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
