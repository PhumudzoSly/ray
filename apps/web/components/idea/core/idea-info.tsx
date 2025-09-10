"use client";
import { toast } from "sonner";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { Button } from "@workspace/ui/components/button";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSingleIdea, updateName, updateDescription } from "@/actions/idea";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";

const IdeaInfo = ({ id }: { id: string }) => {
  //

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: idea, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingSpinner variant="text" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between w-full flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-start justify-between w-full">
          <div>
            <div className="flex mb-2.5 justify-between items-center gap-2">
              <InlineEditField
                value={`💡 ${idea?.name}` || ""}
                onSave={(value) => handleUpdateField("name", value)}
                className="text-3xl font-bold hover:bg-transparent focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 rounded px-2 -ml-2"
                disabled={updateFieldMutation.isPending}
              />
            </div>
            <InlineEditTextArea
              value={`${idea?.description}` || ""}
              className="w-full"
              onSave={(value) => handleUpdateField("description", value)}
              disabled={updateFieldMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaInfo;
