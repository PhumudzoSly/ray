"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getAllPublicRoadmaps, deletePublicRoadmap } from "@/actions/roadmap";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  ExternalLink,
  Plus,
  Calendar,
  MessageSquare,
  ThumbsUp,
  GitBranch,
  Clock,
  TrendingUp,
  Users,
  Globe,
  Settings,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/context/session-context";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

import NewRoadmap from "./components/new-roadmap";
import { NoData } from "@/components/shared";
import { EnrichedPublicRoadmap } from "@/types/roadmap";
import {
  ROADMAP_STATUS_CONFIG,
  ROADMAP_CATEGORY_CONFIG,
  getStatusIcon,
  getCategoryIcon,
  formatRelativeTime,
  formatDate,
} from "@/utils/constants/roadmaps";

export default function RoadmapClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { org } = useSession();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const page = Number(searchParams.get("page") || "1");
  const perPage = Number(searchParams.get("per_page") || "10");
  const sort = searchParams.get("sort") || "name";
  const order = (searchParams.get("order") as "asc" | "desc") || "asc";
  const search = searchParams.get("search") || "";

  const {
    data: roadmaps,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["roadmaps", org],
    queryFn: () => getAllPublicRoadmaps(),
    select: (res) => (res?.success ? res.data : []) as EnrichedPublicRoadmap[],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete roadmap mutation
  const deleteRoadmapMutation = useMutation({
    mutationFn: deletePublicRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", org] });
      toast.success("Roadmap deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete roadmap");
    },
  });

  const handleDeleteRoadmap = async (
    roadmapId: string,
    roadmapName: string
  ) => {
    const isConfirmed = await confirm({
      title: "Delete Roadmap",
      description: `Are you sure you want to delete "${roadmapName}"? This action cannot be undone and will remove all associated items, votes, and feedback.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (isConfirmed) {
      deleteRoadmapMutation.mutate(roadmapId);
    }
  };

  // Filter roadmaps based on search params
  const filteredRoadmaps =
    roadmaps?.filter((roadmap) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          roadmap.name.toLowerCase().includes(searchLower) ||
          roadmap.description?.toLowerCase().includes(searchLower) ||
          roadmap.project.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      return true;
    }) || [];

  // Apply sorting
  const sortedRoadmaps = [...filteredRoadmaps].sort((a, b) => {
    let comparison = 0;

    switch (sort) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "project":
        comparison = a.project.name.localeCompare(b.project.name);
        break;
      case "items":
        comparison = a.stats.totalItems - b.stats.totalItems;
        break;
      case "votes":
        comparison = a.stats.totalVotes - b.stats.totalVotes;
        break;
      case "feedback":
        comparison = a.stats.totalFeedback - b.stats.totalFeedback;
        break;
      case "updated":
        comparison =
          new Date(a.stats.lastUpdated).getTime() -
          new Date(b.stats.lastUpdated).getTime();
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }

    return order === "asc" ? comparison : -comparison;
  });

  // Apply pagination
  const startIndex = (page - 1) * perPage;
  const paginatedRoadmaps = sortedRoadmaps.slice(
    startIndex,
    startIndex + perPage
  );
  const totalPages = Math.ceil(sortedRoadmaps.length / perPage);

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams);

    if (sort === column) {
      params.set("order", order === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", column);
      params.set("order", "asc");
    }

    router.push(`/roadmap?${params.toString()}`);
  };

  const getSortIcon = (column: string) => {
    if (sort !== column) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return order === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  if (isLoading) {
    return <RoadmapTableSkeleton />;
  }

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <NoData
          title="No roadmaps yet"
          description="Create your first public roadmap to share your project's future with users."
          action={<NewRoadmap />}
        />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40px] [&:has([role=checkbox])]:pl-3">
              #
            </TableHead>
            <TableHead className="min-w-[250px] max-w-[400px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("name")}
              >
                Roadmap {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[150px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("project")}
              >
                <GitBranch className="h-4 w-4 mr-1" />
                Project {getSortIcon("project")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("items")}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Items {getSortIcon("items")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("votes")}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Votes {getSortIcon("votes")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("feedback")}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Feedback {getSortIcon("feedback")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[130px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("updated")}
              >
                <Clock className="h-4 w-4 mr-1" />
                Updated {getSortIcon("updated")}
              </Button>
            </TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRoadmaps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <NoData />
              </TableCell>
            </TableRow>
          ) : (
            paginatedRoadmaps.map((roadmap, index) => (
              <TableRow
                key={roadmap.id}
                className="group cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/roadmap/${roadmap.id}`)}
              >
                <TableCell className="[&:has([role=checkbox])]:pl-3">
                  <Badge>{index + 1}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="size-6">
                      {roadmap.isPublic ? (
                        <Globe className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <span className="hover:underline underline-offset-1">
                        {roadmap.name}
                      </span>
                      <p className="text-muted-foreground text-sm line-clamp-1">
                        {roadmap.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {roadmap.project.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">
                      {roadmap.stats.totalItems}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">
                      {roadmap.stats.totalVotes}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">
                      {roadmap.stats.totalFeedback}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-xs">
                        {formatDistanceToNow(
                          new Date(roadmap.stats.lastUpdated),
                          {
                            addSuffix: true,
                          }
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {format(new Date(roadmap.stats.lastUpdated), "PPP")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/roadmap/${roadmap.id}`}
                      className={buttonVariants({
                        size: "icon",
                        variant: "outline",
                      })}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/roadmap/${roadmap.slug}`}
                      target="_blank"
                      className={buttonVariants({
                        size: "icon",
                        variant: "outline",
                      })}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        handleDeleteRoadmap(roadmap.id, roadmap.name)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function RoadmapTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[300px]">Roadmap</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[250px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[60px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[60px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[80px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[120px]" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
