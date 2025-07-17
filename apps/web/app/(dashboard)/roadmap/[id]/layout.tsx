"use client";
import { getSession } from "@/actions/account/user";
import { Button } from "@workspace/ui/components/button";
import { api } from "@workspace/backend";
import {
  ExternalLink,
  Eye,
  MessageSquare,
  Rocket,
  ThumbsUp,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import React from "react";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { redirect, useRouter } from "next/navigation";
import { Id } from "@workspace/backend";
import { useParams } from "next/navigation";
import { useSession } from "@/context/session-context";
import { Separator } from "@workspace/ui/components/separator";
import { RoadmapTabs } from "./_components/tabs";
import { RoadmapForm } from "../components/new-roadmap";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";

function RoadmapHeaderSkeleton() {
  return (
    <div className="space-y-4 container">
      <div className="flex items-center gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const roadmapId = params.id as Id<"publicRoadmaps">;
  const { token } = useSession();

  const { data: roadmap, isPending } = useQuery({
    queryKey: ["roadmap", roadmapId],
    queryFn: () => api.roadmap.getRoadmap({ id: roadmapId }),
  });

  if (isPending || roadmap === undefined) return <RoadmapHeaderSkeleton />;

  if (roadmap === null) {
    router.push("/roadmap");
  }

  return (
    <div className="space-y-4 container">
      <div className="flex items-center gap-4 flex-wrap justify-between">
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

        <div className="flex items-center gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/rm/${roadmap?.slug}`} target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Page
            </Link>
          </Button>
          <RoadmapForm mode="edit" roadmap={roadmap} />
        </div>
      </div>

      <>
        <RoadmapTabs roadmapId={roadmapId} />
        {children}
      </>
    </div>
  );
}
