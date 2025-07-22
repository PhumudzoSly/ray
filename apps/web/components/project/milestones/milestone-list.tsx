"use client";

import { useState } from "react";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Plus,
  Calendar,
  Diamond,
  RefreshCw,
  List,
  CalendarDays,
} from "lucide-react";
import { CreateMilestoneDialog } from "./create-milestone-dialog";
import { MilestoneDetailsSheet } from "./milestone-details-sheet";
import { MilestoneTimeline } from "./milestone-timeline";
import {
  GroupedList,
  GroupedListGroup,
  GroupedListItem,
} from "@workspace/ui/components/grouped-list";
import { formatDate } from "@/lib/format";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectMilestones,
  updateMilestone,
  CreateMilestoneData,
} from "@/actions/project/milestone";
import { MilestoneStatus } from "@workspace/backend/prisma/generated/client/client";

interface MilestoneListProps {
  projectId: string;
}

type ViewMode = "list" | "timeline";

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#10b981"; // green-500
    case "at-risk":
      return "#f59e0b"; // orange-500
    case "delayed":
      return "#ef4444"; // red-500
    case "in-progress":
      return "#3b82f6"; // blue-500
    default:
      return "#6b7280"; // gray-500
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "at-risk":
      return "At Risk";
    case "delayed":
      return "Delayed";
    case "in-progress":
      return "In Progress";
    case "not-started":
      return "Not Started";
    default:
      return "Unknown";
  }
};

export function MilestoneList({ projectId }: MilestoneListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [optimisticMilestones, setOptimisticMilestones] = useState<any[]>([]);

  const queryClient = useQueryClient();

  const { data: milestones } = useQuery({
    queryKey: ["milestones", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const raw = await getProjectMilestones(projectId);
      return raw;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: { milestoneId: string; status: string }) =>
      updateMilestone(data.milestoneId, { status: data.status as any }),
    onSuccess: (_data, variables) => {
      toast.success(
        `Milestone status changed to ${getStatusText(variables.status)}.`
      );
      // Invalidate and refetch the milestones query
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      // Clear optimistic state
      setOptimisticMilestones([]);
    },
    onError: (error) => {
      toast.error("Failed to update milestone status. Please try again.");
      // Revert optimistic update on error
      setOptimisticMilestones([]);
      console.error("Milestone update error:", error);
    },
  });

  const handleItemMove = async (
    itemId: string,
    fromGroupId: string,
    toGroupId: string,
    newIndex: number
  ) => {
    // Only update if the status actually changed
    if (fromGroupId === toGroupId) {
      return;
    }

    // Optimistic update - immediately update the UI
    const currentMilestones =
      optimisticMilestones.length > 0 ? optimisticMilestones : milestones || [];
    const updatedMilestones = currentMilestones.map((milestone) =>
      milestone.id === itemId ? { ...milestone, status: toGroupId } : milestone
    );

    setOptimisticMilestones(updatedMilestones);

    // Perform the actual update
    mutation.mutate({ milestoneId: itemId, status: toGroupId });
  };

  const handleItemClick = (item: GroupedListItem) => {
    setSelectedMilestone(item.id);
  };

  // Use optimistic data if available, otherwise use the query data
  const displayMilestones =
    optimisticMilestones.length > 0 ? optimisticMilestones : milestones || [];

  if (milestones === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (displayMilestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Diamond className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No milestones yet</h3>
        <p className="text-sm mb-6 max-w-sm text-center">
          Create milestones to track key checkpoints in your project.
        </p>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create your first milestone
        </Button>
        <CreateMilestoneDialog
          projectId={projectId}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    );
  }

  // Group milestones by status
  const groupedMilestones: GroupedListGroup[] = [
    {
      id: MilestoneStatus.NOT_STARTED,
      title: "Not Started",
      color: getStatusColor("not-started"),
      items: [],
    },
    {
      id: MilestoneStatus.IN_PROGRESS,
      title: "In Progress",
      color: getStatusColor("in-progress"),
      items: [],
    },
    {
      id: MilestoneStatus.AT_RISK,
      title: "At Risk",
      color: getStatusColor("at-risk"),
      items: [],
    },
    {
      id: MilestoneStatus.DELAYED,
      title: "Delayed",
      color: getStatusColor("delayed"),
      items: [],
    },
    {
      id: MilestoneStatus.COMPLETED,
      title: "Completed",
      color: getStatusColor("completed"),
      items: [],
    },
  ];

  // Populate groups with milestones
  displayMilestones.forEach((milestone: any) => {
    const group = groupedMilestones.find((g) => g.id === milestone.status);
    if (group) {
      const milestoneItem: GroupedListItem = {
        id: milestone.id,
        title: milestone.name,
        subtitle: milestone.description,
        avatar: milestone.owner ? (
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={milestone.owner.image}
              alt={milestone.owner.name}
            />
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {milestone.owner.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-muted">?</AvatarFallback>
          </Avatar>
        ),
        status: milestone.owner?.name,
        metadata: milestone.endDate ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(new Date(milestone.endDate))}</span>
          </div>
        ) : undefined,
      };
      group.items.push(milestoneItem);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Diamond className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold tracking-tight">Milestones</h2>
          <Badge variant="secondary" className="text-xs font-medium">
            {displayMilestones.length}
          </Badge>
          {optimisticMilestones.length > 0 && (
            <Badge
              variant="outline"
              className="text-xs font-medium text-muted-foreground"
            >
              Updating...
            </Badge>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center border rounded-lg p-1 w-fit">
            <Button
              size="xs"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
            >
              <List />
            </Button>
            <Button
              size="xs"
              variant={viewMode === "timeline" ? "default" : "ghost"}
              onClick={() => setViewMode("timeline")}
            >
              <CalendarDays />
            </Button>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
        <p className="font-medium mb-1">💡 Pro tip:</p>
        <p>
          Drag and drop milestones between status columns to update their
          status.
        </p>
      </div>

      {/* View Mode Toggle */}

      {/* Render based on view mode */}
      {viewMode === "timeline" ? (
        <MilestoneTimeline projectId={projectId} />
      ) : (
        <GroupedList
          groups={groupedMilestones}
          onItemMove={handleItemMove}
          onItemClick={handleItemClick}
          enableDragAndDrop={true}
        />
      )}

      <CreateMilestoneDialog
        projectId={projectId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedMilestone && (
        <MilestoneDetailsSheet
          milestoneId={selectedMilestone}
          open={!!selectedMilestone}
          onOpenChange={(open) => !open && setSelectedMilestone(null)}
        />
      )}
    </div>
  );
}
