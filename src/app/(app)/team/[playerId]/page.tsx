import { getPlayerProgress } from "@/app/actions";
import { ProgressView } from "../../progress/progress-view";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const data = await getPlayerProgress(playerId);

  // If authorization failed, redirect back to team page
  if (!data) redirect("/team");

  const [profile] = await db
    .select({ displayName: profiles.displayName })
    .from(profiles)
    .where(eq(profiles.id, playerId))
    .limit(1);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        {profile?.displayName ?? "Player"}
      </h1>
      <ProgressView data={data} />
    </div>
  );
}
