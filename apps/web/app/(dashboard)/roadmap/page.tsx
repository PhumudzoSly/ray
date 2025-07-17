"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllPublicRoadmaps } from "@/actions/roadmap";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ExternalLink, Settings, Copy, Globe } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { Separator } from "@workspace/ui/components/separator";
import PageHeader from "@/components/shared/page-header";
import NewRoadmap from "./components/new-roadmap";

export default function RoadmapPage() {
  const { token } = useSession();

  // Fetch roadmaps
  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: () => getAllPublicRoadmaps(),
    select: (res) => res?.success ? res.data : [],
  });

  return (
    <div>
      <PageHeader title="Roadmaps" />
      <Separator className="my-4" />
      <NewRoadmap />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : roadmaps && roadmaps.length > 0 ? (
          roadmaps.map((roadmap: any) => (
            <Card key={roadmap.id}>
              <CardHeader>
                <CardTitle>{roadmap.name}</CardTitle>
                <CardDescription>{roadmap.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>{roadmap.status}</Badge>
              </CardContent>
              <CardFooter>
                <Link href={`/roadmap/${roadmap.id}`}>
                  <Button variant="outline" size="sm">
                    View Roadmap <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No roadmaps found.
          </div>
        )}
      </div>
    </div>
  );
}
