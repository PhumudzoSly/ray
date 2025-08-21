"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIdea } from "@/actions/idea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { getSingleIdea } from "@/actions/idea";
import { useQuery } from "@tanstack/react-query";

const DeleteIdea = ({ id }: { id: string }) => {
  const confirm = useConfirm();

  const queryClient = useQueryClient();
  const router = useRouter();

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

  return (
    <Button
      variant="destructive"
      className="w-full"
      size="sm"
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
    >
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </Button>
  );
};

export default DeleteIdea;
