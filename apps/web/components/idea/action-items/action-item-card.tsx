"use client";

import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@/lib/utils";
import {
  actionItemPriority,
  actionItemStatus,
} from "@/utils/constants/action-items/status";
import { Button } from "@workspace/ui/components/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as actionItemActions from "@/actions/idea/action-items";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface ActionItemCardProps {
  actionItem: any;
  isDragging?: boolean;
  onClick?: () => void;
}

export function ActionItemCard({
  actionItem,
  isDragging,
  onClick,
}: ActionItemCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const deleteActionItemMutation = useMutation({
    mutationFn: async (id: string) => actionItemActions.deleteActionItem(id),
    onSuccess: () => {
      toast.success("Action item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
      queryClient.invalidateQueries({
        queryKey: ["actionItems", actionItem.ideaId],
      });
      router.refresh();
    },
    onError: (error) => {
      console.error("Failed to delete action item:", error);
      toast.error("Failed to delete action item");
    },
  });

  const statusConfig = actionItemStatus.find((s) => s.id === actionItem.status);
  const priorityConfig = actionItemPriority.find(
    (p) => p.id === actionItem.priority
  );

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this action item?")) {
      await deleteActionItemMutation.mutateAsync(actionItem.id);
    }
  };

  const handleCardClick = () => {
    onClick?.();
  };

  return (
    <div
      className={cn(
        "group relative bg-card border rounded-md p-3 cursor-pointer transition-all duration-200",
        "hover:border-border hover:shadow-sm",
        isDragging && "shadow-lg rotate-1 border-primary",
        actionItem.status === "COMPLETED" && "opacity-75"
      )}
      onClick={handleCardClick}
    >
      {/* Priority indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-md">
        <div
          className={cn(
            "h-full w-full rounded-l-md",
            priorityConfig?.id === "LOW"
              ? "bg-gray-400"
              : priorityConfig?.id === "MEDIUM"
                ? "bg-yellow-500"
                : priorityConfig?.id === "HIGH"
                  ? "bg-orange-500"
                  : priorityConfig?.id === "CRITICAL"
                    ? "bg-red-500"
                    : "bg-gray-400"
          )}
        />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-medium text-sm leading-tight text-foreground",
              actionItem.status === "COMPLETED" &&
                "line-through text-muted-foreground"
            )}
          >
            {actionItem.name}
          </h4>
        </div>

        <div className="flex items-center gap-1">
          {/* Status icon */}
          {statusConfig && (
            <div className="flex items-center">
              <statusConfig.icon
                className={cn("h-3.5 w-3.5", statusConfig.colorClass)}
              />
            </div>
          )}

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
                disabled={deleteActionItemMutation.isPending}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Description */}
      {actionItem.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {actionItem.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Left side - Priority badge */}
        <div className="flex items-center gap-2">
          {priorityConfig && (
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  priorityConfig.id === "LOW"
                    ? "bg-gray-400"
                    : priorityConfig.id === "MEDIUM"
                      ? "bg-yellow-500"
                      : priorityConfig.id === "HIGH"
                        ? "bg-orange-500"
                        : priorityConfig.id === "CRITICAL"
                          ? "bg-red-500"
                          : "bg-gray-400"
                )}
              />
              <span className="text-xs text-muted-foreground font-medium">
                {priorityConfig.name}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Assignee */}
        <div className="flex items-center gap-2">
          {actionItem.assignee && (
            <Avatar className="h-5 w-5 border">
              <AvatarImage src={actionItem.assignee.image || ""} />
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {actionItem.assignee.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Completion date */}
      {actionItem.completedAt && (
        <div className="mt-2 pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Completed {format(new Date(actionItem.completedAt), "MMM d, yyyy")}
          </span>
        </div>
      )}
    </div>
  );
}
