"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Edit, Lightbulb } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdea } from "@/actions/idea";
import IdeaForm from "./idea-form";

const UpdateIdea = ({
  id,
  idea,
  onOpenChange,
  onSuccess,
  children,
}: {
  id: string;
  idea: any;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Update idea mutation with optimistic updates
  const updateIdeaMutation = useMutation({
    mutationFn: async (values: any) => {
      return await updateIdea({
        id,
        ...values,
      });
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["idea", id] });

      // Snapshot the previous value
      const previousIdea = queryClient.getQueryData(["idea", id]);

      // Optimistically update to the new value
      queryClient.setQueryData(["idea", id], (old: any) => {
        if (!old) return old;
        return { ...old, ...newData };
      });

      // Return a context object with the snapshotted value
      return { previousIdea };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIdea) {
        queryClient.setQueryData(["idea", id], context.previousIdea);
      }
      toast.error("Failed to update idea");
    },
    onSuccess: (data, variables) => {
      toast.success("Idea updated successfully");
      
      // Update the cache with the server response
      queryClient.setQueryData(["idea", id], data);
      
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["idea", id] });
      
      if (onSuccess) onSuccess();
      setOpen(false);
      if (onOpenChange) onOpenChange(false);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["idea", id] });
    },
  });

  const handleSubmit = async (values: any) => {
    try {
      await updateIdeaMutation.mutateAsync(values);
    } catch (error) {
      // Error is already handled in the mutation
      throw error; // Re-throw to let the form component handle the loading state
    }
  };

  const handleCancel = () => {
    setOpen(false);
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Idea
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        <div className="h-full overflow-y-auto">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div>
                <SheetTitle>Edit Idea</SheetTitle>
                <SheetDescription>
                  Update your idea details and configuration
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1">
            <IdeaForm
              mode="edit"
              defaultValues={idea}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={updateIdeaMutation.isPending}
              variant="sheet"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UpdateIdea;
