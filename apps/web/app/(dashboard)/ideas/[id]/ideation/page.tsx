"use client";

import React from "react";
import { UserStoriesTab } from "@/components/idea/validation/user-stories-tab";
import { useData } from "@/hooks/use-data";
import { useSession } from "@/context/session-context";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Users, Lightbulb } from "lucide-react";

const IdeationPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { token } = useSession();

  const { data: idea, isPending: ideaPending } = useData(
    api.idea.getSingleIdea,
    {
      id: id as Id<"idea">,
      token,
    }
  );

  const { data: validationDetails, isPending: validationPending } = useData(
    api.idea.getValidationDetails,
    {
      token,
      ideaId: id as Id<"idea">,
    }
  );

  if (ideaPending || validationPending) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Idea not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasValidation = validationDetails && validationDetails.validation;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Stories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              User Stories
            </CardTitle>
            <CardDescription>
              User stories and scenarios for your idea
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasValidation ? (
              <UserStoriesTab stories={validationDetails.userStories || []} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Validate your idea first to see user stories</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brainstorming Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Ideation Notes
            </CardTitle>
            <CardDescription>
              Additional ideas, features, and creative insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brainstorming features coming soon</p>
              <p className="text-sm mt-2">
                Add your creative ideas and feature concepts here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdeationPage;
