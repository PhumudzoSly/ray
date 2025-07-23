import * as roadmapItemActions from "@/actions/roadmap/items";
import { AlertTriangle } from "lucide-react";
import { RoadmapStatsClient } from "./_components/roadmap-stats-client";

interface RoadmapStatsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoadmapStatsPage({
  params,
}: RoadmapStatsPageProps) {
  const roadmapId = (await params).id;

  const statsResult = await roadmapItemActions.getRoadmapStats(roadmapId);
  const stats = statsResult?.success ? statsResult.data : null;

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Failed to load roadmap statistics
          </p>
        </div>
      </div>
    );
  }

  return <RoadmapStatsClient stats={stats} />;
}
