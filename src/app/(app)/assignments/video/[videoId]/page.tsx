import { db } from "@/lib/db";
import { videoAssignments, videoComments, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { VideoCommentForm } from "./comment-form";

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default async function VideoWatchPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const { videoId } = await params;

  const [video] = await db
    .select()
    .from(videoAssignments)
    .where(eq(videoAssignments.id, videoId))
    .limit(1);

  if (!video) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Video assignment not found.</p>
      </div>
    );
  }

  const comments = await db
    .select({
      id: videoComments.id,
      userId: videoComments.userId,
      comment: videoComments.comment,
      createdAt: videoComments.createdAt,
      displayName: profiles.displayName,
    })
    .from(videoComments)
    .innerJoin(profiles, eq(profiles.id, videoComments.userId))
    .where(eq(videoComments.videoAssignmentId, videoId));

  const userComment = comments.find((c) => c.userId === userId);
  const youtubeId = extractYouTubeId(video.videoUrl);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{video.title}</h1>

      {video.description && (
        <p className="text-sm text-muted-foreground">{video.description}</p>
      )}

      {/* YouTube Embed */}
      {youtubeId ? (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>
      ) : (
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Could not load video. <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">Open in YouTube</a>
          </p>
        </div>
      )}

      {/* Comment Form */}
      <VideoCommentForm
        videoAssignmentId={videoId}
        existingComment={userComment?.comment ?? null}
      />

      {/* Team Comments */}
      {comments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Team Comments ({comments.length})
          </h2>
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border p-3 space-y-1">
              <p className="text-sm font-medium">
                {c.displayName}
                {c.userId === userId && (
                  <span className="text-xs text-muted-foreground ml-2">(You)</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{c.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
