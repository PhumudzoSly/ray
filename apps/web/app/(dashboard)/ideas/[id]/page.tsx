"use client";

import React, { Suspense } from "react";
import { ValidationOverview } from "@/components/idea/validation/validation-overview";
import { useData } from "@/hooks/use-data";
import { useSession } from "@/context/session-context";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { IdeaDetailsSkeleton } from "@/components/idea/core/idea-details-skeleton";
import { IdeaDetailsContent } from "@/components/idea/core/idea-details-content";

const IdeaPage = ({ params }: { params: { id: string } }) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
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

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<IdeaDetailsSkeleton />}>
        {/* <IdeaDetailsHeader ideaId={id} /> */}
        <IdeaDetailsContent ideaId={id} />
      </Suspense>
    </div>
  );
};

export default IdeaPage;
