import { MilestoneList } from "@/components/project/milestones/milestone-list";
import { getProjectMilestones } from "@/actions/project/milestone";
import getQueryClient from "@/lib/query/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

interface ProjectMilestonesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectMilestonesPage({
  params,
}: ProjectMilestonesPageProps) {
  const projectId = (await params).id;
  const queryClient = getQueryClient();

  // Pre-fetch milestone data
  await queryClient.prefetchQuery({
    queryKey: ["milestones", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return await getProjectMilestones(projectId);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto px-4 py-6">
        <MilestoneList projectId={projectId} />
      </div>
    </HydrationBoundary>
  );
}
