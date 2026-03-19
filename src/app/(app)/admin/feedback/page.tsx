import { getAdminFeedback } from "@/app/actions";
import { redirect } from "next/navigation";
import { formatRelativeDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User } from "lucide-react";

export default async function AdminFeedbackPage() {
  const feedbackList = await getAdminFeedback();

  if (feedbackList === null) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">User Feedback</h1>
        <Badge variant="secondary" className="ml-auto">
          {feedbackList.length}
        </Badge>
      </div>

      {feedbackList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No feedback submitted yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbackList.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {item.userName}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.userRole}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(item.createdAt)}
                  </span>
                </div>
                {item.teamName && (
                  <p className="text-xs text-muted-foreground">
                    {item.teamName}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{item.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
