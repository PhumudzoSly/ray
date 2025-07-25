"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as featureActions from "@/actions/project/features";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import { LayoutGrid, List, Clock, Target, GitBranch } from "lucide-react";
import { FeatureCard } from "./feature-card";
import {
  FeatureFilters,
  type FeatureFilters as FeatureFiltersType,
} from "./feature-filters";
import { NewFeature } from "./new-feature";
import NoData from "@/components/shared/no-data";
import {
  GroupedList,
  GroupedListItem,
  GroupedListGroup,
} from "@workspace/ui/components/grouped-list";
import { phases } from "@/utils/constants/features/phases";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { useRouter } from "next/navigation";
import { FaMagic } from "react-icons/fa";

interface FeatureTableProps {
  projectId: string;
}

export function FeatureTable({ projectId }: FeatureTableProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FeatureFiltersType>({
    search: "",
    priority: "all",
    phase: "all",
    assignee: "all",
  });
  const [viewMode, setViewMode] = useState<"grid" | "grouped">("grouped");

  const queryClient = useQueryClient();
  // TanStack mutation for updating a feature (phase change)
  const updateFeatureMutation = useMutation({
    mutationFn: async ({
      featureId,
      updates,
    }: {
      featureId: string;
      updates: any;
    }) => {
      const result = await featureActions.updateFeature(featureId, updates);
      if (!result.success) {
        throw new Error((result.error as string) || "Failed to update feature");
      }
      return result;
    },
    onMutate: async ({ featureId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["features", projectId] });

      // Snapshot the previous value
      const previousFeatures = queryClient.getQueryData<any[]>([
        "features",
        projectId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<any[]>(["features", projectId], (old) => {
        if (!old) return old;
        return old.map((f) => (f.id === featureId ? { ...f, ...updates } : f));
      });

      // Return a context object with the snapshotted value
      return { previousFeatures };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFeatures) {
        queryClient.setQueryData(
          ["features", projectId],
          context.previousFeatures
        );
      }
      toast.error(err.message || "Failed to move feature");
    },
    onSuccess: (data, variables) => {
      // Comprehensive invalidation for real-time updates
      const { featureId, updates } = variables;

      // Invalidate feature details
      queryClient.invalidateQueries({ queryKey: ["feature", featureId] });

      // Invalidate feature hierarchy
      queryClient.invalidateQueries({
        queryKey: ["featureHierarchy", featureId],
      });

      // Invalidate validation results
      queryClient.invalidateQueries({
        queryKey: ["featureValidation", featureId],
      });

      // Invalidate activity feed
      queryClient.invalidateQueries({
        queryKey: ["activity-feed", "FEATURE", featureId],
      });

      // Invalidate project-level queries
      queryClient.invalidateQueries({ queryKey: ["features", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["featureDependencyGraph", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projectDependencyStats", projectId],
      });

      // Invalidate general feature queries
      queryClient.invalidateQueries({ queryKey: ["features"] });

      toast.success("Feature updated successfully");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["features", projectId] });
    },
  });

  const { data: features, isPending } = useQuery({
    queryKey: ["features", projectId],
    queryFn: async () => {
      const res = await featureActions.getFeaturesByProject(projectId);
      if (res.success) return res.data;
      throw new Error("Failed to fetch features");
    },
    // refetch every 2 minutes
    refetchInterval: 120000,
  });

  // Get unique assignees for filter dropdown
  const assignees = useMemo(() => {
    if (!features) return [];
    const uniqueAssignees = new Map();
    features?.forEach((feature: any) => {
      if (feature.assignedTo && !uniqueAssignees.has(feature.assignedTo.id)) {
        uniqueAssignees.set(feature.assignedTo.id, {
          id: feature.assignedTo.id,
          name: feature.assignedTo.name,
        });
      }
    });
    return Array.from(uniqueAssignees.values());
  }, [features]);

  // Filter features based on current filters
  const filteredFeatures = useMemo(() => {
    if (!features) return [];

    return features.filter((feature: any) => {
      // Search filter
      if (
        filters.search &&
        !feature.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Priority filter
      if (filters.priority !== "all" && feature.priority !== filters.priority) {
        return false;
      }

      // Phase filter
      if (filters.phase !== "all" && feature.phase !== filters.phase) {
        return false;
      }

      // Assignee filter
      if (filters.assignee !== "all") {
        if (filters.assignee === "unassigned" && feature.assignedTo) {
          return false;
        }
        if (
          filters.assignee !== "unassigned" &&
          feature.assignedTo?.id !== filters.assignee
        ) {
          return false;
        }
      }

      return true;
    });
  }, [features, filters]);

  const getPhaseColor = (phaseId: string) => {
    const colors: Record<string, string> = {
      DISCOVERY: "#8b5cf6", // purple
      PLANNING: "#3b82f6", // blue
      DEVELOPMENT: "#eab308", // yellow
      TESTING: "#f97316", // orange
      RELEASE: "#ec4899", // pink
      LIVE: "#10b981", // green
      DEPRECATED: "#6b7280", // gray
    };
    return colors[phaseId] || "#6b7280";
  };

  // Transform features into grouped format
  const groupedFeatures = useMemo(() => {
    if (!filteredFeatures) return [];

    const groups: GroupedListGroup[] = phases.map((phase) => {
      const phaseFeatures = filteredFeatures.filter(
        (feature: any) => feature.phase === phase.id
      );

      const items: GroupedListItem[] = phaseFeatures.map((feature: any) => {
        return {
          id: feature.id,
          title: feature.name,
          subtitle: feature.description || undefined,
          avatar: feature.assignedTo ? (
            <Avatar>
              <AvatarFallback>
                {feature.assignedTo.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          ) : undefined,
          metadata: (
            <div className="flex  items-center gap-2 text-xs text-muted-foreground">
              {feature.estimatedEffort && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{feature.estimatedEffort}h</span>
                </div>
              )}
              {feature.businessValue && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>{feature.businessValue}/10</span>
                </div>
              )}
              {feature.isSubFeature && <GitBranch className="h-3 w-3" />}
            </div>
          ),
        };
      });

      return {
        id: phase.id,
        title: phase.name,
        color: getPhaseColor(phase.id),
        icon: <phase.icon className="h-4 w-4" />,
        items,
        count: items.length,
      };
    });

    return groups;
  }, [filteredFeatures, router]);

  const handleItemMove = async (
    itemId: string,
    fromGroupId: string,
    toGroupId: string,
    newIndex: number
  ) => {
    // Don't update if moving to the same phase
    if (fromGroupId === toGroupId) return;

    // Don't allow multiple moves at once
    if (updateFeatureMutation.isPending) return;

    updateFeatureMutation.mutate({
      featureId: itemId,
      updates: { phase: toGroupId },
    });
  };

  if (isPending) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Filters skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center flex-wrap gap-4 justify-between">
        <div className="flex items-center gap-4 flex-1">
          <FeatureFilters
            filters={filters}
            onFiltersChange={setFilters}
            assignees={assignees}
          />
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grouped" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setViewMode("grouped")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="fancy"
            onClick={() => {
              toast.promise(featureActions.generateFeatures(projectId), {
                loading: "Generating features...",
                success: "Features generated successfully",
                error: "Failed to generate features",
              });
            }}
          >
            <FaMagic className="h-4 w-4" />
            Generate
          </Button>
          <NewFeature projectId={projectId} />
        </div>
      </div>

      {/* Content */}
      {filteredFeatures.length === 0 ? (
        <div className="mt-6">
          <NoData message="No features found" />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeatures.map((feature: any, index: number) => (
            <FeatureCard index={index + 1} key={feature.id} feature={feature} />
          ))}
        </div>
      ) : (
        <GroupedList
          groups={groupedFeatures}
          onItemMove={handleItemMove}
          onItemClick={(item) => router.push(`/features/${item.id}`)}
          enableDragAndDrop={true}
          className="space-y-6"
        />
      )}
    </div>
  );
}
