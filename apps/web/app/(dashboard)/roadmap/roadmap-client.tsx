"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getAllPublicRoadmaps, deletePublicRoadmap } from "@/actions/roadmap";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
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
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/context/session-context";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { toast } from "sonner";

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
  const { org } = useSession();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

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

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
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
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmaps.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            roadmap={roadmap}
            onDelete={handleDeleteRoadmap}
          />
        ))}
      </div>
    </div>
  );
}

interface RoadmapCardProps {
  roadmap: EnrichedPublicRoadmap;
  onDelete: (roadmapId: string, roadmapName: string) => Promise<void>;
}

function RoadmapCard({ roadmap, onDelete }: RoadmapCardProps) {
  const topCategories = Object.entries(roadmap.stats.categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topStatuses = Object.entries(roadmap.stats.statusCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  const handleDeleteRoadmap = () => {
    onDelete(roadmap.id, roadmap.name);
  };

  return (
    <div className="group relative bg-card border border-border rounded-lg p-6 hover:border-border/60 transition-all duration-200 hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span className="truncate">{roadmap.project.name}</span>
            </div>
            {roadmap.isPublic && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
            {roadmap.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {roadmap.description}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm border border-border p-1.5 ">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded">
            <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium">{roadmap.stats.totalItems}</div>
            <div className="text-xs text-muted-foreground">Items</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm border border-border p-1.5 ">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded">
            <ThumbsUp className="h-3 w-3 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="font-medium">{roadmap.stats.totalVotes}</div>
            <div className="text-xs text-muted-foreground">Votes</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm border border-border p-1.5 ">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/20 rounded">
            <MessageSquare className="h-3 w-3 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="font-medium">{roadmap.stats.totalFeedback}</div>
            <div className="text-xs text-muted-foreground">Feedback</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm border border-border p-1.5 ">
          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 rounded">
            <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="font-medium">{roadmap.stats.totalChangelogs}</div>
            <div className="text-xs text-muted-foreground">Updates</div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Top Categories
          </div>
          <div className="flex flex-wrap gap-1">
            {topCategories.map(([category, count]) => {
              const config = ROADMAP_CATEGORY_CONFIG[category];
              const Icon = getCategoryIcon(category);
              return (
                <Badge
                  key={category}
                  variant="secondary"
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {config?.label || category}
                  <span className="ml-1 text-muted-foreground">({count})</span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Statuses */}
      {topStatuses.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Status Overview
          </div>
          <div className="flex flex-wrap gap-1">
            {topStatuses.map(([status, count]) => {
              const config = ROADMAP_STATUS_CONFIG[status];
              const Icon = getStatusIcon(status);
              return (
                <Badge
                  key={status}
                  variant="secondary"
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {config?.label || status}
                  <span className="ml-1 text-muted-foreground">({count})</span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {formatRelativeTime(roadmap.stats.lastUpdated)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/roadmap/${roadmap.id}`}>
            <Button variant="outline" size="sm" className="h-8">
              <Settings className="h-3 w-3 mr-1" />
              Manage
            </Button>
          </Link>
          <Link href={`/roadmap/${roadmap.slug}`} target="_blank">
            <Button variant="ghost" size="sm" className="h-8">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={handleDeleteRoadmap}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
