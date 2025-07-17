"use client";

import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Edit,
  Share,
  Archive,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/session-context";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface IdeaDetailsHeaderProps {
  ideaId: string;
}

export const IdeaDetailsHeader: React.FC<IdeaDetailsHeaderProps> = ({
  ideaId,
}) => {
  const router = useRouter();
  const { token } = useSession();

  const { data: idea, isPending } = api.idea.getSingleIdea({
    id: ideaId as Id<"idea">,
    token,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VALIDATED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "INVALIDATED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "VALIDATED":
        return "Validated";
      case "IN_PROGRESS":
        return "In Progress";
      case "INVALIDATED":
        return "Needs Work";
      case "FAILED":
        return "Failed Validation";
      default:
        return "Not Validated";
    }
  };

  const getValidationIcon = (score: number | undefined) => {
    if (!score) return <Brain className="h-4 w-4 text-gray-500" />;
    if (score >= 70) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (score >= 50)
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const validationScore = idea?.aiOverallValidation?.overallRating || 0;

  if (isPending) {
    return (
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) return null;

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {idea.name}
                </h1>
                <Badge
                  variant="outline"
                  className={getStatusColor(idea.status)}
                >
                  {getStatusLabel(idea.status)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{idea.industry}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {getValidationIcon(validationScore)}
                  <span>
                    {validationScore > 0
                      ? `${validationScore}/100 validation score`
                      : "Not validated"}
                  </span>
                </div>
                {idea.aiOverallValidation?.lastValidated && (
                  <>
                    <span>•</span>
                    <span>
                      Last validated{" "}
                      {new Date(
                        idea.aiOverallValidation.lastValidated
                      ).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {validationScore > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
                {getValidationIcon(validationScore)}
                <span className="text-sm font-medium">{validationScore}</span>
              </div>
            )}

            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Share idea
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive idea
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
