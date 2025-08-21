"use client";
import React, { useState } from "react";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { useSession } from "@/context/session-context";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import NoData from "@/components/shared/no-data";
import { toast } from "sonner";
import { GitBranch, Clock, Plug, Inbox, File } from "lucide-react";
import { NewFeature } from "@/components/project/features/new-feature";
import { ActivityFeed } from "@/components/shared/activity-feed";
import FeatureDependencyManager from "@/components/project/features/feature-dependency-manager";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@/lib/utils";
import { CommentThread } from "@/components/comments/comment-thread";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFeatureById,
  getFeatureHierarchy,
  updateFeature,
} from "@/actions/project/features";
import { CollaborativeEditor } from "@/components/collaborative-editor";
import { Separator } from "@workspace/ui/components/separator";

const FeatureDetails = ({ id }: { id: string }) => {
  const [view, setView] = useState<
    "details" | "dependencies" | "prd" | "activity"
  >("prd");
  const queryClient = useQueryClient();
  const session = useSession();

  // Fetch feature details (will use pre-hydrated data from server)
  const { data: featureResult, isPending: isFeaturePending } = useQuery({
    queryKey: ["feature", id],
    queryFn: () => getFeatureById(id),
  });
  const feature = featureResult?.success ? featureResult.data : null;

  // Fetch feature hierarchy
  const { data: hierarchyResult } = useQuery({
    queryKey: ["featureHierarchy", id],
    queryFn: () => getFeatureHierarchy(id),
    enabled: !!feature,
  });
  const featureHierarchy = hierarchyResult?.success
    ? hierarchyResult.data
    : null;

  // Mutation for updating feature
  const { mutateAsync: updateFeatureMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: async (updates: any) => {
        return await updateFeature(id, updates);
      },
      onMutate: async (updates) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ["feature", id] });

        // Snapshot the previous value
        const previousFeature = queryClient.getQueryData(["feature", id]);

        // Optimistically update to the new value
        queryClient.setQueryData(["feature", id], (old: any) => {
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
          queryClient.setQueryData(["feature", id], context.previousFeature);
        }
        toast.error("Failed to update feature");
      },
      onSuccess: (data, variables) => {
        // Comprehensive invalidation for real-time updates
        queryClient.invalidateQueries({ queryKey: ["feature", id] });

        // Invalidate feature hierarchy
        queryClient.invalidateQueries({ queryKey: ["featureHierarchy", id] });

        // Invalidate validation results
        queryClient.invalidateQueries({
          queryKey: ["featureValidation", id],
        });

        // Invalidate activity feed
        queryClient.invalidateQueries({
          queryKey: ["activity-feed", "FEATURE", id],
        });

        // If feature has a parent, invalidate parent's hierarchy
        if (feature?.parentFeatureId) {
          queryClient.invalidateQueries({
            queryKey: ["featureHierarchy", feature.parentFeatureId],
          });
          queryClient.invalidateQueries({
            queryKey: ["feature", feature.parentFeatureId],
          });
        }

        // Invalidate project-level queries
        if (feature?.projectId) {
          queryClient.invalidateQueries({
            queryKey: ["features", feature.projectId],
          });
          queryClient.invalidateQueries({
            queryKey: ["featureDependencyGraph", feature.projectId],
          });
          queryClient.invalidateQueries({
            queryKey: ["projectDependencyStats", feature.projectId],
          });
        }

        // Invalidate general feature queries
        queryClient.invalidateQueries({ queryKey: ["features"] });

        toast.success("Feature updated");
      },
      onSettled: () => {
        // Always refetch after error or success to ensure we have the latest data
        queryClient.invalidateQueries({ queryKey: ["feature", id] });
      },
    });

  const handleUpdate = async (updates: any) => {
    if (!id) return;
    await updateFeatureMutation(updates);
  };

  if (isFeaturePending || feature === undefined)
    return (
      <div className="flex items-center justify-center p-20">
        <LoadingSpinner />
      </div>
    );

  if (feature === null) return <NoData title="Feature not found" />;

  return (
    <div className="container space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="info">Feature</Badge>
        <Link
          href={`/project/${feature.projectId}`}
          className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1"
        >
          <span>{feature?.project?.name}</span>
        </Link>
      </div>
      <div className="p-1 5">
        <InlineEditField
          displayValue={
            <h1 className="text-2xl font-semibold leading-tight">
              {feature.name}
            </h1>
          }
          value={feature.name}
          onSave={async (value) => {
            await handleUpdate({ name: value });
          }}
        />
      </div>
      <div className="mt-2">
        <InlineEditTextArea
          value={feature.description || ""}
          placeholder="Add a description..."
          onSave={async (value) => {
            await handleUpdate({ description: value || undefined });
          }}
        />
      </div>

      <div className="w-full border-y">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex flex-wrap w-full gap-4 p-4">
            <button
              onClick={() => setView("prd")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "prd"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <File size={18} />
              Feature PRD
            </button>
            <button
              onClick={() => setView("details")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "details"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <Plug size={18} />
              Relationship
            </button>
            <button
              onClick={() => setView("dependencies")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "dependencies"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <GitBranch size={18} />
              Dependencies
            </button>
            <button
              onClick={() => setView("activity")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "activity"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <Clock size={18} />
              Activity
            </button>
          </div>
        </ScrollArea>
      </div>

      {view === "prd" ? (
        <>
          <div className="my-5">
            <CollaborativeEditor entityType="feature" entityId={id} />
          </div>
          <Separator />
          <div className="p-4">
            <CommentThread entityType="feature" entityId={id} />
          </div>
        </>
      ) : null}

      {view === "details" ? (
        <div className="py-6">
          {featureHierarchy?.parentFeature && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Plug className="h-4 w-4" />
                Parent Feature
              </h3>
              <Link
                href={`/features/${featureHierarchy.parentFeature.id}`}
                className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-medium">
                      {featureHierarchy.parentFeature.name}
                    </h4>
                    {featureHierarchy.parentFeature.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {featureHierarchy.parentFeature.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <PhaseSelector
                      disabled
                      phase={featureHierarchy.parentFeature.phase}
                    />
                    <PrioritySelector
                      priority={featureHierarchy.parentFeature.priority}
                      disabled
                    />
                  </div>
                </div>
              </Link>
            </div>
          )}

          {(!featureHierarchy?.subFeatures ||
            featureHierarchy.subFeatures.length === 0) && (
            <div className="mt-6">
              <NewFeature
                projectId={feature.projectId}
                parentFeatureId={feature.id}
              />
            </div>
          )}

          {/* Sub-Features Section */}
          {featureHierarchy?.subFeatures &&
            featureHierarchy.subFeatures.length > 0 && (
              <div className="space-y-3 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Plug className="h-4 w-4" />
                    Sub-Features ({featureHierarchy.subFeatures.length})
                  </h3>
                  <NewFeature
                    projectId={feature.projectId}
                    parentFeatureId={feature.id}
                  />
                </div>
                <div className="space-y-2">
                  {featureHierarchy.subFeatures.map((subFeature: any) => (
                    <Link
                      key={subFeature.id}
                      href={`/features/${subFeature.id}`}
                      className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-medium">{subFeature.name}</h4>
                          {subFeature.description && (
                            <p className="text-sm text-muted-foreground">
                              {subFeature.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <PhaseSelector disabled phase={subFeature.phase} />
                          <PrioritySelector
                            priority={subFeature.priority}
                            disabled
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : null}

      {view === "dependencies" ? (
        <div className="py-6">
          <FeatureDependencyManager
            featureId={id as string}
            projectId={feature.projectId}
          />
        </div>
      ) : null}

      {view === "activity" ? (
        <div className="py-6">
          <ActivityFeed
            entityType="FEATURE"
            entityId={id}
            emptyMessage="No feature activity yet"
          />
        </div>
      ) : null}
    </div>
  );
};

export default FeatureDetails;
