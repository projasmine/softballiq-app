import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
      <BottomNav role={profile.role} />
    </div>
  );
}
