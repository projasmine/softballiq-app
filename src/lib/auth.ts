import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, email: session.user.email };
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [profile] = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      displayName: profiles.displayName,
      role: profiles.role,
      positions: profiles.positions,
      avatarUrl: profiles.avatarUrl,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
    })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  return profile ?? null;
}

export async function requireAuth() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(role: "player" | "coach") {
  const profile = await requireAuth();
  if (profile.role !== role) redirect("/dashboard");
  return profile;
}
