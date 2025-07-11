"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
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
import { useData } from "@/hooks/use-data";

export default function RoadmapPage() {
  const { token } = useSession();

  // Fetch roadmaps
  const { data: roadmaps, isPending } = useData(api.roadmap.getAllRoadmaps, {
    token,
  });

  return (
    <div className="container space-y-4">
      <PageHeader title="Roadmaps" />
      <div className="flex items-center flex-wrap gap-4 justify-between mb-2">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Roadmaps</h2>
          <p className="text-muted-foreground">
            Share your project roadmap with users and collect feedback
          </p>
        </div>
        <NewRoadmap />
      </div>
      <Separator />

      {/* Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmaps === undefined || isPending ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : roadmaps === null || roadmaps?.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-12">
            <Globe className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Roadmaps Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first public roadmap to share your project plans with
              users and collect feedback.
            </p>
          </div>
        ) : (
          roadmaps?.map((roadmap: any) => {
            return (
              <Card key={roadmap._id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">
                    <div className="flex items-center justify-between gap-4">
                      <h6 className="truncate whitespace-pre-wrap line-clamp-1">
                        {roadmap.name}
                      </h6>

                      <Badge
                        variant={roadmap.isPublic ? "info" : "dark"}
                        className={
                          roadmap.isPublic
                            ? "bg-primary/10 text-primary border-primary/20"
                            : ""
                        }
                      >
                        {roadmap.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {roadmap.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {roadmap.stats ? (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex flex-col border border-border rounded-md px-4 py-2">
                        <span className="text-xs text-muted-foreground">
                          Items
                        </span>
                        <span className="text-2xl font-bold">
                          {roadmap.stats.totalItems}
                        </span>
                      </div>
                      <div className="flex flex-col border border-border rounded-md px-4 py-2">
                        <span className="text-xs text-muted-foreground">
                          Votes
                        </span>
                        <span className="text-2xl font-bold">
                          {roadmap.stats.totalVotes}
                        </span>
                      </div>
                      <div className="flex flex-col border border-border rounded-md px-4 py-2">
                        <span className="text-xs text-muted-foreground">
                          Feedback
                        </span>
                        <span className="text-2xl font-bold">
                          {roadmap.stats.totalFeedback}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 border-t pt-4">
                    <Globe className="w-4 h-4" />
                    <span className="font-mono">/{roadmap.slug}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/rm/${roadmap.slug}`
                        );
                        toast.success("URL copied to clipboard");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/rm/${roadmap.slug}`}
                      target="_blank"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Public
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <Link href={`/roadmap/${roadmap._id}`}>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
