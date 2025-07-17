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
  RefreshCw, List,
  CalendarDays
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProjectMilestones, updateMilestone } from "@/actions/project/milestone";

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
  const [selectedMilestone, setSelectedMilestone] =
    useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { token } = useSession();

  const { data: milestones } = useQuery({
    queryKey: ["milestones", projectId, token],
    queryFn: async () => {
      if (!token || !projectId) return [];
      const raw = await getProjectMilestones(projectId);
      return (raw ?? []).map((m: any) => ({
        _id: m.id,
        name: m.name,
        status: m.status,
        owner: m.owner ? { name: m.owner.name, image: m.owner.image } : null,
        endDate: m.endDate,
        description: m.description,
      }));
    },
    enabled: !!token && !!projectId,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => updateMilestone(data.milestoneId, { status: data.status }),
    onSuccess: (_data, variables) => {
      toast.success(`Milestone status changed to ${getStatusText(variables.status)}.`);
    },
    onError: () => {
      toast.error("Failed to update milestone status. Please try again.");
    },
  });

  const handleItemMove = async (
    itemId: string,
    fromGroupId: string,
    toGroupId: string,
    newIndex: number
  ) => {
    mutation.mutate({ milestoneId: itemId, status: toGroupId });
  };

  const handleItemClick = (item: GroupedListItem) => {
    setSelectedMilestone(item.id);
  };

  if (milestones === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (milestones.length === 0) {
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
      id: "not-started",
      title: "Not Started",
      color: getStatusColor("not-started"),
      items: [],
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: getStatusColor("in-progress"),
      items: [],
    },
    {
      id: "at-risk",
      title: "At Risk",
      color: getStatusColor("at-risk"),
      items: [],
    },
    {
      id: "delayed",
      title: "Delayed",
      color: getStatusColor("delayed"),
      items: [],
    },
    {
      id: "completed",
      title: "Completed",
      color: getStatusColor("completed"),
      items: [],
    },
  ];

  // Populate groups with milestones
  milestones.forEach((milestone: any) => {
    const group = groupedMilestones.find((g) => g.id === milestone.status);
    if (group) {
      const milestoneItem: GroupedListItem = {
        id: milestone._id,
        title: milestone.name,
        subtitle: milestone.endDate
          ? formatDate(new Date(milestone.endDate))
          : undefined,
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
            {milestones.length}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => toast.info('Milestone analysis is not implemented in this version.')}
            size="sm"
            variant="outline"
            title="Analyze milestone health and update statuses"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Analyze Health
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Milestone
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
        <p className="font-medium mb-1">💡 Pro tip:</p>
        <p>
          Drag and drop milestones to different dates to update their target
          dates.
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center border rounded-lg p-1 w-fit">
        <Button
          size="sm"
          variant={viewMode === "list" ? "default" : "ghost"}
          onClick={() => setViewMode("list")}
          className="h-8 px-3"
        >
          <List className="h-4 w-4 mr-1" />
          List
        </Button>
        <Button
          size="sm"
          variant={viewMode === "timeline" ? "default" : "ghost"}
          onClick={() => setViewMode("timeline")}
          className="h-8 px-3"
        >
          <CalendarDays className="h-4 w-4 mr-1" />
          Calendar
        </Button>
      </div>

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
