import { getTeamRoster } from "@/app/actions";
import { TeamRosterView } from "./team-roster-view";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const data = await getTeamRoster();
  if (!data) redirect("/dashboard");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{data.team?.name ?? "Team"}</h1>
      <TeamRosterView members={data.members} joinCode={data.team?.joinCode ?? ""} />
    </div>
  );
}
