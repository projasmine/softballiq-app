"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, Plus, Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatRelativeDate, categoryColorClass } from "@/lib/utils";

interface CoachDashboardProps {
  data: {
    profile: { displayName: string };
    membership: { teamName: string; joinCode: string; teamId: string; ageGroup?: string | null } | null;
    recentAttempts: {
      id: string;
      type: string;
      score: number | null;
      totalQuestions: number;
      createdAt: Date;
    }[];
    recentAssignments: {
      id: string;
      title: string;
      categoryFilter: string | null;
      difficultyFilter: string | null;
      questionCount: number;
      createdAt: Date;
    }[];
  };
}

export function CoachDashboard({ data }: CoachDashboardProps) {
  const { profile, membership, recentAssignments } = data;
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (membership?.joinCode) {
      navigator.clipboard.writeText(membership.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Coach Dashboard</h1>
          {membership?.ageGroup && (
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              {membership.ageGroup}
            </Badge>
          )}
        </div>
        {membership && (
          <p className="text-sm text-muted-foreground">
            {membership.teamName}
          </p>
        )}
      </div>

      {membership ? (
        <>
          {/* Join Code */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Team Join Code</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-bold tracking-widest flex-1">
                  {membership.joinCode}
                </span>
                <Button variant="outline" size="sm" onClick={copyCode}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-auto py-4">
              <Link
                href="/team"
                className="flex flex-col items-center gap-2"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">View Roster</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link
                href="/assignments/new"
                className="flex flex-col items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">New Assignment</span>
              </Link>
            </Button>
          </div>

          {/* Recent Assignments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assignments</h3>
              <Button asChild variant="ghost" size="sm">
                <Link href="/assignments">View All</Link>
              </Button>
            </div>
            {recentAssignments.length > 0 ? (
              <div className="space-y-2">
                {recentAssignments.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{a.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.questionCount} questions
                            {a.categoryFilter && (
                              <span className={`ml-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColorClass[a.categoryFilter] ?? ""}`}>
                                {a.categoryFilter}
                              </span>
                            )}
                            {a.difficultyFilter ? ` · ${a.difficultyFilter}` : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {formatRelativeDate(a.createdAt)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-4 text-center">
                  <ClipboardList className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Create assignments to help your team learn
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/assignments/new">Create Assignment</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Create a team to get started
            </p>
            <Button asChild>
              <Link href="/onboarding">Create Team</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
