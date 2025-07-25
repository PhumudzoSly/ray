"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSingleIdea } from "@/actions/idea";
import {
  updateProblemSolved,
  updateSolutionOffered,
} from "@/actions/idea/updates";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertCircle, Target, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface ProblemSolutionDisplayProps {
  ideaId: string;
}

export const ProblemSolutionDisplay: React.FC<ProblemSolutionDisplayProps> = ({
  ideaId,
}) => {
  const queryClient = useQueryClient();

  const { data: idea, isPending } = useQuery({
    queryKey: ["idea", ideaId],
    queryFn: () => getSingleIdea(ideaId),
  });

  const updateProblemMutation = useMutation({
    mutationFn: updateProblemSolved,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea", ideaId] });
      toast.success("Problem statement updated");
    },
    onError: () => {
      toast.error("Failed to update problem statement");
    },
  });

  const updateSolutionMutation = useMutation({
    mutationFn: updateSolutionOffered,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea", ideaId] });
      toast.success("Solution statement updated");
    },
    onError: () => {
      toast.error("Failed to update solution statement");
    },
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        Idea not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-medium">Problem Statement</h3>
        </div>
        <InlineEditTextArea
          value={idea.problemSolved || ""}
          placeholder="Describe the problem your idea solves..."
          onSave={async (value) => {
            await updateProblemMutation.mutateAsync({
              ideaId,
              problemSolved: value,
            });
          }}
          className="min-h-[80px] resize-none"
        />
        {!idea.problemSolved && (
          <p className="text-xs text-muted-foreground">
            Click to edit and describe the problem your idea addresses
          </p>
        )}
      </div>

      {/* Solution Statement */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Solution Statement</h3>
        </div>
        <InlineEditTextArea
          value={idea.solutionOffered || ""}
          placeholder="Describe how your idea solves the problem..."
          onSave={async (value) => {
            await updateSolutionMutation.mutateAsync({
              ideaId,
              solutionOffered: value,
            });
          }}
          className="min-h-[80px] resize-none"
        />
        {!idea.solutionOffered && (
          <p className="text-xs text-muted-foreground">
            Click to edit and describe your solution approach
          </p>
        )}
      </div>
    </div>
  );
};
