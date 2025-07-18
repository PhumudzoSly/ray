"use client";
import React, { useState } from "react";
import { IssueStatusField } from "@/components/ui/issue-fields/issue-status-field";
import { IssueLabelField } from "@/components/ui/issue-fields/issue-label-field";
import { IssueDueDateField } from "@/components/ui/issue-fields/issue-due-date-field";
import { IssuePriorityField } from "@/components/ui/issue-fields/issue-priority-field";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useSession } from "@/context/session-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import NoData from "@/components/shared/no-data";
import IssueLinks from "./issue-links";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { MilestoneSelector } from "@/components/ui/selectors/milestone-selector";
import { IssueSelector } from "@/components/ui/selectors/issue-selector";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  AlertCircle,
  ArrowRight,
  GitBranch,
  Plus,
  Trash2,
  CheckCircle,
  Target,
  Users,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { StatusSelector } from "@/components/ui/selectors/status-selector";

function IssueSidebarSkeleton() {
  return (
    <div className="container">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-1/2 mb-2" />
        <div className="grid grid-cols-[140px_1fr] gap-y-3">
          {[...Array(5)].map((_, idx) => (
            <React.Fragment key={idx}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const IssueSidebar = ({ issueId }: { issueId: string }) => {
  const { token } = useSession();
  const queryClient = useQueryClient();
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  // Fetch issue details
  const { data: issue, isLoading: isPending } = useQuery({
    queryKey: ["issue", issueId],
    queryFn: async () => {
      const res = await issueActions.getIssue(issueId);
      return res.success ? res.data : null;
    },
    enabled: !!issueId,
  });

  const { data: dependencies } = useQuery({
    queryKey: ["issueDependencies", issueId],
    queryFn: async () => issueActions.getIssueDependencies({ issueId }),
    enabled: !!issueId,
  });

  const { data: validationResult } = useQuery({
    queryKey: ["issueValidation", issueId],
    queryFn: async () => issueActions.validateIssueCompletion({ issueId }),
    enabled: !!issueId,
  });

  const { data: descendantIssueIds } = useQuery({
    queryKey: ["descendantIssues", issueId],
    queryFn: async () => issueActions.getAllDescendantIssues({ issueId }),
    enabled: !!issueId,
  });

  // Optimistic update for changing assignee
  const changeLeaderMutation = useMutation({
    mutationFn: async ({
      issueId,
      userId,
    }: {
      issueId: string;
      userId: string;
    }) => issueActions.updateIssue(issueId, { assignedToId: userId }),
    onMutate: async ({ issueId, userId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["issue", issueId] });

      // Snapshot the previous value
      const previousIssue = queryClient.getQueryData(["issue", issueId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["issue", issueId], (old: any) => ({
        ...old,
        assignedToId: userId,
        assignedTo: { id: userId, name: "Loading..." }, // Placeholder
      }));

      // Return a context object with the snapshotted value
      return { previousIssue };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIssue) {
        queryClient.setQueryData(
          ["issue", variables.issueId],
          context.previousIssue
        );
      }
      toast.error("Failed to change issue leader");
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["issue", variables.issueId] });
    },
  });

  // Optimistic update for general issue updates
  const updateIssueMutation = useMutation({
    mutationFn: async (data: any) => issueActions.updateIssue(issueId, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["issue", issueId] });
      const previousIssue = queryClient.getQueryData(["issue", issueId]);

      queryClient.setQueryData(["issue", issueId], (old: any) => ({
        ...old,
        ...newData,
      }));

      return { previousIssue };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(["issue", issueId], context.previousIssue);
      }
      toast.error("Failed to update issue");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
    },
  });

  // Optimistic update for adding dependency
  const addDependencyMutation = useMutation({
    mutationFn: async ({
      parentId,
      dependentIssueId,
    }: {
      parentId: string;
      dependentIssueId: string;
    }) => issueActions.addIssueDependency({ parentId, dependentIssueId }),
    onMutate: async ({ parentId, dependentIssueId }) => {
      await queryClient.cancelQueries({
        queryKey: ["issueDependencies", dependentIssueId],
      });
      const previousDependencies = queryClient.getQueryData([
        "issueDependencies",
        dependentIssueId,
      ]);

      // Optimistically add the dependency
      queryClient.setQueryData(
        ["issueDependencies", dependentIssueId],
        (old: any) => {
          if (!old) return { dependencies: [], dependents: [] };

          // Check if dependency already exists to prevent duplicates
          const dependencyExists = old.dependencies.some(
            (dep: any) => dep.id === parentId
          );
          if (dependencyExists) {
            return old; // Don't add if already exists
          }

          // Create a placeholder dependency object
          const newDependency = {
            id: parentId,
            title: "Loading...",
            status: "TODO",
            assignedTo: null,
            project: null,
          };

          return {
            ...old,
            dependencies: [...old.dependencies, newDependency],
          };
        }
      );

      return { previousDependencies };
    },
    onError: (err, variables, context) => {
      if (context?.previousDependencies) {
        queryClient.setQueryData(
          ["issueDependencies", variables.dependentIssueId],
          context.previousDependencies
        );
      }

      if (err instanceof Error) {
        if (err.message?.includes("circular dependency")) {
          toast.error(
            "Cannot add dependency: would create circular dependency"
          );
        } else if (err.message?.includes("already exists")) {
          toast.error("Dependency already exists");
        } else {
          toast.error("Failed to add dependency");
        }
      } else {
        toast.error("Failed to add dependency");
      }
    },
    onSuccess: () => {
      toast.success("Dependency added successfully");
      setSelectedIssue(null);
      setIsAddingDependency(false);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["issueDependencies", variables.dependentIssueId],
      });
    },
  });

  // Optimistic update for removing dependency
  const removeDependencyMutation = useMutation({
    mutationFn: async ({
      parentId,
      dependentIssueId,
    }: {
      parentId: string;
      dependentIssueId: string;
    }) => issueActions.removeIssueDependency({ parentId, dependentIssueId }),
    onMutate: async ({ parentId, dependentIssueId }) => {
      await queryClient.cancelQueries({
        queryKey: ["issueDependencies", dependentIssueId],
      });
      const previousDependencies = queryClient.getQueryData([
        "issueDependencies",
        dependentIssueId,
      ]);

      // Optimistically remove the dependency
      queryClient.setQueryData(
        ["issueDependencies", dependentIssueId],
        (old: any) => {
          if (!old) return { dependencies: [], dependents: [] };

          return {
            ...old,
            dependencies: old.dependencies.filter(
              (dep: any) => dep.id !== parentId
            ),
          };
        }
      );

      return { previousDependencies };
    },
    onError: (err, variables, context) => {
      if (context?.previousDependencies) {
        queryClient.setQueryData(
          ["issueDependencies", variables.dependentIssueId],
          context.previousDependencies
        );
      }
      toast.error("Failed to remove dependency");
    },
    onSuccess: () => {
      toast.success("Dependency removed successfully");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["issueDependencies", variables.dependentIssueId],
      });
    },
  });

  if (isPending || issue === undefined) return <IssueSidebarSkeleton />;
  if (issue === null) return <NoData />;

  // Exclude current issue and all its descendants from dependency/parent selection
  const excludedIssueIds = [issueId, ...(descendantIssueIds || [])];

  const handleAddDependency = async () => {
    if (!selectedIssue) return;

    addDependencyMutation.mutate({
      parentId: selectedIssue,
      dependentIssueId: issueId,
    });
  };

  const handleRemoveDependency = async (parentId: string) => {
    removeDependencyMutation.mutate({
      parentId,
      dependentIssueId: issueId,
    });
  };

  const DependencyCard = ({
    dep,
    showRemove = false,
    onRemove,
  }: {
    dep: any;
    showRemove?: boolean;
    onRemove?: () => void;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
      <div className="gap-3 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <StatusSelector status={dep.status} disabled />
          {showRemove && onRemove && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="min-w-0 mt-1 flex-1">
          <p className="text-sm font-medium line-clamp-2">{dep.title}</p>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
  }) => (
    <div className="text-center py-8 text-muted-foreground">
      <Icon className="h-12 w-12 mx-auto mb-3 opacity-40" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs mt-1">{description}</p>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold"> Attributes</h2>

        <div className="grid grid-cols-[120px_1fr] gap-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Assignee
          </h3>
          <AssigneeSelector
            assignee={
              typeof issue.assignedTo === "string"
                ? issue.assignedTo
                : issue.assignedTo?.id || ""
            }
            onChange={async (e) => {
              changeLeaderMutation.mutate({
                issueId,
                userId: e as any,
              });
            }}
          />

          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <IssueStatusField
                    issueId={issueId}
                    value={issue?.status}
                    onChange={async (status) => {
                      updateIssueMutation.mutate({ status });
                    }}
                  />
                </div>
              </TooltipTrigger>
              {validationResult && !validationResult.canComplete && (
                <TooltipContent>
                  <p className="text-xs">
                    Cannot mark as done: blocked by{" "}
                    {validationResult.blockers.length} uncompleted dependencies
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <h3 className="text-sm font-medium text-muted-foreground">
            Priority
          </h3>
          <IssuePriorityField
            issueId={issueId}
            value={issue?.priority}
            onChange={async (priority) => {
              updateIssueMutation.mutate({ priority });
            }}
          />

          <h3 className="text-sm font-medium text-muted-foreground">Label</h3>
          <IssueLabelField
            issueId={issueId}
            value={issue?.label}
            onChange={async (label) => {
              updateIssueMutation.mutate({ label });
            }}
          />

          <h3 className="text-sm font-medium text-muted-foreground">
            Due Date
          </h3>
          <IssueDueDateField
            issueId={issueId}
            value={issue?.dueDate ? new Date(issue?.dueDate) : null}
            onChange={async (dueDate) => {
              updateIssueMutation.mutate({ dueDate: dueDate || undefined });
            }}
          />

          <h3 className="text-sm font-medium text-muted-foreground">
            Milestone
          </h3>
          <MilestoneSelector
            projectId={issue.projectId}
            value={issue.milestoneId || undefined}
            onValueChange={async (milestoneId) => {
              updateIssueMutation.mutate({
                milestoneId,
              });
            }}
          />
        </div>
      </div>

      <Separator />

      {/* Dependencies Section with Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-muted-foreground">Dependencies</h3>
          <Dialog
            open={isAddingDependency}
            onOpenChange={setIsAddingDependency}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Issue Dependency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select an issue that this issue depends on. This issue will be
                  blocked until the selected issue is completed.
                </p>
                <IssueSelector
                  projectId={issue.projectId}
                  value={selectedIssue || ""}
                  onValueChange={(value) => setSelectedIssue(value)}
                  excludeIssueId={excludedIssueIds}
                  placeholder="Select dependency issue..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingDependency(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddDependency}
                    disabled={!selectedIssue || addDependencyMutation.isPending}
                  >
                    {addDependencyMutation.isPending
                      ? "Adding..."
                      : "Add Dependency"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Completion Status */}
        {validationResult && (
          <Alert
            className={`${
              validationResult.canComplete
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <AlertDescription className="text-xs">
              {validationResult.canComplete ? (
                <span className="text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Ready to complete
                </span>
              ) : (
                <span className="text-red-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Blocked by {validationResult.blockers.length} dependencies
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Warning for DONE issues that are blocked */}
        {validationResult &&
          !validationResult.canComplete &&
          issue?.status === "DONE" && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-xs">
                <span className="text-orange-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Warning: Issue is marked as DONE but has uncompleted
                  dependencies
                </span>
              </AlertDescription>
            </Alert>
          )}

        {/* Dependencies Tabs */}
        <Tabs defaultValue="dependencies" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="dependencies" className="text-xs">
              <ArrowRight className="h-3 w-3 mr-1" />
              Depends on ({dependencies?.dependencies.length || 0})
            </TabsTrigger>
            <TabsTrigger value="dependents" className="text-xs">
              <GitBranch className="h-3 w-3 mr-1" />
              Blocks ({dependencies?.dependents.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dependencies" className="mt-4 space-y-3">
            {dependencies && dependencies.dependencies.length > 0 ? (
              <div className="space-y-2">
                {dependencies.dependencies.map((dep, index) => (
                  <DependencyCard
                    key={`${dep.id}-${index}`}
                    dep={dep}
                    showRemove={true}
                    onRemove={() => dep.id && handleRemoveDependency(dep.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="No dependencies"
                description="This issue can be worked on independently"
              />
            )}
          </TabsContent>

          <TabsContent value="dependents" className="mt-4 space-y-3">
            {dependencies && dependencies.dependents.length > 0 ? (
              <div className="space-y-2">
                {dependencies.dependents.map((dep, index) => (
                  <DependencyCard key={`${dep.id}-${index}`} dep={dep} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No dependents"
                description="No other issues depend on this one"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      <IssueLinks issueId={issueId as any} />
    </div>
  );
};

export default IssueSidebar;
