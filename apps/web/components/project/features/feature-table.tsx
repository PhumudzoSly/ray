"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as featureActions from "@/actions/features";
import { useSession } from "@/context/session-context";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { LayoutGrid, List, Clock, Target, User, GitBranch } from "lucide-react";
import { FeatureCard } from "./feature-card";
import {
  FeatureFilters,
  type FeatureFilters as FeatureFiltersType,
} from "./feature-filters";
import { NewFeature } from "./new-feature";
import { useQuery } from "@tanstack/react-query";
import * as featureActions from "@/actions/features";
import { useSession } from "@/context/session-context";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { LayoutGrid, List, Clock, Target, User, GitBranch } from "lucide-react";
import { FeatureCard } from "./feature-card";
import {
  FeatureFilters,
  type FeatureFilters as FeatureFiltersType,
} from "./feature-filters";
import { NewFeature } from "./new-feature";
import { useData } from "@/hooks/use-data";
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

interface FeatureTableProps {
  projectId: string;
}

export function FeatureTable({ projectId }: FeatureTableProps) {
  const { token } = useSession();
  const router = useRouter();
  const [filters, setFilters] = useState<FeatureFiltersType>({
    search: "",
    priority: "all",
    phase: "all",
    assignee: "all",
  });
  const [viewMode, setViewMode] = useState<"grid" | "grouped">("grouped");
  const [selectedFeatureId, setSelectedFeatureId] =
    useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const queryClient = useQueryClient();
  // TanStack mutation for updating a feature (phase change)
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, updates }: { featureId: string; updates: any }) => {
      return await featureActions.updateFeatureById(featureId, updates);
    },
    onMutate: async ({ featureId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["features", projectId] });
      const previousFeatures = queryClient.getQueryData<any[]>(["features", projectId]);
      queryClient.setQueryData<any[]>(["features", projectId], (old) => {
        if (!old) return old;
        return old.map((f) =>
          f._id === featureId ? { ...f, ...updates } : f
        );
      });
      return { previousFeatures };
    },
    onError: (err, variables, context) => {
      if (context?.previousFeatures) {
        queryClient.setQueryData(["features", projectId], context.previousFeatures);
      }
      toast.error("Failed to move feature");
    },
    onSettled: () => {
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
  });

  // Get unique assignees for filter dropdown
  const assignees = useMemo(() => {
    if (!features) return [];
    const uniqueAssignees = new Map();
    features.forEach((feature: any) => {
      if (feature.user && !uniqueAssignees.has(feature.user._id)) {
        uniqueAssignees.set(feature.user._id, {
          _id: feature.user._id,
          name: feature.user.name,
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
        if (filters.assignee === "unassigned" && feature.user) {
          return false;
        }
        if (
          filters.assignee !== "unassigned" &&
          feature.user?._id !== filters.assignee
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
          id: feature._id,
          title: feature.name,
          subtitle: feature.description || undefined,
          avatar: feature.user ? (
            <Avatar>
              <AvatarFallback>
                {feature.user.name?.charAt(0) || "?"}
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
        <NewFeature projectId={projectId} />
      </div>

      {/* Content */}
      {filteredFeatures.length === 0 ? (
        <NoData />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeatures.map((feature: any, index: number) => (
            <FeatureCard
              index={index + 1}
              key={feature._id}
              feature={feature}
              showProject={false}
            />
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
