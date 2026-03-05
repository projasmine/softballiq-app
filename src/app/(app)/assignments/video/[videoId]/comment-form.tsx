"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { submitVideoComment } from "@/app/actions";

interface VideoCommentFormProps {
  videoAssignmentId: string;
  existingComment: string | null;
}

export function VideoCommentForm({
  videoAssignmentId,
  existingComment,
}: VideoCommentFormProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (existingComment) {
    return (
      <Card className="border-green-500/20">
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm font-medium">Your comment</p>
          </div>
          <p className="text-sm text-muted-foreground">{existingComment}</p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    setError("");

    try {
      await submitVideoComment(videoAssignmentId, comment);
      router.refresh();
    } catch {
      setError("Failed to submit comment");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <p className="text-sm font-medium">
          What did you learn from this video?
        </p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share something you learned..."
          rows={3}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={!comment.trim() || loading}
        >
          {loading ? "Submitting..." : "Submit Comment"}
        </Button>
      </CardContent>
    </Card>
  );
}
