"use client";

import { useState } from "react";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@workspace/ui/components/sheet";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
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
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { DateInput } from "@workspace/ui/components/date-input";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { StatusSelector } from "@/components/ui/selectors/status-selector";
import { MilestoneStatusSelector } from "@/components/ui/selectors/milestone-status-selector";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMilestone, updateMilestone, deleteMilestone } from "@/actions/project/milestone";

interface MilestoneDetailsSheetProps {
  milestoneId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Milestone {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string | number;
  endDate?: string | number;
  owner?: { id: string; name: string } | null;
  progress: number;
  completedIssueCount: number;
  issueCount: number;
  completedFeatureCount: number;
  featureCount: number;
  overdueItems: number;
  dependsOn: { id: string; name: string }[];
  blocking: { id: string; name: string }[];
  issues: any[];
  features: any[];
}

export function MilestoneDetailsSheet({
  milestoneId,
  open,
  onOpenChange,
}: MilestoneDetailsSheetProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { token } = useSession();
  const queryClient = useQueryClient();

  const { data: milestone, isLoading } = useQuery<Milestone | null>({
    queryKey: ["milestone", milestoneId, token],
    queryFn: async () => {
      if (!token || !milestoneId) return null;
      const raw = await getMilestone(milestoneId);
      if (!raw) return null;
      // Map to local type if needed
      return {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        status: raw.status,
        startDate: raw.startDate,
        endDate: raw.endDate,
        owner: raw.owner ? { id: raw.owner.id, name: raw.owner.name } : null,
        progress: raw.progress,
        completedIssueCount: raw.completedIssueCount,
        issueCount: raw.issueCount,
        completedFeatureCount: raw.completedFeatureCount,
        featureCount: raw.featureCount,
        overdueItems: raw.overdueItems,
        dependsOn: (raw.dependsOn ?? []).map((d: any) => ({ id: d.id, name: d.name })),
        blocking: (raw.blocking ?? []).map((b: any) => ({ id: b.id, name: b.name })),
        issues: raw.issues ?? [],
        features: raw.features ?? [],
      };
    },
    enabled: !!token && !!milestoneId,
  });

  // Optimistic update for milestone
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => updateMilestone(milestoneId, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["milestone", milestoneId, token] });
      const previous = queryClient.getQueryData(["milestone", milestoneId, token]);
      queryClient.setQueryData(["milestone", milestoneId, token], (old: any) => ({ ...old, ...updates }));
      return { previous };
    },
    onError: (err, updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["milestone", milestoneId, token], context.previous);
      }
      toast.error("Failed to update milestone");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["milestone", milestoneId, token] });
    },
    onSuccess: () => {
      toast.success("Milestone updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteMilestone(milestoneId),
    onSuccess: () => {
      toast.success("Milestone deleted");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to delete milestone");
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
      <SheetContent className="w-full sm:max-w-[640px] p-0 overflow-y-auto">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <InlineEditField
                  displayValue={
                    <h1 className="text-xl font-semibold text-foreground leading-tight">
                      {milestone.name}
                    </h1>
                  }
                  value={milestone.name}
                  onSave={async (value) => {
                    await handleUpdate({ name: value });
                  }}
                  disabled={isUpdating}
                />
                <div className="flex items-center gap-2 mt-3">
                  <MilestoneStatusSelector status={milestone.status} disabled />
                  {(milestone.startDate || milestone.endDate) && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      <Calendar className="h-3 w-3 mr-1.5" />
                      {milestone.startDate &&
                        formatDate(new Date(milestone.startDate))}
                      {milestone.startDate && milestone.endDate && " → "}
                      {milestone.endDate &&
                        formatDate(new Date(milestone.endDate))}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Select
                  value={milestone.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-32 h-8 text-xs border-0 bg-muted/50 hover:bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>

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
              onSave={async (value) => {
                await handleUpdate({ description: value || undefined });
              }}
              disabled={isUpdating}
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </div>

          {/* Properties */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Properties</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Owner</span>
                <AssigneeSelector
                  assignee={milestone.owner?.id || null}
                  onChange={async (assignee) => {
                    await handleUpdate({
                      ownerId: assignee === "unassigned" ? undefined : assignee,
                    });
                  }}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Start Date
                </span>
                <DateInput
                  value={
                    milestone.startDate
                      ? new Date(milestone.startDate)
                      : undefined
                  }
                  placeholder="Set start date"
                  onChange={async (date) => {
                    await handleUpdate({
                      startDate: date ? date.getTime() : undefined,
                    });
                  }}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">End Date</span>
                <DateInput
                  value={
                    milestone.endDate ? new Date(milestone.endDate) : undefined
                  }
                  placeholder="Set end date"
                  onChange={async (date) => {
                    await handleUpdate({
                      endDate: date ? date.getTime() : undefined,
                    });
                  }}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Completion
                </span>
                <span className="text-sm font-medium">
                  {Math.round(milestone.progress)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Issues</span>
                  <span className="font-medium">
                    {milestone.completedIssueCount}/{milestone.issueCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Features</span>
                  <span className="font-medium">
                    {milestone.completedFeatureCount}/{milestone.featureCount}
                  </span>
                </div>
              </div>
              {milestone.overdueItems > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  {milestone.overdueItems} overdue
                </div>
              )}
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
                        {milestone.dependsOn.filter(Boolean).map((dep: { id: string; name: string }) => (
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
                        {milestone.blocking.filter(Boolean).map((blocked: { id: string; name: string }) => (
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
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-shrink-0">
                            {issue.achieved ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : issue.dueDate &&
                              new Date(issue.dueDate).getTime() < Date.now() ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {issue.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {issue.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {issue.priority}
                              </Badge>
                              {issue.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(new Date(issue.dueDate))}
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
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-shrink-0">
                            {feature.achieved || feature.phase === "LIVE" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : feature.endDate &&
                              new Date(feature.endDate).getTime() <
                              Date.now() ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {feature.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {feature.phase}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {feature.priority}
                              </Badge>
                              {feature.endDate && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(new Date(feature.endDate))}
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

          {/* Activity Feed */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Activity</h3>
            </div>
            <ActivityFeed
              entityType="milestone"
              entityId={milestoneId}
              emptyMessage="No activity yet"
              limit={10}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
