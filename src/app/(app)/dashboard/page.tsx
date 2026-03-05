import { getDashboardData } from "@/app/actions";
import { redirect } from "next/navigation";
import { PlayerDashboard } from "./player-dashboard";
import { CoachDashboard } from "./coach-dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/login");

  if (data.profile.role === "coach") {
    return <CoachDashboard data={data} />;
  }

  return <PlayerDashboard data={data} />;
}
