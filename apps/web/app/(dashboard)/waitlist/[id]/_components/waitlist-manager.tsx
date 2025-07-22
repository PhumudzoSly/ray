"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { ExternalLink, Users, BarChart3, Loader2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { queryKeys } from "@/lib/query-keys";
import { getWaitlist, updateWaitlist } from "@/actions/waitlist";
import WaitlistOverview from "./waitlist-overview";
import WaitlistAnalytics from "./waitlist-analytics";

interface WaitlistManagerProps {
  waitlistId: string;
}

export default function WaitlistManager({ waitlistId }: WaitlistManagerProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"overview" | "analytics">("overview");

  // Fetch waitlist data
  const { data: waitlist, isLoading: waitlistLoading } = useQuery({
    queryKey: queryKeys.waitlist(waitlistId),
    queryFn: async () => {
      const result = await getWaitlist(waitlistId);
      if (!result.success || !result.data) {
        throw new Error("Waitlist not found");
      }
      return result.data;
    },
  });

  // Generic mutation for updating waitlist fields with optimistic updates
  const updateFieldMutation = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: string }) => {
      const updateData: any = {};
      updateData[field] = value;
      return await updateWaitlist(waitlistId, updateData);
    },
    onMutate: async ({ field, value }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.waitlist(waitlistId),
      });

      // Snapshot the previous value
      const previousWaitlist = queryClient.getQueryData(
        queryKeys.waitlist(waitlistId)
      );

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.waitlist(waitlistId), (old: any) => {
        if (!old) return old;
        return { ...old, [field]: value };
      });

      // Return a context object with the snapshotted value
      return { previousWaitlist };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousWaitlist) {
        queryClient.setQueryData(
          queryKeys.waitlist(waitlistId),
          context.previousWaitlist
        );
      }
      toast.error(`Failed to update ${variables.field}`);
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.field} updated successfully`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlist(waitlistId),
      });
    },
  });

  const handleUpdateField = async (field: string, value: string) => {
    // Optimistically update the local copy first
    const previousWaitlist = queryClient.getQueryData(
      queryKeys.waitlist(waitlistId)
    );
    queryClient.setQueryData(queryKeys.waitlist(waitlistId), (old: any) => {
      if (!old) return old;
      return { ...old, [field]: value };
    });

    try {
      await updateFieldMutation.mutateAsync({ field, value });
    } catch (error) {
      // Revert the optimistic update if the mutation fails
      queryClient.setQueryData(
        queryKeys.waitlist(waitlistId),
        previousWaitlist
      );
      console.error("Error updating field:", error);
    }
  };

  if (waitlistLoading || !waitlist) {
    return (
      <div className="container flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container ">
      {/* Header */}
      <div className="space-y-3 p-6">
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div className="space-y-1 grow flex-1 max-w-4xl">
            <InlineEditField
              value={waitlist.name || ""}
              onSave={(value) => handleUpdateField("name", value)}
              className="text-2xl md:text-3xl font-bold tracking-tight hover:bg-transparent focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 rounded px-2 -ml-2"
              disabled={updateFieldMutation.isPending}
            />
            <InlineEditTextArea
              value={waitlist.description || ""}
              onSave={(value) => handleUpdateField("description", value)}
              className="text-sm text-muted-foreground hover:bg-transparent focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 rounded px-2 -ml-2 resize-none"
              disabled={updateFieldMutation.isPending}
              placeholder="Add a description..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Project:</span>
              <span className="font-medium">{waitlist.project?.name}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="outline" asChild>
                <Link href={`/${waitlist.id}/edit`}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Waitlist
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href={`https://rayai.dev/wl/${waitlist.slug}`}
                  target="_blank"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="w-full border-y">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-full gap-4 p-4">
            <button
              onClick={() => setView("overview")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "overview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <Users size={18} />
              Overview
            </button>
            <button
              onClick={() => setView("analytics")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "analytics"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <BarChart3 size={18} />
              Analytics
            </button>
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="p-6">
        {view === "overview" ? (
          <WaitlistOverview waitlistId={waitlistId} />
        ) : null}

        {view === "analytics" ? (
          <WaitlistAnalytics waitlistId={waitlistId} />
        ) : null}
      </div>
    </div>
  );
}
