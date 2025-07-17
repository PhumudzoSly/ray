"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as featureActions from "@/actions/feature";
import * as issueActions from "@/actions/issue";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import DependencyGraphVisualization from "./dependency-graph-visualization";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";

interface FeatureDependencyManagerProps {
  featureId: string;
  projectId?: string;
}

interface CombinedDependency {
  id: string;
  name: string;
  description?: string;
  phase?: string;
  priority?: string;
  user?: {
    name?: string;
    image?: string;
    email?: string;
  };
  type: "dependency" | "dependent";
}

const UserAvatar = ({
  user,
}: {
  user?: { name?: string; image?: string; email?: string };
}) => {
  if (!user) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-5 w-5">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="text-xs bg-muted">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div>
            <p className="font-medium">{user.name || "Unassigned"}</p>
            {user.email && (
              <p className="text-muted-foreground">{user.email}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const FeatureDependencyManager: React.FC<
  FeatureDependencyManagerProps
> = ({ featureId, projectId }) => {
  const { token } = useSession();
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [showGraphDialog, setShowGraphDialog] = useState(false);
  const queryClient = useQueryClient();

  const addDependencyMutation = useMutation({
    mutationFn: async ({ parentId, dependentFeatureId }: { parentId: string; dependentFeatureId: string }) =>
      featureActions.addFeatureDependency({ parentId, dependentFeatureId, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["featureDependencies", featureId] }),
  });
  const removeDependencyMutation = useMutation({
    mutationFn: async ({ parentId, dependentFeatureId }: { parentId: string; dependentFeatureId: string }) =>
      featureActions.removeFeatureDependency({ parentId, dependentFeatureId, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["featureDependencies", featureId] }),
  });

  const { data: dependencies } = useQuery({
    queryKey: ["featureDependencies", featureId],
    queryFn: () => featureActions.getFeatureDependencies({ token, featureId }),
  });

  const { data: validationResult } = useQuery({
    queryKey: ["featureValidation", featureId],
    queryFn: () => featureActions.validateFeatureCompletion({ token, featureId }),
  });

  const { data: dependencyGraph } = useQuery({
    queryKey: ["featureDependencyGraph", projectId],
    queryFn: () => featureActions.getFeatureDependencyGraph({ token, projectId }),
    enabled: !!projectId,
  });

  // Combine dependencies and dependents into a single list
  const combinedDependencies = useMemo(() => {
    if (!dependencies) return [];

    const combined: CombinedDependency[] = [];

    // Add dependencies (features this feature depends on)
    dependencies.dependencies.forEach((dep) => {
      if (dep.id) {
        combined.push({
          id: dep.id,
          name: dep.name as any,
          description: dep.description,
          phase: dep.phase,
          priority: dep.priority,
          user: dep.user as any,
          type: "dependency",
        });
      }
    });

    // Add dependents (features that depend on this feature)
    dependencies.dependents.forEach((dep) => {
      if (dep.id) {
        combined.push({
          id: dep.id,
          name: dep.name as any,
          description: dep.description,
          phase: dep.phase,
          priority: dep.priority,
          user: dep.user as any,
          type: "dependent",
        });
      }
    });

    return combined.sort((a, b) => a.name.localeCompare(b.name));
  }, [dependencies]);

  const handleAddDependency = async () => {
    if (!selectedFeature) return;
    try {
      await addDependencyMutation.mutateAsync({
        parentId: selectedFeature,
        dependentFeatureId: featureId,
      });
      toast.success("Dependency added");
      setSelectedFeature(null);
      setIsAddingDependency(false);
    } catch (error) {
      toast.error("Failed to add dependency");
    }
  };
  const handleRemoveDependency = async (parentId: string) => {
    try {
      await removeDependencyMutation.mutateAsync({
        parentId,
        dependentFeatureId: featureId,
      });
      toast.success("Dependency removed");
    } catch (error) {
      toast.error("Failed to remove dependency");
    }
  };

  if (!dependencies) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {validationResult && !validationResult.canComplete && (
        <Alert variant={"destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Blocked by {validationResult.blockers.length} incomplete
            dependencies
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Dependencies</h3>
          <p className="text-sm text-muted-foreground">
            {combinedDependencies.length} related features
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={showGraphDialog} onOpenChange={setShowGraphDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="dark">
                <ArrowRight className="h-4 w-4 mr-1" />
                Manage
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full h-screen min-w-[100vw] p-0 flex flex-col">
              <DialogHeader className="border-b py-1.5">
                <DialogTitle className="text-lg flex-1">
                  Dependency Graph
                </DialogTitle>
                <DialogDescription>
                  Manage the flow of your project's features.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-background">
                <DependencyGraphVisualization
                  features={
                    dependencyGraph?.features.map((feature) => ({
                      id: feature.id,
                      name: feature.name,
                      phase: feature.phase,
                      priority: feature.priority,
                      assignedTo: feature.assignedTo,
                      user: feature.user
                        ? {
                          name: feature.user.name,
                          image: feature.user.image,
                        }
                        : undefined,
                    })) || []
                  }
                  dependencies={dependencyGraph?.dependencies || []}
                  currentFeatureId={featureId}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dependencies List */}
      {combinedDependencies.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No dependencies
        </div>
      ) : (
        <div className="space-y-px divide-y">
          {combinedDependencies.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="group flex items-center justify-between py-2 px-3 -mx-3 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {item.phase && (
                      <PhaseSelector disabled={false} phase={item.phase} />
                    )}
                    {item.type === "dependency" ? (
                      <ArrowRight className="h-3 w-3" />
                    ) : (
                      <ArrowLeft className="h-3 w-3" />
                    )}
                    <Badge className="">
                      {item.type === "dependency"
                        ? "blocks this"
                        : "blocked by this"}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate whitespace-pre-wrap line-clamp-1">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate whitespace-pre-wrap line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <UserAvatar user={item.user} />

                {item.type === "dependency" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveDependency(item.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureDependencyManager;
