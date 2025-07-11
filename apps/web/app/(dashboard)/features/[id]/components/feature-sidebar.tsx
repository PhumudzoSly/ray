"use client";

import { Id } from "@workspace/backend";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { DateInput } from "@workspace/ui/components/date-input";
import { Separator } from "@workspace/ui/components/separator";
import { MilestoneSelector } from "@/components/ui/selectors/milestone-selector";
import { useState } from "react";

const FeatureSidebar = ({ featureId }: { featureId: Id<"feature"> }) => {
  const { token } = useSession();
  const updateFeature = useMutation(api.issue.feature.updateFeature);

  const { data: feature } = useData(api.issue.feature.getFeatureById, {
    token,
    id: featureId,
  });

  const { data: validationResult } = useData(
    api.issue.feature.validateFeatureCompletion,
    { token, featureId }
  );

  if (!feature) return null;

  const handleUpdate = async (updates: any) => {
    if (!featureId) return;

    try {
      await updateFeature({
        token,
        featureId: featureId as any,
        updates,
      });
    } catch (error) {
      console.error("Error updating feature:", error);
      toast.error("Failed to update feature");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Properties</h3>
        <div className="grid grid-cols-[120px_1fr] gap-y-4">
          <h3 className="text-xs font-medium text-muted-foreground">
            Priority
          </h3>
          <PrioritySelector
            priority={feature.priority}
            onChange={async (priority) => {
              await handleUpdate({ priority });
            }}
          />
          <h3 className="text-xs font-medium text-muted-foreground">Phase</h3>
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
          <h3 className="text-xs font-medium text-muted-foreground">
            Assignee
          </h3>
          <AssigneeSelector
            assignee={feature.assignedTo || null}
            onChange={async (assignee) => {
              await handleUpdate({
                assignedTo: assignee === "unassigned" ? null : assignee,
              });
            }}
          />

          <h3 className="text-xs font-medium text-muted-foreground">
            Start Date
          </h3>
          <DateInput
            value={feature.startDate ? new Date(feature.startDate) : undefined}
            placeholder="Set start date"
            onChange={async (date) => {
              await handleUpdate({
                startDate: date ? date.toISOString().split("T")[0] : null,
              });
            }}
          />
          <h3 className="text-xs font-medium text-muted-foreground">
            End Date
          </h3>

          <DateInput
            value={feature.endDate ? new Date(feature.endDate) : undefined}
            placeholder="Set end date"
            onChange={async (date) => {
              await handleUpdate({
                endDate: date ? date.toISOString().split("T")[0] : null,
              });
            }}
          />

          <h3 className="text-xs font-medium text-muted-foreground">
            Est. Effort
          </h3>
          <InlineEditField
            displayValue={
              <span className="text-sm">
                {feature.estimatedEffort
                  ? `${feature.estimatedEffort}h`
                  : "Not set"}
              </span>
            }
            value={feature.estimatedEffort?.toString() || ""}
            onSave={async (value) => {
              await handleUpdate({
                estimatedEffort: value ? parseFloat(value) : null,
              });
            }}
          />

          <h3 className="text-xs font-medium text-muted-foreground">
            Business Value
          </h3>
          <InlineEditField
            displayValue={
              <span className="text-sm">
                {feature.businessValue
                  ? `${feature.businessValue}/10`
                  : "Not set"}
              </span>
            }
            value={feature.businessValue?.toString() || ""}
            onSave={async (value) => {
              const numValue = value ? parseInt(value) : null;
              if (numValue && (numValue < 1 || numValue > 10)) {
                toast.error("Business value must be between 1 and 10");
                throw new Error("Invalid business value");
              }
              await handleUpdate({ businessValue: numValue });
            }}
          />

          <h3 className="text-xs font-medium text-muted-foreground">
            Milestone
          </h3>
          <MilestoneSelector
            projectId={feature.projectId}
            value={feature.milestoneId || undefined}
            onValueChange={async (milestoneId) => {
              await handleUpdate({ milestoneId });
            }}
          />
        </div>
      </div>

      <Separator />
    </div>
  );
};

export default FeatureSidebar;
