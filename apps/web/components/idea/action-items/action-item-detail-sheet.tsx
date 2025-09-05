"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ActionItemStatusSelector } from "@/components/ui/selectors/action-item-status-selector";
import { ActionItemPrioritySelector } from "@/components/ui/selectors/action-item-priority-selector";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { InlineEdit } from "@workspace/ui/components/inline-edit";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as actionItemActions from "@/actions/idea/action-items";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ActionItemStatus,
  Importance,
} from "@workspace/backend/prisma/generated/client/client";
import {
  actionItemStatus,
  actionItemPriority,
} from "@/utils/constants/action-items/status";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { CollaborativeEditor } from "@/components/collaborative-editor";

interface ActionItemDetailSheetProps {
  actionItem: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActionItemDetailSheet({
  actionItem,
  open,
  onOpenChange,
}: ActionItemDetailSheetProps) {
  const queryClient = useQueryClient();

  // Update action item mutation
  const updateActionItemMutation = useMutation({
    mutationFn: async (data: any) =>
      actionItemActions.updateActionItem(actionItem?.id, data),
    onMutate: async (newData) => {
      // Optimistic update logic similar to issue sidebar
      await queryClient.cancelQueries({
        queryKey: ["actionItems", actionItem?.ideaId],
      });
      const previousData = queryClient.getQueryData([
        "actionItems",
        actionItem?.ideaId,
      ]);

      queryClient.setQueryData(
        ["actionItems", actionItem?.ideaId],
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((item: any) =>
              item.id === actionItem?.id ? { ...item, ...newData } : item
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["actionItems", actionItem?.ideaId],
          context.previousData
        );
      }
      toast.error("Failed to update action item");
    },
    onSuccess: () => {
      toast.success("Action item updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["actionItems", actionItem?.ideaId],
      });
    },
  });

  // Handle inline edits
  const handleNameUpdate = async (newName: string) => {
    if (!newName.trim()) {
      toast.error("Action item name is required");
      throw new Error("Name is required");
    }
    await updateActionItemMutation.mutateAsync({ name: newName });
  };

  const handleDescriptionUpdate = async (newDescription: string) => {
    await updateActionItemMutation.mutateAsync({
      description: newDescription || undefined,
    });
  };

  if (!actionItem) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full md:w-[600px sm:max-w-[600px]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const statusConfig = actionItemStatus.find((s) => s.id === actionItem.status);
  const priorityConfig = actionItemPriority.find(
    (p) => p.id === actionItem.priority
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full px-0 md:w-[600px sm:max-w-[600px]">
        <SheetHeader className="px-4 py-0 pb-4">
          <SheetTitle className="text-left">Action Details</SheetTitle>
          <SheetDescription>
            Manage key actions and validation tasks
          </SheetDescription>
        </SheetHeader>
        <Separator />

        <div className="space-y-6">
          {/* Title and Description */}
          <div className="space-y-4 px-6 mt-4">
            <div>
              <InlineEditField
                value={actionItem.name || ""}
                onSave={handleNameUpdate}
                className="text-lg font-semibold"
                disabled={updateActionItemMutation.isPending}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Description
              </label>
              <InlineEditTextArea
                value={actionItem.description || ""}
                onSave={handleDescriptionUpdate}
                placeholder="Add a description for this action item..."
                disabled={updateActionItemMutation.isPending}
              />
            </div>
          </div>

          <Separator />

          {/* Attributes */}
          <div className="space-y-4 px-6">
            <h3 className="text-sm font-semibold text-foreground">
              Attributes
            </h3>

            <div className="grid grid-cols-[140px_1fr] gap-y-4 gap-x-3">
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
              <ActionItemStatusSelector
                status={actionItem.status}
                onChange={(status: ActionItemStatus) => {
                  updateActionItemMutation.mutate({ status });
                }}
                disabled={updateActionItemMutation.isPending}
              />

              <span className="text-sm font-medium text-muted-foreground">
                Priority
              </span>
              <PrioritySelector
                priority={actionItem.priority}
                onChange={(priority: any) => {
                  updateActionItemMutation.mutate({ priority });
                }}
                disabled={updateActionItemMutation.isPending}
              />

              <span className="text-sm font-medium text-muted-foreground">
                Assignee
              </span>
              <AssigneeSelector
                assignee={actionItem.assigneeId}
                onChange={(assigneeId: string) => {
                  updateActionItemMutation.mutate({
                    assigneeId: assigneeId === "unassigned" ? null : assigneeId,
                  });
                }}
              />
            </div>
          </div>

          <Separator />

          <CollaborativeEditor
            entityId={actionItem.id}
            entityType="actionItem"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
