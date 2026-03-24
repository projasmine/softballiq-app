"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import Image from "next/image";
import { createVideoAssignment, getDashboardData } from "@/app/actions";

function isValidYouTubeUrl(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function NewVideoAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const youtubeId = extractYouTubeId(videoUrl);

  useEffect(() => {
    const init = async () => {
      const data = await getDashboardData();
      if (data?.membership) {
        setTeamId(data.membership.teamId);
      }
    };
    init();
  }, []);

  const handleCreate = async () => {
    if (!teamId || !title || !videoUrl) return;

    if (!isValidYouTubeUrl(videoUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createVideoAssignment({
        title,
        videoUrl,
        description: description || undefined,
        dueDate: dueDate || undefined,
        teamId,
      });
      router.push("/assignments");
    } catch {
      setError("Failed to create video assignment");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">New Video Assignment</h1>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Baserunning Technique Breakdown"
            />
          </div>

          <div className="space-y-2">
            <Label>YouTube URL</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          {/* YouTube Preview */}
          {youtubeId && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
              <Image
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt="Video preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="rounded-full bg-red-600 p-3">
                  <Play className="h-6 w-6 text-white fill-white" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[10px] text-white/80 bg-black/50 rounded px-2 py-1 inline-block">
                  Preview — this is what players will see
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Coach notes for the team..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date (optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleCreate}
            className="w-full"
            size="lg"
            disabled={!title || !videoUrl || !teamId || loading}
          >
            {loading ? "Creating..." : "Create Video Assignment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
