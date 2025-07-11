"use client";
import React from "react";
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
import { GitBranch, Clock, ListOrdered, Code } from "lucide-react";
import { NewFeature } from "@/components/project/features/new-feature";
import { ActivityFeed } from "@/components/shared/activity-feed";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import FeatureDependencyManager from "@/components/project/features/feature-dependency-manager";

const FeatureDetails = ({ id }: { id: string }) => {
  const { token } = useSession();

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

      <Tabs defaultValue="plan">
        <TabsList>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Implementation Plan
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="mt-4">
          <BlockEditor id={`feature-implementation-${feature._id}`} />
        </TabsContent>
      </Tabs>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details" className="flex gap-2 items-center">
            <ListOrdered size={18} />
            Details
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="flex gap-2 items-center">
            <GitBranch size={18} />
            Dependencies
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex gap-2 items-center">
            <Clock size={18} />
            Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="py-6">
          {featureHierarchy?.parentFeature && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Parent Feature
              </h3>
              <Link
                href={`/features/${featureHierarchy.parentFeature._id}`}
                className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
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
                  <Badge variant="secondary">
                    {featureHierarchy.parentFeature.phase}
                  </Badge>
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
                    <GitBranch className="h-4 w-4" />
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
                          <Badge variant="secondary">{subFeature.phase}</Badge>
                          <Badge variant="outline">{subFeature.priority}</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </TabsContent>

        <TabsContent value="dependencies" className="py-6">
          {/* <FeatureDependencies featureId={id as Id<"feature">} /> */}
          <FeatureDependencyManager
            featureId={id as Id<"feature">}
            projectId={feature.projectId}
          />
        </TabsContent>

        <TabsContent value="activity" className="py-6">
          <ActivityFeed
            entityType="feature"
            entityId={id}
            emptyMessage="No feature activity yet"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureDetails;
