"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as ideaActions from "@/actions/idea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import IdeaForm from "@/components/idea/core/idea-form";

const NewIdeaForm = () => {
  const router = useRouter();
  const { userId, org } = useSession();
  const [loading, setLoading] = useState(false);

  const createIdeaMutation = useMutation({
    mutationFn: async (data: any) => {
      return await ideaActions.createIdea(data);
    },
  });

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const idea = await createIdeaMutation.mutateAsync({
        ...values,
        ownerId: userId,
        organizationId: org,
        status: "INVALIDATED",
      });
      router.push(`/ideas/${idea.id}`);
    } catch (error) {
      toast.error("Failed to create idea");
      throw error; // Re-throw to let the form component handle the loading state
    } finally {
      setLoading(false);
    }
  };

  return (
    <IdeaForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
      variant="full"
    />
  );
};

export default NewIdeaForm;
