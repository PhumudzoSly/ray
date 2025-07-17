"use client";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { DateInput } from "@workspace/ui/components/date-input";
import { Separator } from "@workspace/ui/components/separator";
import { MilestoneSelector } from "@/components/ui/selectors/milestone-selector";
import FeatureLinks from "./feature-links";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeatureById, updateFeature, validateFeatureCompletion } from "@/actions/project/features";

const queryClient = new QueryClient();

const FeatureSidebarInner = ({ featureId }: { featureId: string }) => {
  const { token } = useSession();
  const queryClient = useQueryClient();

  // Fetch feature details
  const { data: featureResult } = useQuery({
    queryKey: ["feature", featureId],
    queryFn: () => getFeatureById(featureId),
  });
  const feature = featureResult?.success ? featureResult.data : null;

  // Fetch validation result
  const { data: validationResult } = useQuery({
    queryKey: ["featureValidation", featureId],
    queryFn: () => validateFeatureCompletion(featureId),
    enabled: !!feature,
  });

  // Mutation for updating feature
  const { mutateAsync: updateFeatureMutation } = useMutation({
    mutationFn: async (updates: any) => {
      return await updateFeature(featureId, updates);
    },
    onMutate: async (updates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feature", featureId] });

      // Snapshot the previous value
      const previousFeature = queryClient.getQueryData(["feature", featureId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["feature", featureId], (old: any) => {
        if (!old?.success) return old;
        return {
          ...old,
          data: {
            ...old.data,
            ...updates,
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousFeature };
    },
    onError: (err, updates, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFeature) {
        queryClient.setQueryData(["feature", featureId], context.previousFeature);
      }
      toast.error("Failed to update feature");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature", featureId] });
      toast.success("Feature updated");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["feature", featureId] });
    },
  });

  if (!feature) return null;

  const handleUpdate = async (updates: any) => {
    if (!featureId) return;
    await updateFeatureMutation(updates);
  };

  return (
    <div>
      <div className="p-4 space-y-4">
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
              validationResult && !validationResult.data?.canComplete ? ["LIVE"] : []
            }
            onBlockedPhaseAttempt={() => {
              toast.error(
                `Cannot move to LIVE phase - this feature has ${validationResult?.data?.blockers.length} incomplete dependencies`
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

      <div className="p-4">
        <FeatureLinks featureId={featureId} />
      </div>
    </div>
  );
};

const FeatureSidebar = (props: { featureId: string }) => (
  <QueryClientProvider client={queryClient}>
    <FeatureSidebarInner {...props} />
  </QueryClientProvider>
);

export default FeatureSidebar;
