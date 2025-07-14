"use client";
import React, { useState } from "react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { IssueStatusField } from "@/components/ui/issue-fields/issue-status-field";
import { IssueLabelField } from "@/components/ui/issue-fields/issue-label-field";
import { IssueDueDateField } from "@/components/ui/issue-fields/issue-due-date-field";
import { IssuePriorityField } from "@/components/ui/issue-fields/issue-priority-field";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useSession } from "@/context/session-context";
import { useData } from "@/hooks/use-data";
import NoData from "@/components/shared/no-data";
import IssueLinks from "./issue-links";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { MilestoneSelector } from "@/components/ui/selectors/milestone-selector";
import { IssueSelector } from "@/components/ui/selectors/issue-selector";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
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

const IssueSidebar = ({ issueId }: { issueId: Id<"issues"> }) => {
  const { token } = useSession();
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  // Fetch issue details
  const { data: issue, isPending } = useData(api.issue.index.getIssueById, {
    token,
    id: issueId,
  });

  const { data: dependencies } = useData(
    api.issue.dependency.getIssueDependencies,
    { token, issueId }
  );

  const { data: validationResult } = useData(
    api.issue.dependency.validateIssueCompletion,
    { token, issueId }
  );

  const { data: issueHierarchy } = useData(
    api.issue.dependency.getIssueHierarchy,
    { token, issueId }
  );

  const { data: descendantIssueIds } = useData(
    api.issue.dependency.getAllDescendantIssues,
    { token, issueId }
  );

  const changeLeader = useMutation(api.issue.quickAction.changeIssueAssignedTo);
  const updateIssue = useMutation(api.issue.index.updateIssue);
  const addDependency = useMutation(api.issue.dependency.addIssueDependency);
  const removeDependency = useMutation(
    api.issue.dependency.removeIssueDependency
  );

  if (isPending || issue === undefined) return <IssueSidebarSkeleton />;
  if (issue === null) return <NoData />;

  // Exclude current issue and all its descendants from dependency/parent selection
  const excludedIssueIds = [issueId, ...(descendantIssueIds || [])];

  const handleAddDependency = async () => {
    if (!selectedIssue) return;

    try {
      await addDependency({
        token,
        parentId: selectedIssue as Id<"issues">,
        dependentIssueId: issueId,
      });

      toast.success("Dependency added successfully");
      setSelectedIssue(null);
      setIsAddingDependency(false);
    } catch (error: any) {
      console.error("Error adding dependency:", error);
      if (error.message?.includes("circular dependency")) {
        toast.error("Cannot add dependency: would create circular dependency");
      } else if (error.message?.includes("already exists")) {
        toast.error("Dependency already exists");
      } else {
        toast.error("Failed to add dependency");
      }
    }
  };

  const handleRemoveDependency = async (parentId: Id<"issues">) => {
    try {
      await removeDependency({
        token,
        parentId,
        dependentIssueId: issueId,
      });
      toast.success("Dependency removed successfully");
    } catch (error) {
      console.error("Error removing dependency:", error);
      toast.error("Failed to remove dependency");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BACKLOG":
        return "bg-gray-100 text-gray-800";
      case "TODO":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEW":
        return "bg-orange-100 text-orange-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
        <Badge
          className={`${getStatusColor(dep.status || "")} mb-2 text-xs shrink-0`}
        >
          {dep.status}
        </Badge>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{dep.title}</p>
          {dep.user && (
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-4 w-4">
                <AvatarImage src={dep.user.image} />
                <AvatarFallback className="text-xs">
                  {dep.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {dep.user.name}
              </span>
            </div>
          )}
        </div>
      </div>
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
  );

  const EmptyState = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: any;
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
            assignee={(issue.assignedTo as string) || ""}
            onChange={async (e) => {
              try {
                await changeLeader({
                  issueId,
                  token,
                  userId: e as any,
                });
              } catch (error) {
                toast.error("Failed to change issue leader");
              }
            }}
          />

          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <IssueStatusField issueId={issueId} value={issue?.status} />

          <h3 className="text-sm font-medium text-muted-foreground">
            Priority
          </h3>
          <IssuePriorityField issueId={issueId} value={issue?.priority} />

          <h3 className="text-sm font-medium text-muted-foreground">Label</h3>
          <IssueLabelField issueId={issueId} value={issue?.label} />

          <h3 className="text-sm font-medium text-muted-foreground">
            Due Date
          </h3>
          <IssueDueDateField
            issueId={issueId}
            value={issue?.dueDate ? new Date(issue?.dueDate) : null}
          />

          <h3 className="text-sm font-medium text-muted-foreground">
            Milestone
          </h3>
          <MilestoneSelector
            projectId={issue.projectId}
            value={issue.milestoneId || undefined}
            onValueChange={async (milestoneId) => {
              try {
                await updateIssue({
                  token,
                  issueId,
                  updates: { milestoneId },
                });
                toast.success("Issue milestone updated");
              } catch (error) {
                toast.error("Failed to update issue milestone");
              }
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
                <p className="text-xs text-muted-foreground">
                  Note: You cannot select this issue's sub-issues or issues that
                  would create circular dependencies.
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
                    disabled={!selectedIssue}
                  >
                    Add Dependency
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
                {dependencies.dependencies.map((dep) => (
                  <DependencyCard
                    key={dep._id}
                    dep={dep}
                    showRemove={true}
                    onRemove={() => dep._id && handleRemoveDependency(dep._id)}
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
                {dependencies.dependents.map((dep) => (
                  <DependencyCard key={dep._id} dep={dep} />
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
