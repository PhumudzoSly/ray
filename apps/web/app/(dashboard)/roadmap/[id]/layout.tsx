import { getRoadmap } from "@/actions/roadmap";
import { redirect } from "next/navigation";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import React from "react";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { RoadmapTabs } from "./_components/tabs";
import { RoadmapForm } from "../components/new-roadmap";
import getQueryClient from "@/lib/query/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import Hydrate from "@/lib/query/hydrate.client";
import Header from "@/components/shared/header";

export default async function RoadmapLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  //
  const roadmapId = (await params).id;
  const queryClient = getQueryClient();

  // Fetch roadmap data once, then prefill the query cache with it
  const res = await getRoadmap(roadmapId);
  const roadmap = res?.data;

  if (!roadmap) {
    redirect("/roadmap");
  }

  // Set the prefetched data directly in the query cache
  await queryClient.prefetchQuery({
    queryKey: ["roadmap", roadmapId],
    queryFn: () => Promise.resolve(res),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <Header
        crumb={[
          { title: "Roadmaps", url: "/roadmap" },
          { title: roadmap?.name },
        ]}
      >
        <div className="flex items-center gap-2">
          <Button asChild size="icon">
            <Link
              href={`https://rayai.dev/rm/${roadmap?.slug}`}
              target="_blank"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
          <RoadmapForm mode="edit" roadmap={roadmap} />
        </div>
      </Header>
      <Hydrate state={dehydratedState}>
        <div className="space-y-2 container ">
          <div className="flex items-center p-4 gap-4 flex-wrap justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/roadmap`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-semibold">{roadmap?.name}</h1>
                  <Badge variant={roadmap?.isPublic ? "info" : "dark"}>
                    {roadmap?.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {roadmap?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>
          <>
            <RoadmapTabs roadmapId={roadmapId} />
            <div className="p-4">{children}</div>
          </>
        </div>
      </Hydrate>
    </>
  );
}
