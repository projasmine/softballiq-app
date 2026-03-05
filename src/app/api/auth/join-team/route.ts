import { db } from "@/lib/db";
import { profiles, teams, teamMembers, dailyStreaks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const { teamCode, displayName } = await req.json();

  if (!teamCode || !displayName?.trim()) {
    return NextResponse.json(
      { error: "Team code and display name are required" },
      { status: 400 }
    );
  }

  // Find team by join code
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.joinCode, teamCode.trim().toUpperCase()))
    .limit(1);

  if (!team) {
    return NextResponse.json({ error: "Invalid team code" }, { status: 404 });
  }

  // Create guest profile
  const guestEmail = `guest_${randomUUID()}@fastpitch.local`;
  const [profile] = await db
    .insert(profiles)
    .values({
      email: guestEmail,
      displayName: displayName.trim(),
      role: "player",
      passwordHash: null,
    })
    .returning({ id: profiles.id });

  // Add to team
  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: profile.id,
    role: "player",
  });

  // Initialize streak
  await db.insert(dailyStreaks).values({
    userId: profile.id,
    teamId: team.id,
    currentStreak: 0,
    longestStreak: 0,
  });

  return NextResponse.json({ profileId: profile.id });
}
