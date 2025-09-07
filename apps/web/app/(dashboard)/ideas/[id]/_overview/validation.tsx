"use client";
import { getValidation } from "@/actions/idea/validation";
import { runWorkflow } from "@/lib/upstash";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Play } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import type { IdeaValidation } from "@workspace/backend";
import { Progress } from "@workspace/ui/components/progress";

const Validation = ({ id }: { id: string }) => {
  const { data: validation } = useQuery<IdeaValidation | null>({
    queryKey: ["idea-validation", id],
    queryFn: async () => {
      return await getValidation({ id });
    },
    refetchInterval: 6000 * 10,
  });

  const handleValidate = async () => {
    const body = {
      ideaId: id,
    };

    if (validation?.lastUpdatedAt) {
      const lastUpdated = new Date(validation.lastUpdatedAt);
      const now = new Date();
      const daysDifference: number =
        (now.getTime() - lastUpdated.getTime()) / (1000 * 3600 * 24);

      if (daysDifference < 7) {
        toast.error(
          "Cannot run validation. A fresh validation was run less than 7 days ago."
        );
        return;
      }

      if (validation?.overallStatus === "PENDING" && daysDifference >= 2) {
        // Allow proceeding if pending for more than 2 days (likely stuck)
      } else if (validation?.overallStatus === "PENDING") {
        toast.error("Cannot run validation. A validation is already running.");
        return;
      }
    }

    await toast.promise(runWorkflow({ url: "/idea/validate", body }), {
      loading: "Booting agent....",
      success: "Ray agent is running idea validation",
      error: "Failed to boot agent",
    });
  };
  return (
    <div className="p-4">
      <div className="gap-2 flex items-center justify-between">
        <div>
          <h1 className="font-medium">Idea validation</h1>
          <p className="text-xs text-muted-foreground">
            AI powered deep research validation
          </p>
        </div>
        <Button variant="fancy" onClick={handleValidate}>
          <Play />
          Run
        </Button>
      </div>
      {validation ? (
        <div className="grid grid-cols-[120px_1fr] gap-y-6 mt-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Progress
          </h3>
          <Progress value={validation.validationProgress} />

          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {validation?.overallStatus.toLocaleLowerCase()}
          </p>

          <h3 className="text-sm font-medium text-muted-foreground">
            Overall Score
          </h3>
          <p className="text-sm text-muted-foreground">
            {validation.overallScore
              ? `${validation.overallScore.toFixed(1)}/100`
              : "Not calculated"}
          </p>

          <h3 className="text-sm font-medium text-muted-foreground">
            Confidence
          </h3>
          <p className="text-sm text-muted-foreground">
            {validation.confidenceLevel
              ? `${validation.confidenceLevel.toFixed(1)}%`
              : "Not calculated"}
          </p>

          {validation.completedAt && (
            <>
              <h3 className="text-sm font-medium text-muted-foreground">
                Completed
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(validation.completedAt).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Validation;
