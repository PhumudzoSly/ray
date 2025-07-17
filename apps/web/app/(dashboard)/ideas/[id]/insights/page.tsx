"use client";

import React from "react";
import { CustomerFitAnalysis } from "@/components/idea/validation/customer-fit-analysis";
import { AdopterProfilesTab } from "@/components/idea/validation/adopter-profiles-tab";
import { getSingleIdea, getValidationDetails } from "@/actions/idea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Heart, Users2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const InsightsPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const { data: idea, isPending: ideaPending } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => getSingleIdea(id),
  });

  const { data: validationDetails, isPending: validationPending } = useQuery({
    queryKey: ["validationDetails", id],
    queryFn: () => getValidationDetails({ ideaId: id }),
  });

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
        {/* Customer Fit Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Customer Fit Analysis
            </CardTitle>
            <CardDescription>
              How well your idea fits customer needs and problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasValidation ? (
              <CustomerFitAnalysis data={validationDetails.customerFit} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Validate your idea first to see customer fit analysis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adopter Profiles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-teal-500" />
              Adopter Profiles
            </CardTitle>
            <CardDescription>
              Target user segments and early adopter characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasValidation ? (
              <AdopterProfilesTab
                profiles={validationDetails.adopterProfiles || []}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Validate your idea first to see adopter profiles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsPage;
