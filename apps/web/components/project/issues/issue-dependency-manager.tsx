"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  AlertTriangle,
  ArrowRight,
  GitBranch,
  Link2,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import LoadingSpinner from "@workspace/ui/components/LoadingSpinner";
import { IssueSelector } from "@/components/ui/selectors/issue-selector";

interface IssueDependencyManagerProps {
  issueId: Id<"issues">;
  projectId?: Id<"projects">;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "DONE":
      return "bg-green-100 text-green-800 border-green-200";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "BLOCKED":
      return "bg-red-100 text-red-800 border-red-200";
    case "TODO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "DONE":
      return <CheckCircle className="h-4 w-4" />;
    case "IN_PROGRESS":
      return <Clock className="h-4 w-4" />;
    case "BLOCKED":
      return <AlertCircle className="h-4 w-4" />;
    case "TODO":
      return <Target className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

export const IssueDependencyManager: React.FC<IssueDependencyManagerProps> = ({
  issueId,
  projectId,
}) => {
  const { token } = useSession();
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const addDependency = useMutation(api.issue.dependency.addIssueDependency);
  const removeDependency = useMutation(
    api.issue.dependency.removeIssueDependency
  );

  const { data: dependencies } = useData(
    api.issue.dependency.getIssueDependencies,
    { token, issueId }
  );

  const { data: validationResult } = useData(
    api.issue.dependency.validateIssueCompletion,
    { token, issueId }
  );

  const { data: dependencyGraph } = useData(
    api.issue.dependency.getIssueDependencyGraph,
    { token, projectId }
  );

  const { data: projectStats } = useData(
    api.issue.dependency.getProjectDependencyStats,
    projectId ? { token, projectId } : "skip"
  );

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
    } catch (error) {
      console.error("Error adding dependency:", error);
      toast.error("Failed to add dependency");
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

  if (!dependencies || !dependencyGraph) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dependencies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="dependents">Dependents</TabsTrigger>
          <TabsTrigger value="graph">Graph View</TabsTrigger>
        </TabsList>

        <TabsContent value="dependencies" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Issue Dependencies</h3>
              <p className="text-sm text-muted-foreground">
                Issues that must be completed before this issue can be finished
              </p>
            </div>
            <Dialog
              open={isAddingDependency}
              onOpenChange={setIsAddingDependency}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dependency
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Issue Dependency</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Issue</label>
                    <IssueSelector
                      projectId={projectId}
                      value={selectedIssue || ""}
                      onValueChange={setSelectedIssue}
                      excludeIssueId={issueId}
                    />
                  </div>
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

          {validationResult && !validationResult.canComplete && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This issue cannot be completed until{" "}
                {validationResult.blockers.length} blocking issue(s) are
                resolved.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {dependencies.dependencies.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No dependencies yet. Add dependencies to track blocking
                    issues.
                  </p>
                </CardContent>
              </Card>
            ) : (
              dependencies.dependencies.map((dependency) => (
                <Card key={dependency._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(dependency.status)}
                        <Badge className={getStatusColor(dependency.status)}>
                          {dependency.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium">{dependency.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dependency.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dependency.user && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={dependency.user.image} />
                          <AvatarFallback>
                            {dependency.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDependency(dependency._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="dependents" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Dependent Issues</h3>
            <p className="text-sm text-muted-foreground">
              Issues that are waiting for this issue to be completed
            </p>
          </div>

          <div className="space-y-3">
            {dependencies.dependents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <ArrowRight className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No dependent issues. Other issues may depend on this one
                    once it's linked.
                  </p>
                </CardContent>
              </Card>
            ) : (
              dependencies.dependents.map((dependent) => (
                <Card key={dependent._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(dependent.status)}
                        <Badge className={getStatusColor(dependent.status)}>
                          {dependent.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium">{dependent.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dependent.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dependent.user && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={dependent.user.image} />
                          <AvatarFallback>
                            {dependent.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="graph" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Dependency Graph</h3>
            <p className="text-sm text-muted-foreground">
              Visual representation of issue dependencies in this project
            </p>
          </div>

          {projectStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {projectStats.totalIssues}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {projectStats.totalDependencies}
                  </div>
                  <p className="text-sm text-muted-foreground">Dependencies</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {projectStats.blockedIssues}
                  </div>
                  <p className="text-sm text-muted-foreground">Blocked</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {projectStats.completableIssues}
                  </div>
                  <p className="text-sm text-muted-foreground">Ready</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dependencyGraph.issues.map((issue) => {
                  const issueDeps = dependencyGraph.dependencies.filter(
                    (d) => d.dependentIssueId === issue._id
                  );
                  const issueDepends = dependencyGraph.dependencies.filter(
                    (d) => d.parentId === issue._id
                  );

                  return (
                    <div
                      key={issue._id}
                      className={`p-4 border rounded-lg ${
                        issue._id === issueId
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{issue.title}</h4>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </div>
                        {issue.user && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={issue.user.image} />
                            <AvatarFallback>
                              {issue.user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Dependencies: {issueDeps.length}</span>
                        <span>Dependents: {issueDepends.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
