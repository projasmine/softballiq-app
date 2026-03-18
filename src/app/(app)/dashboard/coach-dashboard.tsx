"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, Plus, Copy, Check, Share2, QrCode, Link2 } from "lucide-react";
import { useState } from "react";
import { formatRelativeDate, categoryColorClass, categoryLabel, difficultyLabel } from "@/lib/utils";

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const joinUrl = membership?.joinCode
    ? `https://softballiq.app/join?code=${membership.joinCode}`
    : "";

  const copyCode = () => {
    if (membership?.joinCode) {
      navigator.clipboard.writeText(membership.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${membership?.teamName} on Softball IQ`,
          text: `Your coach wants you to join ${membership?.teamName} on Softball IQ! Use this link to sign up and join the team:`,
          url: joinUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyLink();
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
            <CardContent className="pt-4 space-y-3">
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

              {/* Share actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={copyLink}
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Link2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {copiedLink ? "Copied!" : "Copy Link"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={shareLink}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowQR(!showQR)}
                >
                  <QrCode className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* QR Code */}
              {showQR && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}&bgcolor=1a1a2e&color=ffffff&format=svg`}
                    alt="QR Code to join team"
                    width={180}
                    height={180}
                    className="rounded-lg"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Scan to join {membership.teamName}
                  </p>
                </div>
              )}
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
                                {categoryLabel[a.categoryFilter] ?? a.categoryFilter}
                              </span>
                            )}
                            {a.difficultyFilter ? ` · ${difficultyLabel[a.difficultyFilter] ?? a.difficultyFilter}` : ""}
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
