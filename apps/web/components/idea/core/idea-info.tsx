"use client";
import moment from "moment";
import { toast } from "sonner";
import IdeaStatus from "./status";
import { Menu } from "lucide-react";
import { BarChart2, Building2, Shield, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { Button } from "@workspace/ui/components/button";
import UpdateIdea from "./edit-idea";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { useSession } from "@/context/session-context";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSingleIdea,
  updateName,
  updateDescription,
  updateIndustry,
  updateInternal,
  updateOpenSource,
  deleteIdea,
} from "@/actions/idea";
import { useRouter } from "next/navigation";

const IdeaInfo = ({ id }: { id: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: idea, isPending } = useQuery({
    queryKey: ["idea", id],
    queryFn: async () => {
      return await getSingleIdea(id);
    },
  });

  // Generic mutation for updating idea fields with optimistic updates
  const updateFieldMutation = useMutation({
    mutationFn: async ({
      field,
      value,
    }: {
      field: string;
      value: string | boolean;
    }) => {
      switch (field) {
        case "name":
          return await updateName({ id, name: value as string });
        case "description":
          return await updateDescription({ id, description: value as string });
        case "industry":
          return await updateIndustry({ id, industry: value as string });
        case "internal":
          return await updateInternal({ id, internal: value as boolean });
        case "openSource":
          return await updateOpenSource({ id, openSource: value as boolean });
        default:
          throw new Error(`Unknown field: ${field}`);
      }
    },
    onMutate: async ({ field, value }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["idea", id] });

      // Snapshot the previous value
      const previousIdea = queryClient.getQueryData(["idea", id]);

      // Optimistically update to the new value
      queryClient.setQueryData(["idea", id], (old: any) => {
        if (!old) return old;
        return { ...old, [field]: value };
      });

      // Return a context object with the snapshotted value
      return { previousIdea };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIdea) {
        queryClient.setQueryData(["idea", id], context.previousIdea);
      }
      toast.error(`Failed to update ${variables.field}`);
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.field} updated successfully`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["idea", id] });
    },
  });

  const handleUpdateField = async (field: string, value: string | boolean) => {
    // Optimistically update the local copy first
    const previousIdea = queryClient.getQueryData(["idea", id]);
    queryClient.setQueryData(["idea", id], (old: any) => {
      if (!old) return old;
      return { ...old, [field]: value };
    });

    try {
      await updateFieldMutation.mutateAsync({ field, value });
      router.refresh();
    } catch (error) {
      // Revert the optimistic update if the mutation fails
      queryClient.setQueryData(["idea", id], previousIdea);
      console.error("Error updating field:", error);
    }
  };

  const confirm = useConfirm();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteIdea(id);
    },
    onSuccess: () => {
      toast.success("Idea deleted successfully");
      // Invalidate ideas list and redirect
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      router.push("/ideas");
    },
    onError: (error) => {
      console.error("Error deleting idea:", error);
      toast.error("Failed to delete idea. Please try again.");
    },
  });

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete idea?",
      description:
        "This action will permanently remove your idea and everything related to it.",
    });

    if (isConfirmed) {
      deleteMutation.mutate();
    }
  };

  if (isPending) return <LoadingSpinner />;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between w-full flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-start justify-between w-full">
          <div>
            <InlineEditField
              value={`${idea?.name}` || ""}
              onSave={(value) => handleUpdateField("name", value)}
              className="text-2xl font-medium hover:bg-transparent focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 rounded px-2 -ml-2"
              disabled={updateFieldMutation.isPending}
            />
            <div className="text-muted-foreground text-sm">
              Added {moment(idea?.createdAt).fromNow()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {idea?.status && (
              <IdeaStatus refetch={() => {}} id={id} status={idea.status} />
            )}
            <div className="flex items-center gap-4">
              <UpdateIdea id={id} idea={idea} onSuccess={() => {}}>
                <Button variant="outline" className="w-full">
                  Edit Idea
                </Button>
              </UpdateIdea>
              <Button
                variant="destructive"
                className="w-full"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 py-6 text-sm text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Building2 className="h-4 w-4 text-indigo-500" />
              {idea?.industry}
            </TooltipTrigger>
            <TooltipContent>Industry classification</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Shield className="h-4 w-4 text-blue-500" />
              {idea?.internal ? "Internal idea" : "Client/external idea"}
            </TooltipTrigger>
            <TooltipContent>Idea ownership type</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              {idea?.openSource ? "Open source" : "Closed source"}
            </TooltipTrigger>
            <TooltipContent>Source code accessibility</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default IdeaInfo;
