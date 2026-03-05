import { getPlayerProgress } from "@/app/actions";
import { ProgressView } from "./progress-view";

export default async function ProgressPage() {
  const data = await getPlayerProgress();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Progress</h1>
      <ProgressView data={data} />
    </div>
  );
}
