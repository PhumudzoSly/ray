"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import { startResearchValidation } from "@/actions/idea/research";
import type { ResearchDepth } from "@/types/research";
import { toast } from "sonner";
import { useEffect } from "react";

interface ResearchValidationButtonProps {
  ideaId: string;
  depth: ResearchDepth;
  disabled?: boolean;
}

type ActionState = {
  success: boolean;
  message: string;
} | null;

export function ResearchValidationButton({
  ideaId,
  depth,
  disabled = false,
}: ResearchValidationButtonProps) {
  // Create a wrapper action that matches useActionState signature
  const wrappedAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    try {
      const ideaId = formData.get("ideaId") as string;
      const depth = formData.get("depth") as ResearchDepth;

      const result = await startResearchValidation(ideaId, depth);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(wrappedAction, null);

  // Handle success/error states
  useEffect(() => {
    if (state?.success) {
      toast.success(
        state.message || "Research validation started successfully!"
      );
    } else if (state && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("ideaId", ideaId);
    formData.append("depth", depth);
    formAction(formData);
  };

  return (
    <Button
      onClick={handleSubmit}
      disabled={disabled || isPending}
      loading={isPending}
    >
      {isPending ? "Starting Research..." : `Start ${depth} Research`}
    </Button>
  );
}
