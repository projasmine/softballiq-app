"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { Flame, ClipboardList, ArrowRight, BookOpen, CheckCircle2, Brain } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface PlayerDashboardProps {
  data: {
    profile: { displayName: string; role: string };
    membership: { teamName: string } | null;
    streak: { currentStreak: number; longestStreak: number } | null;
    dailyRepCompleted: boolean;
    recentAttempts: {
      id: string;
      type: string;
      score: number | null;
      totalQuestions: number;
      createdAt: Date;
    }[];
    pendingAssignments: { id: string; title: string; dueDate: Date | null }[];
    weeklyRepsUsed?: number;
    weeklyRepLimit?: number | null;
  };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function PlayerDashboard({ data }: PlayerDashboardProps) {
  const { profile, membership, streak, dailyRepCompleted, recentAttempts, pendingAssignments } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          {getGreeting()}, {profile.displayName.split(" ")[0]}
        </h1>
        {membership && (
          <p className="text-sm text-muted-foreground">{membership.teamName}</p>
        )}
      </div>

      {/* Streak */}
      <StreakCounter
        currentStreak={streak?.currentStreak ?? 0}
        longestStreak={streak?.longestStreak ?? 0}
      />

      {/* Daily Rep CTA */}
      {!dailyRepCompleted ? (
        <Card className="border-l-2 border-l-primary">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm">Daily Rep</h2>
              </div>
              {data.weeklyRepLimit !== null && data.weeklyRepLimit !== undefined && (
                <Badge variant="outline" className="text-[10px]">
                  {Math.max(0, data.weeklyRepLimit - (data.weeklyRepsUsed ?? 0))}/{data.weeklyRepLimit} left
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              5 quick questions to keep your softball IQ sharp.
            </p>
            <Button asChild className="w-full">
              <Link href="/daily-rep">
                Start Today&apos;s Rep <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500/20">
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">Daily Rep Complete</p>
              <p className="text-xs text-muted-foreground">
                Come back tomorrow to keep your streak
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Mode */}
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="pt-4 pb-4">
          <Link href="/study" className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Study Mode</p>
              <p className="text-xs text-muted-foreground">
                Review questions you&apos;ve missed
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pending Assignments
            </h3>
            <Badge variant="secondary" className="text-[10px]">{pendingAssignments.length}</Badge>
          </div>
          {pendingAssignments.map((a) => (
            <Link key={a.id} href={`/assignments`}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-3 pb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    {a.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(a.dueDate, "due")}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Recent Scores */}
      {recentAttempts.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Recent Scores
          </h3>
          {recentAttempts.slice(0, 3).map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px]">
                    {attempt.type === "daily_rep"
                      ? "Daily Rep"
                      : attempt.type === "practice"
                        ? "Study Mode"
                        : "Assignment"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeDate(attempt.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {attempt.score ?? 0}/{attempt.totalQuestions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.totalQuestions > 0
                      ? Math.round(
                          ((attempt.score ?? 0) / attempt.totalQuestions) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center min-h-[20vh] justify-center gap-3">
              <Brain className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Time to build your softball IQ!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete your first daily rep and your scores will show up here.
                </p>
              </div>
              <Button asChild size="sm" className="mt-1">
                <Link href="/daily-rep">Start Your First Rep</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No team prompt */}
      {!membership && (
        <Card className="border-dashed">
          <CardContent className="pt-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Join a team to compete on the leaderboard.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/onboarding">Join Team</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
