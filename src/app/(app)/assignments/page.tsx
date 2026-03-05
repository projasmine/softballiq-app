import { getTeamAssignments, getVideoAssignments } from "@/app/actions";
import { AssignmentsList } from "./assignments-list";
import { auth } from "@/lib/auth-config";

export default async function AssignmentsPage() {
  const [data, videoData, session] = await Promise.all([
    getTeamAssignments(),
    getVideoAssignments(),
    auth(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Assignments</h1>
      <AssignmentsList
        data={data}
        videoData={videoData}
        userId={session?.user?.id}
      />
    </div>
  );
}
