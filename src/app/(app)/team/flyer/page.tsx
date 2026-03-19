import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { teamMembers, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FlyerView } from "./flyer-view";

export default async function TeamFlyerPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const [membership] = await db
    .select({
      teamName: teams.name,
      joinCode: teams.joinCode,
      ageGroup: teams.ageGroup,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, profile.id))
    .limit(1);

  if (!membership || membership.role !== "coach") redirect("/dashboard");

  const joinUrl = `https://softballiq.app/join?code=${membership.joinCode}`;

  return (
    <FlyerView
      teamName={membership.teamName}
      joinCode={membership.joinCode}
      ageGroup={membership.ageGroup}
      joinUrl={joinUrl}
    />
  );
}
