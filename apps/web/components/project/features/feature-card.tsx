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
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { Id } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { useData } from "@/hooks/use-data";

interface FeatureCardProps {
  feature: any;
  index: number;
  showProject?: boolean;
  onClick?: () => void;
}

export function FeatureCard({ feature, showProject }: FeatureCardProps) {
  const router = useRouter();
  const { token } = useSession();
  const updateFeature = useMutation(api.issue.feature.updateFeature);

  // Add dependency validation
  const { data: validationResult } = useData(
    api.issue.feature.validateFeatureCompletion,
    { token, featureId: feature._id }
  );

  const handleClick = () => {
    router.push(`/features/${feature._id}`);
  };

  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpdate = async (updates: any) => {
    try {
      await updateFeature({
        token,
        featureId: feature._id as Id<"feature">,
        updates,
      });
    } catch (error) {
      console.error("Error updating feature:", error);
      toast.error("Failed to update feature");
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      DISCOVERY: "bg-secondary text-secondary-foreground",
      PLANNING: "bg-secondary text-secondary-foreground",
      DEVELOPMENT: "bg-secondary text-secondary-foreground",
      TESTING: "bg-secondary text-secondary-foreground",
      RELEASE: "bg-secondary text-secondary-foreground",
      LIVE: "bg-secondary text-secondary-foreground",
      DEPRECATED: "bg-muted text-muted-foreground",
    };
    return colors[phase] || "bg-secondary text-secondary-foreground";
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
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
            onChange={async (phase) => {
              await handleUpdate({ phase });
            }}
            blockedPhases={
              validationResult && !validationResult.canComplete ? ["LIVE"] : []
            }
            onBlockedPhaseAttempt={() => {
              toast.error(
                `Cannot move to LIVE phase - this feature has ${validationResult?.blockers.length} incomplete dependencies`
              );
            }}
          />
          <PrioritySelector
            priority={feature.priority}
            onChange={async (priority) => {
              await handleUpdate({ priority });
            }}
          />
          <AssigneeSelector
            assignee={feature.assignedTo || null}
            onChange={async (assignee) => {
              await handleUpdate({
                assignedTo: assignee === "unassigned" ? null : assignee,
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
                  startDate: date ? date.toISOString().split("T")[0] : null,
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
                  endDate: date ? date.toISOString().split("T")[0] : null,
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
