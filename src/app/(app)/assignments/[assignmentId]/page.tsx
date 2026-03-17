import { getAssignmentDetails } from "@/app/actions";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatRelativeDate, categoryColorClass } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const data = await getAssignmentDetails(assignmentId);

  if (!data) redirect("/assignments");

  const { assignment, players, totalPlayers, completedCount } = data;
  const completionPct =
    totalPlayers > 0 ? Math.round((completedCount / totalPlayers) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/assignments"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          &larr; Assignments
        </Link>
        <h1 className="text-xl font-bold mt-1">{assignment.title}</h1>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {assignment.categoryFilter && (
                <Badge
                  variant="outline"
                  className={`text-xs ${categoryColorClass[assignment.categoryFilter] ?? ""}`}
                >
                  {assignment.categoryFilter}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {assignment.questionCount} questions
              </Badge>
            </div>
            {assignment.dueDate && (
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(assignment.dueDate, "due")}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">
                {completedCount}/{totalPlayers} players ({completionPct}%)
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player List */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Players
        </h3>
        {players.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                No players on this team yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          players.map((player) => (
            <Card
              key={player.userId}
              className={
                player.status === "completed"
                  ? "border-green-500/20"
                  : player.status === "late"
                    ? "border-amber-500/20"
                    : ""
              }
            >
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{player.displayName}</p>
                  {player.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(player.completedAt)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {player.status === "completed" && (
                    <>
                      <span className="text-sm font-medium">
                        {player.score}/{assignment.questionCount}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </>
                  )}
                  {player.status === "late" && (
                    <>
                      <span className="text-sm font-medium">
                        {player.score}/{assignment.questionCount}
                      </span>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </>
                  )}
                  {player.status === "not_started" && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="text-xs">Not started</span>
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href="/assignments">&larr; Back to Assignments</Link>
      </Button>
    </div>
  );
}
