import { createFileRoute } from "@tanstack/react-router";
import { MissionBench } from "@/components/forge/bench";

export const Route = createFileRoute("/mission/$missionId")({
  component: MissionPage,
  head: () => ({
    meta: [{ title: "Forge & Flight" }],
  }),
});

function MissionPage() {
  const { missionId } = Route.useParams();
  return <MissionBench missionId={missionId} />;
}
