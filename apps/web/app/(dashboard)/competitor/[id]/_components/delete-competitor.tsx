"use client";

import { deleteCompetitor } from "@/actions/idea/competitor";
import getQueryClient from "@/lib/query/client";
import { Button } from "@workspace/ui/components/button";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const DeleteCompetitor = ({ id }: { id: string }) => {
  //
  const queryClient = getQueryClient();

  const router = useRouter();
  const confirm = useConfirm();

  const handleDelete = async () => {
    try {
      const isConfirmed = await confirm({
        title: "Delete Competitor",
        description: "Are you sure you want to delete this competitor?",
      });

      if (!isConfirmed) {
        return;
      }

      toast.loading("Deleting competitor...");
      await deleteCompetitor({ id });
      toast.success("Competitor deleted");

      queryClient.invalidateQueries({
        queryKey: ["competitor", id],
      });
    } catch (error) {
      toast.error("Failed to delete competitor");
      console.error("Error deleting competitor:", error);
    }
  };

  return (
    <Button onClick={handleDelete} variant="destructive" size="sm">
      Delete
    </Button>
  );
};
