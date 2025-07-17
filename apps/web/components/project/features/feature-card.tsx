"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  Clock,
  Target,
  FolderIcon,
  Calendar,
  Eye,
  GitBranch,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import Link from "next/link";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { DateInput } from "@workspace/ui/components/date-input";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as featureActions from "@/actions/project/features";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Feature, FeaturePhaseType, ImportanceType, FeatureOptionalDefaults } from "@workspace/backend";

interface FeatureCardProps {
  feature: Feature & {
    assignedTo?: {
      id: string;
      name: string;
      email: string;
      image?: string;
    } | null;
    parentFeature?: {
      id: string;
      name: string;
    } | null;
    subFeatures?: Feature[];
    dependencies?: Array<{
      dependency: Feature;
    }>;
    dependentOn?: Array<{
      feature: Feature;
    }>;
    isSubFeature?: boolean;
  };
  index: number;
  onClick?: () => void;
}

export function FeatureCard({ feature, }: FeatureCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // TanStack mutation for updating a feature
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, updates }: { featureId: string; updates: Partial<FeatureOptionalDefaults> }) => {
      return await featureActions.updateFeature(featureId, updates as any);
    },
    onMutate: async ({ featureId, updates }) => {
      await queryClient.cancelQueries();
      const previousFeatures = queryClient.getQueryData<Feature[]>(["features", feature.projectId]);
      queryClient.setQueryData<Feature[]>(["features", feature.projectId], (old) => {
        if (!old) return old;
        return old.map((f) =>
          f.id === featureId ? { ...f, ...updates } : f
        );
      });
      return { previousFeatures };
    },
    onError: (err, variables, context) => {
      if (context?.previousFeatures) {
        queryClient.setQueryData(["features", feature.projectId], context.previousFeatures);
      }
      toast.error("Failed to update feature");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["features", feature.projectId] });
    },
  });

  // Add dependency validation
  const { data: validationResult } = useQuery({
    queryKey: ["validateFeatureCompletion", feature.id],
    queryFn: () => featureActions.validateFeatureCompletion(feature.id),
  });

  const handleClick = () => {
    router.push(`/features/${feature.id}`);
  };

  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpdate = async (updates: Partial<FeatureOptionalDefaults>) => {
    updateFeatureMutation.mutate({
      featureId: feature.id,
      updates,
    });
  };



  return (
    <Card
      className="hover:shadow-md transition-shadow"
    // onClick={handleClick}
    >
      <CardHeader>
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <InlineEditField
              displayValue={
                <h3 className="font-semibold text-base leading-tight">
                  {feature.name}
                </h3>
              }
              value={feature.name}
              onSave={async (value) => {
                await handleUpdate({ name: value });
              }}
            />
            {feature.isSubFeature && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Sub-feature of:{" "}
                      {feature.parentFeature?.name || "Parent feature"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleClick}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Phase and Priority */}
        <div className="flex gap-2 flex-wrap" onClick={handleInteractiveClick}>
          <PhaseSelector
            phase={feature.phase}
            onChange={async (phase: string) => {
              await handleUpdate({ phase: phase as FeaturePhaseType });
            }}
            blockedPhases={
              validationResult && validationResult.success && !validationResult?.data?.canComplete ? ["LIVE"] : []
            }
            onBlockedPhaseAttempt={() => {
              toast.error(
                `Cannot move to LIVE phase - this feature has ${validationResult && validationResult.success ? validationResult?.data?.blockers?.length : 0} incomplete dependencies`
              );
            }}
          />
          <PrioritySelector
            priority={feature.priority}
            onChange={async (priority: string) => {
              await handleUpdate({ priority: priority as ImportanceType });
            }}
          />
          <AssigneeSelector
            assignee={feature.assignedToId || null}
            onChange={async (assignee) => {
              await handleUpdate({
                assignedToId: assignee === "unassigned" ? null : assignee,
              });
            }}
          />
        </div>

        {/* Dates */}
        <div
          className="grid grid-cols-2 gap-2"
          onClick={handleInteractiveClick}
        >
          <div>
            <div className="text-xs text-muted-foreground mb-1">Start Date</div>
            <DateInput
              value={
                feature.startDate ? new Date(feature.startDate) : undefined
              }
              onChange={async (date) => {
                await handleUpdate({
                  startDate: date ? new Date(date) : null,
                });
              }}
              placeholder="Set start"
              className="h-8 text-sm w-full"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">End Date</div>
            <DateInput
              value={feature.endDate ? new Date(feature.endDate) : undefined}
              onChange={async (date) => {
                await handleUpdate({
                  endDate: date ? new Date(date) : null,
                });
              }}
              placeholder="Set end"
              className="h-8 text-sm w-full"
            />
          </div>
        </div>

        {/* Effort and Value */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {feature.estimatedEffort
                ? `${feature.estimatedEffort}h`
                : "No estimate"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {feature.businessValue
                ? `${feature.businessValue}/10`
                : "No value"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
