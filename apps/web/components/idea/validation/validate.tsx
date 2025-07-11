"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
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
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { useData } from "@/hooks/use-data";
import { useSession } from "@/context/session-context";
import { ValidationPanel } from "@/components/ideas/validation/validation-panel";

const Validate = ({ id }: { id: string }) => {
  //

  const { token } = useSession();
  const { data: idea, isPending } = useData(api.idea.getSingleIdea, {
    id: id as Id<"idea">,
    token,
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
      // if (!idea) return;
      // await toast.promise(
      //   updateIdea({
      //     // @ts-ignore
      //     data: {
      //       id,
      //       [field]: value,
      //       industry: idea.industry,
      //       organizationId: idea.organizationId,
      //       ownerId: idea.ownerId,
      //     },
      //   }),
      //   {
      //     pending: "Updating...",
      //     success: "Updated successfully",
      //     error: "Failed to update",
      //   }
      // );
      // await refetch();
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
      field: "problemSolved",
      placeholder: "Describe the main problem your idea solves...",
    },
    {
      id: "solution",
      icon: LightbulbIcon,
      iconColor: "text-green-500",
      title: "Proposed Solution",
      field: "solutionOffered",
      placeholder: "Describe your proposed solution...",
    },
  ];

  if (!idea) return null;

  return (
    <div className="w-full space-y-6">
      <ValidationPanel ideaId={id as Id<"idea">} idea={idea} />

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
                // @ts-ignore
                value={idea?.[section.field] || ""}
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
                {idea?.aiOverallValidation?.overallComment ||
                  "No summary available yet. Complete more validation stages and click 'Revalidate' to generate an AI analysis."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Validate;
