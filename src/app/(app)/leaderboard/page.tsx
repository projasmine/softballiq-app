import { getLeaderboardData } from "@/app/actions";
import { LeaderboardView } from "./leaderboard-view";

export default async function LeaderboardPage() {
  const data = await getLeaderboardData();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Leaderboard</h1>
      <LeaderboardView data={data} />
    </div>
  );
}
