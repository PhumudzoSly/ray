"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  InfoIcon,
  LightbulbIcon,
  Target,
  XCircle,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card";
import { cn } from "@/lib/utils";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { useSession } from "@/context/session-context";
import { useQuery } from "@tanstack/react-query";
import {
  getSingleIdea,
  getValidationDetails,
  updateProblemSolved,
  updateSolutionOffered,
} from "@/actions/idea";
import { toast } from "sonner";

const Validate = ({ id }: { id: string }) => {
  const { token } = useSession();

  // Use server actions to fetch idea data with polling for validation updates
  const { data: idea, isPending } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => getSingleIdea(id),
    refetchInterval: (data: any) => {
      // Poll more frequently if validation is in progress
      if (data?.status === "IN_PROGRESS") {
        return 2000; // Poll every 2 seconds during validation
      }
      return false; // Don't poll if not validating
    },
  });

  const { data: validationDetails } = useQuery({
    queryKey: ["validationDetails", id],
    queryFn: () => getValidationDetails({ ideaId: id }),
    refetchInterval: (data) => {
      // Poll more frequently if validation is in progress
      if (idea?.status === "IN_PROGRESS") {
        return 2000; // Poll every 2 seconds during validation
      }
      return false; // Don't poll if not validating
    },
  });

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "text-gray-400";
    if (score < 40) return "text-red-500";
    if (score < 70) return "text-amber-500";
    return "text-emerald-500";
  };

  const getScoreLabel = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "Not Available";
    if (score < 40) return "Low Viability";
    if (score < 70) return "Moderate Viability";
    return "High Viability";
  };

  const getScoreIcon = (score: number | null | undefined) => {
    if (score === null || score === undefined)
      return <HelpCircle className="h-5 w-5 text-gray-400" />;
    if (score < 40) return <XCircle className="h-5 w-5 text-red-500" />;
    if (score < 70) return <AlertCircle className="h-5 w-5 text-amber-500" />;
    return <CheckCircle className="h-5 w-5 text-emerald-500" />;
  };

  const handleUpdateField = async (field: string, value: string) => {
    try {
      if (!idea) return;

      if (field === "problemSolved") {
        await toast.promise(updateProblemSolved({ id, problemSolved: value }), {
          loading: "Updating...",
          success: "Updated successfully",
          error: "Failed to update",
        });
      } else if (field === "solutionOffered") {
        await toast.promise(
          updateSolutionOffered({ id, solutionOffered: value }),
          {
            loading: "Updating...",
            success: "Updated successfully",
            error: "Failed to update",
          }
        );
      }
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const businessSections = [
    {
      id: "problem",
      icon: Target,
      iconColor: "text-red-500",
      title: "Main Problem",
      field: "problemSolved" as const,
      placeholder: "Describe the main problem your idea solves...",
    },
    {
      id: "solution",
      icon: LightbulbIcon,
      iconColor: "text-green-500",
      title: "Proposed Solution",
      field: "solutionOffered" as const,
      placeholder: "Describe your proposed solution...",
    },
  ];

  if (isPending) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {businessSections.map((section) => (
          <Card key={section.id} className="border">
            <div className="border-b p-3">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="p-4">
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!idea) return null;

  return (
    <div className="w-full space-y-6">
      {businessSections.map((section) => (
        <div key={section.id}>
          <Card className="border">
            <div className="border-b p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <section.icon className={cn("h-4 w-4", section.iconColor)} />
                  <span>{section.title}</span>
                </div>
                <HoverCard>
                  <HoverCardTrigger>
                    <Button size="sm" variant="ghost">
                      <InfoIcon className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    Tip: You can click on the content to edit it.
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            <div className="bg-background">
              <InlineEditTextArea
                value={idea[section.field] || ""}
                placeholder={section.placeholder}
                onSave={(value) => handleUpdateField(section.field, value)}
              />
            </div>
          </Card>
        </div>
      ))}

      <Card className="border">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-xl font-medium">
            AI Validation Summary
          </CardTitle>
          <CardDescription>
            Overall summary and conclusion from the AI validation process
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-6">
            <div className="p-4 border rounded-md bg-muted/10">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                {validationDetails?.idea?.aiOverallValidation
                  ? `AI Validation Score: ${validationDetails.idea.aiOverallValidation}/100`
                  : "No summary available yet. Complete more validation stages and click 'Revalidate' to generate an AI analysis."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Validate;
