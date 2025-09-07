"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  actionItemStatus,
  actionItemPriority,
} from "@/utils/constants/action-items/status";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as actionItemActions from "@/actions/idea/action-items";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { ActionItemStatusSelector } from "@/components/ui/selectors/action-item-status-selector";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";

interface ActionItemsListProps {
  actionItems: any[];
  ideaId: string;
  onActionItemClick?: (actionItem: any) => void;
}

export function ActionItemsList({
  actionItems,
  ideaId,
  onActionItemClick,
}: ActionItemsListProps) {
  //
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const router = useRouter();

  const deleteActionItemMutation = useMutation({
    mutationFn: async (id: string) => actionItemActions.deleteActionItem(id),
    onSuccess: () => {
      toast.success("Action item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
      queryClient.invalidateQueries({ queryKey: ["actionItems", ideaId] });
      router.refresh();
    },
    onError: (error) => {
      console.error("Failed to delete action item:", error);
      toast.error("Failed to delete action item");
    },
  });

  const handleDelete = async (e: React.MouseEvent, actionItemId: string) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: "Delete Action Item",
      description:
        "This action cannot be undone. Are you sure you want to delete this action item?",
    });

    if (isConfirmed) {
      await deleteActionItemMutation.mutateAsync(actionItemId);
    }
  };

  if (actionItems.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-lg">
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-foreground">
            No action items yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Start by creating validation tasks for your idea
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableBody>
            {actionItems.map((actionItem) => {
              const priorityConfig = actionItemPriority.find(
                (p) => p.id === actionItem.priority
              );

              return (
                <TableRow
                  key={actionItem.id}
                  className={cn(
                    "group cursor-pointer transition-colors hover:bg-muted/50",
                    actionItem.status === "COMPLETED" && "opacity-60"
                  )}
                  onClick={() => onActionItemClick?.(actionItem)}
                >
                  {/* Priority indicator */}
                  <TableCell className="w-8 p-0">
                    <div className="h-full flex items-center">
                      <div
                        className={cn(
                          "w-1 h-8 rounded-r",
                          priorityConfig?.id === "CRITICAL"
                            ? "bg-red-500"
                            : priorityConfig?.id === "HIGH"
                              ? "bg-orange-500"
                              : priorityConfig?.id === "MEDIUM"
                                ? "bg-yellow-500"
                                : "bg-muted-foreground/20"
                        )}
                      />
                    </div>
                  </TableCell>

                  {/* Name & Description */}
                  <TableCell className="py-3 min-w-[200px]">
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "font-medium text-sm line-clamp-1 leading-tight text-foreground"
                        )}
                      >
                        {actionItem.name}
                      </div>
                      {actionItem.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                          {actionItem.description}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Priority */}
                  <TableCell className="w-20 text-center p-2 hidden md:table-cell">
                    <PrioritySelector priority={actionItem.priority} disabled />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="w-24 text-center p-2">
                    <ActionItemStatusSelector
                      status={actionItem.status}
                      disabled
                    />
                  </TableCell>

                  {/* Assignee */}
                  <TableCell className="w-20 text-center p-2 hidden lg:table-cell">
                    {actionItem.assignee ? (
                      <AssigneeSelector
                        disabled
                        assignee={actionItem.assignee.id}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="w-8 p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(e, actionItem.id)}
                          className="text-destructive focus:text-destructive"
                          disabled={deleteActionItemMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
