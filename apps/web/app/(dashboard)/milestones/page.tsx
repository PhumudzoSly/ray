import Header from "@/components/shared/header";
import getQueryClient from "@/lib/query/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getAllMilestones } from "@/actions/project/milestone";
import AllMilestones from "@/components/project/milestones/all-milestones";

export default async function MilestonesPage() {
  const queryClient = getQueryClient();

  // Prefetch all milestones
  await queryClient.prefetchQuery({
    queryKey: ["milestones"],
    queryFn: async () => {
      const raw = await getAllMilestones();
      return raw ?? [];
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header crumb={[{ title: "Milestones", url: "/milestones" }]}>
        {null}
      </Header>
      <div className="container mx-auto px-4 py-6">
        <AllMilestones />
      </div>
    </HydrationBoundary>
  );
}

