import { Suspense } from "react";
import { dehydrate } from "@tanstack/react-query";
import { getAllPublicRoadmaps } from "@/actions/roadmap";
import getQueryClient from "@/lib/query/getQueryClient";
import Hydrate from "@/lib/query/hydrate.client";
import RoadmapClient from "./roadmap-client";
import { getSession } from "@/actions/account/user";
import Header from "@/components/shared/header";
import NewRoadmap from "./components/new-roadmap";
import { Separator } from "@workspace/ui/components/separator";

export default async function RoadmapPage() {
  const { org } = await getSession();
  const queryClient = getQueryClient();

  // Pre-fetch the roadmaps data on the server
  await queryClient.prefetchQuery({
    queryKey: ["roadmaps", org],
    queryFn: () => getAllPublicRoadmaps(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <Header crumb={[{ title: "Roadmaps", url: "/roadmap" }]}>
        <NewRoadmap />
      </Header>
      <div className="space-y-2 p-4">
        <h1 className="text-3xl font-bold tracking-tight">Roadmaps</h1>
        <p className="text-muted-foreground">
          Manage your product roadmaps, track progress, and engage with your
          audience.
        </p>
      </div>
      <Separator />
      <Hydrate state={dehydratedState}>
        <Suspense fallback={<RoadmapSkeleton />}>
          <RoadmapClient />
        </Suspense>
      </Hydrate>
    </>
  );
}

function RoadmapSkeleton() {
  return (
    <div>
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
      <div className="h-px bg-border mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
