"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Plus, Video, MessageSquare, Play } from "lucide-react";
import { formatRelativeDate, categoryColorClass } from "@/lib/utils";
import Image from "next/image";

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

interface AssignmentsListProps {
  data: {
    assignments: {
      id: string;
      title: string;
      categoryFilter: string | null;
      difficultyFilter: string | null;
      questionCount: number;
      dueDate: Date | null;
      createdAt: Date;
    }[];
    completions: { assignmentId: string; score: number | null; userId: string }[];
    role?: string;
    teamId?: string;
  } | null;
  videoData: {
    videoAssignments: {
      id: string;
      title: string;
      videoUrl: string;
      description: string | null;
      dueDate: Date | null;
      createdAt: Date;
    }[];
    comments: {
      id: string;
      videoAssignmentId: string;
      userId: string;
      comment: string;
      displayName: string;
      createdAt: Date;
    }[];
  } | null;
  userId?: string;
}

export function AssignmentsList({ data, videoData, userId }: AssignmentsListProps) {
  const isCoach = data?.role === "coach";
  const hasQuizAssignments = data && data.assignments.length > 0;
  const hasVideoAssignments = videoData && videoData.videoAssignments.length > 0;
  const isEmpty = !hasQuizAssignments && !hasVideoAssignments;

  if (isEmpty) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            {isCoach
              ? "No assignments yet. Create one for your team!"
              : "No assignments yet. Your coach will assign some soon!"}
          </p>
          {isCoach && (
            <div className="flex gap-2 justify-center">
              <Button asChild size="sm">
                <Link href="/assignments/new">
                  <Plus className="mr-2 h-4 w-4" /> Quiz Assignment
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/assignments/new-video">
                  <Video className="mr-2 h-4 w-4" /> Video Assignment
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {isCoach && (
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href="/assignments/new">
              <Plus className="mr-2 h-4 w-4" /> New Assignment
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/assignments/new-video">
              <Video className="mr-2 h-4 w-4" /> New Video
            </Link>
          </Button>
        </div>
      )}

      {/* Video Assignments */}
      {videoData?.videoAssignments.map((video) => {
        const videoComments = videoData.comments.filter(
          (c) => c.videoAssignmentId === video.id
        );
        const userComment = videoComments.find((c) => c.userId === userId);
        const hasCommented = !!userComment;

        const youtubeId = extractYouTubeId(video.videoUrl);

        return (
          <Card
            key={`video-${video.id}`}
            className={hasCommented ? "border-green-500/20" : ""}
          >
            {/* YouTube Thumbnail Preview */}
            {youtubeId && (
              <Link href={`/assignments/video/${video.id}`} className="block">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="rounded-full bg-red-600 p-2">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </Link>
            )}
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-400" />
                    <p className="font-medium">{video.title}</p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-red-500/20 text-red-300 border-red-500/30">
                    Video
                  </Badge>
                </div>
                {hasCommented ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Done</span>
                  </div>
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {isCoach && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {videoComments.length} comment{videoComments.length !== 1 ? "s" : ""}
                </div>
              )}

              <Button asChild size="sm" className="w-full" variant={hasCommented ? "outline" : "default"}>
                <Link href={`/assignments/video/${video.id}`}>
                  {hasCommented ? "View Comments" : isCoach ? "View Details" : "Watch & Comment"}
                </Link>
              </Button>

              {video.dueDate && (
                <p className="text-xs text-muted-foreground">
                  {formatRelativeDate(video.dueDate, "due")}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Quiz Assignments */}
      {data?.assignments.map((assignment) => {
        const completion = data.completions.find(
          (c) => c.assignmentId === assignment.id
        );
        const isComplete = !!completion;
        const completionCount = isCoach
          ? data.completions.filter((c) => c.assignmentId === assignment.id).length
          : 0;

        return (
          <Card
            key={assignment.id}
            className={isComplete ? "border-green-500/20" : ""}
          >
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{assignment.title}</p>
                  <div className="flex gap-2">
                    {assignment.categoryFilter && (
                      <Badge variant="outline" className={`text-xs ${categoryColorClass[assignment.categoryFilter] ?? ""}`}>
                        {assignment.categoryFilter}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {assignment.questionCount} Q
                    </Badge>
                  </div>
                </div>
                {isComplete ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {completion?.score ?? 0}/{assignment.questionCount}
                    </span>
                  </div>
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {isCoach && (
                <p className="text-xs text-muted-foreground">
                  {completionCount} completed
                </p>
              )}

              {!isComplete && !isCoach && (
                <Button asChild size="sm" className="w-full">
                  <Link href={`/quiz/${assignment.id}`}>Start</Link>
                </Button>
              )}

              {assignment.dueDate && (
                <p className="text-xs text-muted-foreground">
                  {formatRelativeDate(assignment.dueDate, "due")}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
