import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { profiles, teamMembers, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  // Get plan and team info
  const [profileData] = await db
    .select({ plan: profiles.plan })
    .from(profiles)
    .where(eq(profiles.id, profile.id))
    .limit(1);

  const isPro = profileData?.plan === "pro";

  const [membership] = await db
    .select({ ageGroup: teams.ageGroup, theme: teams.theme })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, profile.id))
    .limit(1);

  const ageGroup = membership?.ageGroup ?? null;
  const themeClass = membership?.theme && membership.theme !== "default"
    ? `theme-${membership.theme}`
    : "";

  return (
    <div className={`min-h-screen pb-20 ${themeClass}`}>
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Image
            src={isPro ? "/logo-pro.svg" : "/logo.svg"}
            alt="Softball IQ"
            width={isPro ? 160 : 140}
            height={36}
            className="h-9 w-auto"
            priority
          />
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
