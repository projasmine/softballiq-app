"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Upload, Link2, Loader2, X } from "lucide-react";
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

type VideoSource = "youtube" | "upload";

export default function NewVideoAssignmentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoSource, setVideoSource] = useState<VideoSource>("youtube");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const youtubeId = videoSource === "youtube" ? extractYouTubeId(videoUrl) : null;

  useEffect(() => {
    const init = async () => {
      const data = await getDashboardData();
      if (data?.membership) {
        setTeamId(data.membership.teamId);
      }
    };
    init();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only MP4, MOV, WebM, and M4V videos are supported");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be under 100MB");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        setUploadProgress("");
        return;
      }

      setVideoUrl(data.url);
      setUploadedFileName(file.name);
      setUploadProgress("");
    } catch {
      setError("Upload failed. Please try again.");
      setUploadProgress("");
    }
    setUploading(false);
  };

  const clearUpload = () => {
    setVideoUrl("");
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreate = async () => {
    if (!teamId || !title || !videoUrl) return;

    if (videoSource === "youtube" && !isValidYouTubeUrl(videoUrl)) {
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

          {/* Video source toggle */}
          <div className="space-y-2">
            <Label>Video Source</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setVideoSource("youtube");
                  setVideoUrl("");
                  setUploadedFileName("");
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  videoSource === "youtube"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Link2 className="h-4 w-4" />
                YouTube URL
              </button>
              <button
                onClick={() => {
                  setVideoSource("upload");
                  setVideoUrl("");
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  videoSource === "upload"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload Video
              </button>
            </div>
          </div>

          {/* YouTube input */}
          {videoSource === "youtube" && (
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}

          {/* Upload input */}
          {videoSource === "upload" && (
            <div className="space-y-2">
              <Label>Video File</Label>
              {uploadedFileName ? (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                  <Play className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm flex-1 truncate">{uploadedFileName}</span>
                  <button onClick={clearUpload} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    uploading ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  {uploading ? (
                    <div className="space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-xs text-muted-foreground">{uploadProgress}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Tap to select a video
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, MOV, WebM, M4V — max 100MB
                      </p>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

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

          {/* Upload video preview */}
          {videoSource === "upload" && videoUrl && !uploading && (
            <div className="rounded-lg border border-border overflow-hidden">
              <video
                src={videoUrl}
                className="w-full aspect-video"
                controls
                preload="metadata"
              />
              <div className="px-3 py-2 bg-muted/30">
                <p className="text-[10px] text-muted-foreground">
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
            disabled={!title || !videoUrl || !teamId || loading || uploading}
          >
            {loading ? "Creating..." : "Create Video Assignment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
