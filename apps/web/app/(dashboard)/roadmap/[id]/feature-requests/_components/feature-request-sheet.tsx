"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { FeatureRequestPrioritySelector } from "@/components/ui/selectors/feature-request-priority-selector";
import { FeatureRequestStatusSelector } from "@/components/ui/selectors/feature-request-status-selector";
import { FeatureRequestCategorySelector } from "@/components/ui/selectors/feature-request-category-selector";
import {
  FileText,
  Lightbulb,
  Bug,
  Sparkles,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { updateFeatureRequest } from "@/actions/roadmap/feature-requests";
import {
  convertFeatureRequestToIssue,
  convertFeatureRequestToRoadmapItem,
  convertFeatureRequestToFeature,
} from "@/actions/roadmap/conversions";
import { InlineEditField } from "@workspace/ui/components/inline-field";

interface FeatureRequestSheetProps {
  isOpen: boolean;
  onClose: () => void;
  featureRequest: any;
  roadmapId: string;
  projectId: string;
}

export function FeatureRequestSheet({
  isOpen,
  onClose,
  featureRequest,
  roadmapId,
  projectId,
}: FeatureRequestSheetProps) {
  const queryClient = useQueryClient();
  const [isConverting, setIsConverting] = useState(false);

  // Check if feature request has been converted
  const isConverted =
    featureRequest?.convertedToIssueId ||
    featureRequest?.convertedToFeatureId ||
    featureRequest?.convertedToRoadmapItemId;

  const getConversionInfo = () => {
    if (featureRequest?.convertedToIssueId) {
      return {
        type: "issue",
        id: featureRequest.convertedToIssueId,
        convertedAt: featureRequest.convertedAt,
        convertedBy: featureRequest.convertedBy,
        notes: featureRequest.conversionNotes,
      };
    }
    if (featureRequest?.convertedToFeatureId) {
      return {
        type: "feature",
        id: featureRequest.convertedToFeatureId,
        convertedAt: featureRequest.convertedAt,
        convertedBy: featureRequest.convertedBy,
        notes: featureRequest.conversionNotes,
      };
    }
    if (featureRequest?.convertedToRoadmapItemId) {
      return {
        type: "roadmap item",
        id: featureRequest.convertedToRoadmapItemId,
        convertedAt: featureRequest.convertedAt,
        convertedBy: featureRequest.convertedBy,
        notes: featureRequest.conversionNotes,
      };
    }
    return null;
  };

  const conversionInfo = getConversionInfo();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateFeatureRequest(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["featureRequests", roadmapId],
      });

      // Snapshot the previous value
      const previousFeatureRequests = queryClient.getQueryData([
        "featureRequests",
        roadmapId,
      ]);

      // Optimistically update the feature request in the list
      queryClient.setQueryData(["featureRequests", roadmapId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((fr: any) =>
            fr.id === id ? { ...fr, ...data } : fr
          ),
        };
      });

      // Also update the individual feature request data
      queryClient.setQueryData(["featureRequest", id], (old: any) =>
        old ? { ...old, ...data } : old
      );

      // Return a context object with the snapshotted value
      return { previousFeatureRequests };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFeatureRequests) {
        queryClient.setQueryData(
          ["featureRequests", roadmapId],
          context.previousFeatureRequests
        );
      }
      toast.error("Failed to update feature request");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["featureRequests", roadmapId],
      });
      queryClient.invalidateQueries({
        queryKey: ["featureRequest", featureRequest.id],
      });
    },
  });

  const convertToIssueMutation = useMutation({
    mutationFn: (data: any) => convertFeatureRequestToIssue(data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["featureRequests", roadmapId],
      });

      // Snapshot the previous value
      const previousFeatureRequests = queryClient.getQueryData([
        "featureRequests",
        roadmapId,
      ]);

      // Optimistically update the feature request to show it's converted
      queryClient.setQueryData(["featureRequests", roadmapId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((fr: any) =>
            fr.id === featureRequest.id
              ? {
                  ...fr,
                  convertedToIssueId: "temp-id",
                  convertedAt: new Date().toISOString(),
                  convertedBy: "You",
                  status: "converted",
                }
              : fr
          ),
        };
      });

      return { previousFeatureRequests };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFeatureRequests) {
        queryClient.setQueryData(
          ["featureRequests", roadmapId],
          context.previousFeatureRequests
        );
      }
      toast.error("Failed to convert to issue");
    },
    onSuccess: () => {
      toast.success("Feature request converted to issue successfully");
      queryClient.invalidateQueries({
        queryKey: ["featureRequests", roadmapId],
      });
      onClose();
    },
  });

  const convertToRoadmapItemMutation = useMutation({
    mutationFn: (data: any) => convertFeatureRequestToRoadmapItem(data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["featureRequests", roadmapId],
      });

      // Snapshot the previous value
      const previousFeatureRequests = queryClient.getQueryData([
        "featureRequests",
        roadmapId,
      ]);

      // Optimistically update the feature request to show it's converted
      queryClient.setQueryData(["featureRequests", roadmapId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((fr: any) =>
            fr.id === featureRequest.id
              ? {
                  ...fr,
                  convertedToRoadmapItemId: "temp-id",
                  convertedAt: new Date().toISOString(),
                  convertedBy: "You",
                  status: "converted",
                }
              : fr
          ),
        };
      });

      return { previousFeatureRequests };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFeatureRequests) {
        queryClient.setQueryData(
          ["featureRequests", roadmapId],
          context.previousFeatureRequests
        );
      }
      toast.error("Failed to convert to roadmap item");
    },
    onSuccess: () => {
      toast.success("Feature request converted to roadmap item successfully");
      queryClient.invalidateQueries({
        queryKey: ["featureRequests", roadmapId],
      });
      onClose();
    },
  });

  const convertToFeatureMutation = useMutation({
    mutationFn: (data: any) => convertFeatureRequestToFeature(data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["featureRequests", roadmapId],
      });

      // Snapshot the previous value
      const previousFeatureRequests = queryClient.getQueryData([
        "featureRequests",
        roadmapId,
      ]);

      // Optimistically update the feature request to show it's converted
      queryClient.setQueryData(["featureRequests", roadmapId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((fr: any) =>
            fr.id === featureRequest.id
              ? {
                  ...fr,
                  convertedToFeatureId: "temp-id",
                  convertedAt: new Date().toISOString(),
                  convertedBy: "You",
                  status: "converted",
                }
              : fr
          ),
        };
      });

      return { previousFeatureRequests };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFeatureRequests) {
        queryClient.setQueryData(
          ["featureRequests", roadmapId],
          context.previousFeatureRequests
        );
      }
      toast.error("Failed to convert to feature");
    },
    onSuccess: () => {
      toast.success("Feature request converted to feature successfully");
      queryClient.invalidateQueries({
        queryKey: ["featureRequests", roadmapId],
      });
      onClose();
    },
  });

  if (!featureRequest) return null;

  const handleUpdateField = async (field: string, value: string) => {
    updateMutation.mutate({
      id: featureRequest.id,
      data: { [field]: value },
    });
  };

  const handleConvertToIssue = async () => {
    setIsConverting(true);
    convertToIssueMutation.mutate({
      featureRequestId: featureRequest.id,
      projectId,
    });
    setIsConverting(false);
  };

  const handleConvertToRoadmapItem = async () => {
    setIsConverting(true);
    convertToRoadmapItemMutation.mutate({
      featureRequestId: featureRequest.id,
      roadmapId,
    });
    setIsConverting(false);
  };

  const handleConvertToFeature = async () => {
    setIsConverting(true);
    convertToFeatureMutation.mutate({
      featureRequestId: featureRequest.id,
      projectId,
    });
    setIsConverting(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Requested Feature
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-8 mt-4">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <InlineEditField
              value={featureRequest.title}
              onSave={(value) => handleUpdateField("title", value)}
              displayValue={
                <h3 className="text-lg font-bold text-muted-foreground">
                  {featureRequest.title}
                </h3>
              }
            />

            <h3 className="text-sm font-medium text-muted-foreground">
              Description
            </h3>
            <InlineEditTextArea
              value={featureRequest.description}
              onSave={(value) => handleUpdateField("description", value)}
              placeholder="Enter description..."
            />
            <div className="grid grid-cols-[180px_1fr] gap-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Requester
              </h3>
              <div>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-base">
                      {featureRequest.name || "Anonymous"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {featureRequest.email}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-medium text-muted-foreground">
                Created
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(featureRequest.createdAt), "MMM d, yyyy")}
                </span>
              </div>

              <h3 className="text-sm font-medium text-muted-foreground">
                Status
              </h3>
              <FeatureRequestStatusSelector
                status={featureRequest.status || "pending"}
                onChange={(value) => handleUpdateField("status", value)}
                disabled={false}
              />

              <h3 className="text-sm font-medium text-muted-foreground">
                Priority
              </h3>
              <FeatureRequestPrioritySelector
                priority={featureRequest.priority || "medium"}
                onChange={(value) => handleUpdateField("priority", value)}
                disabled={false}
              />

              <h3 className="text-sm font-medium text-muted-foreground">
                Category
              </h3>
              <FeatureRequestCategorySelector
                category={featureRequest.category || ""}
                onChange={(value) => handleUpdateField("category", value)}
                disabled={false}
              />
            </div>
          </div>

          <Separator />

          {/* Admin Controls Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Admin Notes
            </h3>
            <InlineEditTextArea
              value={featureRequest.adminNotes || ""}
              onSave={(value) => handleUpdateField("adminNotes", value)}
              placeholder="Enter admin notes..."
            />
          </div>

          <Separator />

          {/* Conversion Status */}
          {conversionInfo && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-medium text-foreground">
                  Conversion Status
                </h3>
              </div>

              <div className="group relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm p-4 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/10 text-green-600 border-green-200 dark:border-green-800">
                        Converted to {conversionInfo.type}
                      </Badge>
                    </div>

                    {conversionInfo.notes && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {conversionInfo.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {conversionInfo.convertedAt &&
                            format(
                              new Date(conversionInfo.convertedAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                        </span>
                      </div>
                      {conversionInfo.convertedBy && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          <span>{conversionInfo.convertedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Conversion Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-foreground">
                Convert with AI
              </h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Let AI analyze this request and convert it to the appropriate
              format with optimized fields and descriptions.
            </p>

            {isConverted ? (
              <div className="group relative overflow-hidden rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Already converted
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      This feature request has already been converted to a{" "}
                      {conversionInfo?.type}. You cannot convert it again.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <div
                  className="group relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm p-4 transition-all duration-200 hover:shadow-sm hover:border-border/80 cursor-pointer"
                  onClick={handleConvertToIssue}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50 flex-shrink-0">
                        <Bug className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-foreground">
                          Convert to Issue
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          For bugs, tasks, or actionable items that need to be
                          tracked and resolved.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {convertToIssueMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          disabled={isConverting}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="group relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm p-4 transition-all duration-200 hover:shadow-sm hover:border-border/80 cursor-pointer"
                  onClick={handleConvertToRoadmapItem}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-foreground">
                          Convert to Roadmap Item
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          For public roadmap items that can be shared with your
                          community and stakeholders.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {convertToRoadmapItemMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          disabled={isConverting}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="group relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm p-4 transition-all duration-200 hover:shadow-sm hover:border-border/80 cursor-pointer"
                  onClick={handleConvertToFeature}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50 flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-foreground">
                          Convert to Feature
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          For development planning and feature tracking within
                          your project.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {convertToFeatureMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          disabled={isConverting}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
