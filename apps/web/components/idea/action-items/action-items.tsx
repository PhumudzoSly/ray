"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ActionItemsList } from "./action-items-list";
import { NewActionItem } from "./new-action-item";
import { ActionItemDetailSheet } from "./action-item-detail-sheet";
import * as actionItemActions from "@/actions/idea/action-items";
import { useSession } from "@/context/session-context";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertCircle } from "lucide-react";
import { FaMagic } from "react-icons/fa";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { runWorkflow } from "@/lib/upstash";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";

interface ActionItemsProps {
  ideaId: string;
}

export function ActionItems({ ideaId }: ActionItemsProps) {
  const [selectedActionItem, setSelectedActionItem] = useState<any | null>(
    null
  );
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [userInstructions, setUserInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    data: actionItemsResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["actionItems", ideaId],
    queryFn: async () => {
      return await actionItemActions.getActionItems(ideaId);
    },
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes (120,000 ms)
  });

  const handleAIFinderWithInstructions = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      const body = {
        ideaId,
        ...(userInstructions.trim() && {
          userInstructions: userInstructions.trim(),
        }),
      };

      await toast.promise(runWorkflow({ url: "/idea/action-items", body }), {
        loading: "Booting agent....",
        success: "Ray agent is researching for action items...",
        error: "Failed to boot agent",
      });

      setIsAIModalOpen(false);
      setUserInstructions("");
    } catch (error) {
      console.error("Error running AI finder:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIModalOpen = () => {
    setIsAIModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-b last:border-b-0"
              >
                <Skeleton className="w-1 h-8" />
                <Skeleton className="w-8 h-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-20 h-6" />
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-12 h-3" />
                <Skeleton className="w-8 h-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !actionItemsResult?.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Action Items</h2>
            <p className="text-sm text-muted-foreground">
              Track validation tasks and key actions for your idea
            </p>
          </div>
          <NewActionItem ideaId={ideaId} />
        </div>
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">
            Failed to load action items. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const actionItems = actionItemsResult.data || [];

  // Sort action items: completed items at bottom, others sorted by priority
  const sortedActionItems = [...actionItems].sort((a, b) => {
    // First, separate completed from non-completed
    const aCompleted = a.status === "COMPLETED";
    const bCompleted = b.status === "COMPLETED";

    if (aCompleted && !bCompleted) return 1; // a goes to bottom
    if (!aCompleted && bCompleted) return -1; // b goes to bottom

    // If both have same completion status, sort by priority
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const aPriority =
      priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
    const bPriority =
      priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;

    return aPriority - bPriority;
  });

  const handleActionItemClick = (actionItem: any) => {
    setSelectedActionItem(actionItem);
    setIsDetailSheetOpen(true);
  };

  const handleDetailSheetClose = (open: boolean) => {
    setIsDetailSheetOpen(open);
    if (!open) {
      setSelectedActionItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap gap-4 justify-between">
        <div>
          <h2 className="text-lg font-semibold">Action Items</h2>
          <p className="text-sm text-muted-foreground">
            Track validation and growth tasks for your idea, collaborate with
            CoPilot to execute them.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <NewActionItem ideaId={ideaId} />
          <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAIModalOpen}
                variant="fancy"
                className="gap-2"
              >
                <FaMagic className="h-4 w-4" />
                AI Finder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-semibold">
                  AI Action Items Finder
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Help the AI generate targeted action items by providing
                  additional context about your validation goals.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-2">
                <div className="space-y-3">
                  <Label htmlFor="instructions" className="text-sm font-medium">
                    Additional Instructions
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Focus on market research, customer interviews, technical validation..."
                    value={userInstructions}
                    onChange={(e) => setUserInstructions(e.target.value)}
                    className="min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Optional but recommended for better results
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {userInstructions.length}/500
                    </span>
                  </div>
                </div>

                <div className="bg-muted/30 border border-muted rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-500 mt-0.5">💡</div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Pro Tips
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>
                          • Specify focus areas: market research, technical,
                          business model
                        </li>
                        <li>• Include specific constraints or requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAIModalOpen(false);
                    setUserInstructions("");
                  }}
                  disabled={isGenerating}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAIFinderWithInstructions}
                  disabled={isGenerating}
                  variant="fancy"
                  className="px-6"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic className="mr-2" />
                      Generate Action Items
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {sortedActionItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">No action items yet</h3>
            <p className="text-sm text-muted-foreground">
              Start by creating validation and growth tasks for your idea
            </p>
          </div>
        </div>
      ) : (
        <ActionItemsList
          actionItems={sortedActionItems}
          ideaId={ideaId}
          onActionItemClick={handleActionItemClick}
        />
      )}

      {/* Detail Sheet */}
      <ActionItemDetailSheet
        actionItem={selectedActionItem}
        open={isDetailSheetOpen}
        onOpenChange={handleDetailSheetClose}
      />
    </div>
  );
}
