import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { teamMembers, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  // Get team age group for header badge
  const [membership] = await db
    .select({ ageGroup: teams.ageGroup })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, profile.id))
    .limit(1);

  const ageGroup = membership?.ageGroup ?? null;

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-11 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Softball IQ
          </span>
          {ageGroup && (
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              {ageGroup}
            </Badge>
          )}
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
      <BottomNav role={profile.role} />
    </div>
  );
}
