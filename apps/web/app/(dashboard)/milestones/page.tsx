"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Diamond,
  List,
  BarChart3,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Calendar,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
} from "lucide-react";
import { GanttChart } from "@/components/project/milestones/gantt-chart";
import { MilestoneDetailsSheet } from "@/components/project/milestones/milestone-details-sheet";
import { CreateMilestoneDialog } from "@/components/project/milestones/create-milestone-dialog";
import {
  GroupedList,
  GroupedListGroup,
  GroupedListItem,
} from "@workspace/ui/components/grouped-list";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { formatDate } from "@/lib/format";
import LoadingSpinner from "@workspace/ui/components/LoadingSpinner";
import { toast } from "sonner";
import Header from "@/components/shared/header";

type ViewMode = "list" | "gantt";
type FilterMode = "all" | "project" | "status" | "owner";

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "at-risk":
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    case "delayed":
      return <Clock className="h-4 w-4 text-red-600" />;
    case "in-progress":
      return <Target className="h-4 w-4 text-blue-600" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

export default function MilestonesPage() {
  const { token } = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedMilestone, setSelectedMilestone] =
    useState<Id<"milestones"> | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProjectForCreate, setSelectedProjectForCreate] =
    useState<Id<"projects"> | null>(null);

  const milestones = useQuery(api.milestones.getOrganizationMilestones, {
    token,
  });

  const projects = useQuery(api.projects.getAllProjects, { token });

  const updateMilestone = useMutation(api.milestones.updateMilestone);

  if (milestones === undefined || projects === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Filter milestones based on search and filters
  const filteredMilestones = milestones.filter((milestone) => {
    const matchesSearch =
      milestone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      milestone.project?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || milestone.status === selectedStatus;
    const matchesProject =
      selectedProject === "all" || milestone.projectId === selectedProject;

    return matchesSearch && matchesStatus && matchesProject;
  });

  // Handle milestone drag and drop for status changes
  const handleMilestoneMove = async (
    itemId: string,
    fromGroupId: string,
    toGroupId: string,
    newIndex: number
  ) => {
    if (fromGroupId === toGroupId) return; // No status change

    try {
      await updateMilestone({
        milestoneId: itemId as Id<"milestones">,
        status: toGroupId as any,
        token,
      });

      toast.success("Milestone status updated successfully");
    } catch (error) {
      toast.error("Failed to update milestone status");
      console.error("Error updating milestone status:", error);
    }
  };

  // Group milestones for list view
  const getGroupedMilestones = (): GroupedListGroup[] => {
    if (filterMode === "project") {
      const projectGroups: GroupedListGroup[] = [];
      const projectMap = new Map<string, any[]>();

      filteredMilestones.forEach((milestone) => {
        const projectKey = milestone.project?.name || "No Project";
        if (!projectMap.has(projectKey)) {
          projectMap.set(projectKey, []);
        }
        projectMap.get(projectKey)!.push(milestone);
      });

      projectMap.forEach((milestones, projectName) => {
        projectGroups.push({
          id: projectName,
          title: projectName,
          color: "#6b7280",
          items: milestones.map((milestone) => ({
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
            metadata: (
              <div className="flex items-center gap-2">
                {getStatusIcon(milestone.status)}
                <span className="text-xs text-muted-foreground">
                  {Math.round(milestone.progress || 0)}%
                </span>
              </div>
            ),
          })),
        });
      });

      return projectGroups;
    } else {
      // Group by status
      const statusGroups: GroupedListGroup[] = [
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

      filteredMilestones.forEach((milestone) => {
        const group = statusGroups.find((g) => g.id === milestone.status);
        if (group) {
          group.items.push({
            id: milestone._id,
            title: milestone.name,
            subtitle: milestone.project?.name,
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
            status: milestone.endDate
              ? formatDate(new Date(milestone.endDate))
              : undefined,
            metadata: (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{Math.round(milestone.progress || 0)}%</span>
              </div>
            ),
          });
        }
      });

      return statusGroups;
    }
  };

  const handleMilestoneClick = (item: GroupedListItem) => {
    setSelectedMilestone(item.id as Id<"milestones">);
  };

  const handleCreateMilestone = (projectId?: Id<"projects">) => {
    setSelectedProjectForCreate(projectId || null);
    setShowCreateDialog(true);
  };

  const stats = {
    total: milestones.length,
    completed: milestones.filter((m) => m.status === "completed").length,
    inProgress: milestones.filter((m) => m.status === "in-progress").length,
    atRisk: milestones.filter((m) => m.status === "at-risk").length,
    delayed: milestones.filter((m) => m.status === "delayed").length,
  };

  // Enable drag and drop only when grouped by status
  const isDragAndDropEnabled = filterMode === "all" && viewMode === "list";

  return (
    <>
      <Header crumb={[{ title: "Milestones", url: "/milestones" }]}>
        {null}
      </Header>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Diamond className="h-6 w-6 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
              <p className="text-muted-foreground">
                Track progress across all projects
                {isDragAndDropEnabled && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Drag to update status
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleCreateMilestone()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Milestone
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
              <Diamond className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.completed}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.inProgress}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">At Risk</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.atRisk}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Delayed</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.delayed}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search milestones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterMode}
              onValueChange={(value) => setFilterMode(value as FilterMode)}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-lg p-1">
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
              variant={viewMode === "gantt" ? "default" : "ghost"}
              onClick={() => setViewMode("gantt")}
              className="h-8 px-3"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Gantt
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredMilestones.length} of {milestones.length} milestones
          </div>
        </div>

        {/* Content */}
        {viewMode === "gantt" ? (
          <GanttChart
            milestones={filteredMilestones}
            onMilestoneClick={(milestone) =>
              setSelectedMilestone(milestone._id)
            }
          />
        ) : (
          <GroupedList
            groups={getGroupedMilestones()}
            onItemClick={handleMilestoneClick}
            onItemMove={isDragAndDropEnabled ? handleMilestoneMove : undefined}
            enableDragAndDrop={isDragAndDropEnabled}
          />
        )}

        {/* Empty State */}
        {filteredMilestones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Diamond className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ||
              selectedStatus !== "all" ||
              selectedProject !== "all"
                ? "No milestones found"
                : "No milestones yet"}
            </h3>
            <p className="text-sm mb-6 max-w-sm text-center">
              {searchQuery ||
              selectedStatus !== "all" ||
              selectedProject !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Create your first milestone to start tracking project progress."}
            </p>
            {!searchQuery &&
              selectedStatus === "all" &&
              selectedProject === "all" && (
                <Button onClick={() => handleCreateMilestone()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first milestone
                </Button>
              )}
          </div>
        )}

        {/* Milestone Details Sheet */}
        {selectedMilestone && (
          <MilestoneDetailsSheet
            milestoneId={selectedMilestone}
            open={!!selectedMilestone}
            onOpenChange={(open) => !open && setSelectedMilestone(null)}
          />
        )}

        {/* Create Milestone Dialog */}
        <CreateMilestoneDialog
          projectId={
            selectedProjectForCreate || (projects[0]?._id as Id<"projects">)
          }
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </>
  );
}
