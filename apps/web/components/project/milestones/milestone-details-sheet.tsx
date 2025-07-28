"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent } from "@workspace/ui/components/sheet";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import {
  Calendar,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Trash2,
  Clock,
  Target,
  Activity,
  MoreHorizontal,
  BarChart3,
  CheckSquare,
  Square,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import moment from "moment";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { DateInput } from "@workspace/ui/components/date-input";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { CommandSelect } from "@workspace/ui/components/command-select";
import { IssueStatusField } from "@/components/ui/issue-fields/issue-status-field";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MilestoneWithProgress } from "@/types/milestone";
import {
  getMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/actions/project/milestone";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

interface MilestoneDetailsSheetProps {
  milestoneId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MILESTONE_STATUS_OPTIONS = [
  {
    value: "NOT_STARTED",
    label: "Not Started",
    icon: <Circle className="h-3 w-3" />,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    icon: <Clock className="h-3 w-3" />,
  },
  {
    value: "AT_RISK",
    label: "At Risk",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  {
    value: "COMPLETED",
    label: "Completed",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  {
    value: "DELAYED",
    label: "Delayed",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
];

export function MilestoneDetailsSheet({
  milestoneId,
  open,
  onOpenChange,
}: MilestoneDetailsSheetProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: milestone, isLoading } = useQuery<MilestoneWithProgress | null>(
    {
      queryKey: ["milestone", milestoneId],
      queryFn: async () => {
        if (!milestoneId) return null;
        return await getMilestone(milestoneId);
      },
      enabled: !!milestoneId,
    }
  );

  // Optimistic update for milestone
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => updateMilestone(milestoneId, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["milestone", milestoneId] });
      const previous = queryClient.getQueryData(["milestone", milestoneId]);
      queryClient.setQueryData(["milestone", milestoneId], (old: any) => ({
        ...old,
        ...updates,
      }));
      return { previous };
    },
    onError: (err, updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["milestone", milestoneId], context.previous);
      }
      toast.error("Failed to update milestone");
    },
    onSettled: () => {
      // Refresh all milestone-related queries
      queryClient.invalidateQueries({ queryKey: ["milestone", milestoneId] });
      if (milestone?.projectId) {
        queryClient.invalidateQueries({
          queryKey: ["milestones", milestone.projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ["project", milestone.projectId],
        });
      }
      // Refresh any other milestone queries
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
    onSuccess: () => {
      toast.success("Milestone updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteMilestone(milestoneId),
    onSuccess: () => {
      toast.success("Milestone deleted");
      // Invalidate both individual milestone and project milestones list
      queryClient.invalidateQueries({ queryKey: ["milestone", milestoneId] });
      if (milestone?.projectId) {
        queryClient.invalidateQueries({
          queryKey: ["milestones", milestone.projectId],
        });
      }
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Show the specific error message from the server
      const errorMessage = error?.message || "Failed to delete milestone";
      toast.error(errorMessage);
    },
  });

  const handleUpdate = async (updates: any) => {
    if (!milestone) return;
    setIsUpdating(true);
    updateMutation.mutate(updates, {
      onSettled: () => setIsUpdating(false),
    });
  };

  const handleStatusChange = async (status: string) => {
    await handleUpdate({ status });
  };

  const handleOwnerChange = async (assignee: string | null) => {
    await handleUpdate({
      ownerId: assignee === "unassigned" ? undefined : assignee,
    });
  };

  const handleStartDateChange = async (date: Date | undefined) => {
    await handleUpdate({
      startDate: date ? date.getTime() : undefined,
    });
  };

  const handleEndDateChange = async (date: Date | undefined) => {
    await handleUpdate({
      endDate: date ? date.getTime() : undefined,
    });
  };

  const handleNameChange = async (name: string) => {
    await handleUpdate({ name });
  };

  const handleDescriptionChange = async (description: string) => {
    await handleUpdate({ description: description || undefined });
  };

  const handleDelete = async () => {
    if (!milestone) return;
    setIsDeleting(true);
    deleteMutation.mutate(undefined, {
      onSettled: () => setIsDeleting(false),
    });
  };

  if (isLoading || !milestone) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[640px] p-0">
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-7 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] p-0 overflow-y-auto">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <InlineEditField
                    displayValue={
                      <h1 className="text-xl font-semibold text-foreground leading-tight">
                        {milestone.name}
                      </h1>
                    }
                    value={milestone.name}
                    onSave={handleNameChange}
                    disabled={isUpdating}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete milestone</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{milestone.name}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Description</h3>
            <InlineEditTextArea
              value={milestone.description || ""}
              placeholder="Add a description..."
              onSave={handleDescriptionChange}
              disabled={isUpdating}
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </div>

          {/* Overdue milestone alert */}
          {milestone.endDate &&
            new Date(milestone.endDate) < new Date() &&
            milestone.status !== "COMPLETED" && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertTitle>Milestone is overdue</AlertTitle>
                <AlertDescription>
                  This milestone's end date has passed and it is not marked as
                  completed.
                </AlertDescription>
              </Alert>
            )}

          {/* Properties */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Properties</h3>
            <div className="grid grid-cols-[120px_1fr] gap-y-4">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              <CommandSelect
                options={MILESTONE_STATUS_OPTIONS}
                value={milestone.status}
                onValueChange={handleStatusChange}
                placeholder="Select status"
                disabled={isUpdating}
                variant="status"
                size="sm"
              />

              <span className="text-xs font-medium text-muted-foreground">
                Owner
              </span>
              <AssigneeSelector
                assignee={milestone.owner?.id || null}
                onChange={handleOwnerChange}
              />
              <span className="text-xs font-medium text-muted-foreground">
                Start Date
              </span>
              <DateInput
                value={
                  milestone.startDate
                    ? new Date(milestone.startDate)
                    : undefined
                }
                placeholder="Set start date"
                onChange={handleStartDateChange}
                disabled={isUpdating}
              />
              <span className="text-xs font-medium text-muted-foreground">
                End Date
              </span>
              <DateInput
                value={
                  milestone.endDate ? new Date(milestone.endDate) : undefined
                }
                placeholder="Set end date"
                onChange={handleEndDateChange}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Completion
                  </span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {Math.round(milestone.progress)}%
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Issues
                  </span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {milestone.completedIssueCount}/{milestone.issueCount}
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Features
                  </span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {milestone.completedFeatureCount}/{milestone.featureCount}
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Overdue
                  </span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {milestone.overdueItems}
                </div>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          {(milestone.dependsOn.length > 0 ||
            milestone.blocking.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Dependencies
              </h3>
              <div className="space-y-3">
                {milestone.dependsOn.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Depends on {milestone.dependsOn.length} milestone
                      {milestone.dependsOn.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.dependsOn
                        .filter(Boolean)
                        .map((dep: { id: string; name: string }) => (
                          <Badge
                            key={dep?.id}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {dep?.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                {milestone.blocking.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Blocking {milestone.blocking.length} milestone
                      {milestone.blocking.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.blocking
                        .filter(Boolean)
                        .map((blocked: { id: string; name: string }) => (
                          <Badge
                            key={blocked?.id}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {blocked?.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assigned Items */}
          {(milestone.issues.length > 0 || milestone.features.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Assigned Items
              </h3>
              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8 bg-muted/50">
                  <TabsTrigger value="issues" className="text-xs">
                    Issues ({milestone.issues.length})
                  </TabsTrigger>
                  <TabsTrigger value="features" className="text-xs">
                    Features ({milestone.features.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="mt-3 space-y-1">
                  {milestone.issues.length > 0 ? (
                    <div className="space-y-1">
                      {milestone.issues.map((issue: any) => (
                        <div
                          key={issue.id}
                          className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {issue.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <IssueStatusField
                                issueId={issue.id}
                                value={issue.status}
                                disabled={true}
                                align="start"
                              />
                              {issue.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due {moment(issue.dueDate).fromNow()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Circle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No issues assigned</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="features" className="mt-3 space-y-1">
                  {milestone.features.length > 0 ? (
                    <div className="space-y-1">
                      {milestone.features.map((feature: any) => (
                        <div
                          key={feature.id}
                          className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {feature.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <PhaseSelector
                                phase={feature.phase}
                                disabled={true}
                              />
                              {feature.endDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due {moment(feature.endDate).fromNow()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No features assigned</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
