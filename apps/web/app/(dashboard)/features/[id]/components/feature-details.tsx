"use client";
import React, { useState } from "react";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import LoadingSpinner from "@workspace/ui/components/LoadingSpinner";
import NoData from "@/components/shared/no-data";
import { Id } from "@workspace/backend";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { BlockEditor } from "@/components/shared/block-editor";
import { GitBranch, Clock, ListOrdered, Code, Plug } from "lucide-react";
import { NewFeature } from "@/components/project/features/new-feature";
import { ActivityFeed } from "@/components/shared/activity-feed";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import FeatureDependencyManager from "@/components/project/features/feature-dependency-manager";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@/lib/utils";

const FeatureDetails = ({ id }: { id: string }) => {
  const { token } = useSession();

  const [view, setView] = useState<"details" | "dependencies" | "activity">(
    "details"
  );

  const updateFeature = useMutation(api.issue.feature.updateFeature);

  const handleUpdate = async (updates: any) => {
    if (!id) return;

    try {
      await updateFeature({
        token,
        featureId: id as any,
        updates,
      });
    } catch (error) {
      console.error("Error updating feature:", error);
      toast.error("Failed to update feature");
    }
  };
  const { data: feature, isPending } = useData(
    api.issue.feature.getFeatureById,
    {
      token,
      id: id as Id<"feature">,
    }
  );

  const { data: featureHierarchy } = useData(
    api.issue.feature.getFeatureHierarchy,
    {
      token,
      featureId: id as Id<"feature">,
    }
  );

  if (isPending || feature === undefined)
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
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Description
        </h3>
        <InlineEditTextArea
          value={feature.description || ""}
          placeholder="Add a description..."
          onSave={async (value) => {
            await handleUpdate({ description: value || undefined });
          }}
        />
      </div>

      <BlockEditor id={`feature-implementation-${feature._id}`} />

      <div className="w-full border-y">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex flex-wrap w-full gap-4 p-4">
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

      {view === "details" ? (
        <div className="py-6">
          {featureHierarchy?.parentFeature && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Plug className="h-4 w-4" />
                Parent Feature
              </h3>
              <Link
                href={`/features/${featureHierarchy.parentFeature._id}`}
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
                parentFeatureId={feature._id}
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
                    parentFeatureId={feature._id}
                  />
                </div>
                <div className="space-y-2">
                  {featureHierarchy.subFeatures.map((subFeature: any) => (
                    <Link
                      key={subFeature._id}
                      href={`/features/${subFeature._id}`}
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
            featureId={id as Id<"feature">}
            projectId={feature.projectId}
          />
        </div>
      ) : null}

      {view === "activity" ? (
        <div className="py-6">
          <ActivityFeed
            entityType="feature"
            entityId={id}
            emptyMessage="No feature activity yet"
          />
        </div>
      ) : null}
    </div>
  );
};

export default FeatureDetails;
