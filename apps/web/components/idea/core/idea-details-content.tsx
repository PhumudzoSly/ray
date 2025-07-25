"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ProblemSolutionDisplay } from "@/components/idea/validation/problem-solution-display";
import { ValidationScorecardSummary } from "@/components/idea/validation/validation-scorecard-summary";
import { QuickMetricsDashboard } from "@/components/idea/validation/quick-metrics-dashboard";
import { MarketOverviewCard } from "@/components/idea/validation/market-overview-card";
import { InsightsOverviewCard } from "@/components/idea/insights/insights-overview-card";
import { useQuery } from "@tanstack/react-query";
import { getSingleIdea, getValidationDetails } from "@/actions/idea";
import type { Idea } from "@workspace/backend";

interface IdeaDetailsContentProps {
  ideaId: string;
}

export const IdeaDetailsContent: React.FC<IdeaDetailsContentProps> = ({
  ideaId,
}) => {
  const { data: idea, isPending: ideaPending } = useQuery({
    queryKey: ["idea", ideaId],
    queryFn: () => getSingleIdea(ideaId),
  });

  const { data: validationDetails, isPending: validationPending } = useQuery({
    queryKey: ["validationDetails", ideaId],
    queryFn: () => getValidationDetails({ ideaId }),
  });

  if (ideaPending || validationPending) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2 border-b">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Idea not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasValidation = validationDetails && validationDetails.validation;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Problem & Solution Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Problem & Solution</h2>
          <ProblemSolutionDisplay ideaId={ideaId} />
        </div>

        {/* Validation Overview */}
        {hasValidation ? (
          <>
            {/* Quick Metrics */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Metrics</h2>
              <QuickMetricsDashboard ideaId={ideaId} />
            </div>

            {/* Validation Scorecard */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Validation Scorecard</h2>
              <ValidationScorecardSummary ideaId={ideaId} />
            </div>

            {/* Market Overview */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Market Overview</h2>
              <MarketOverviewCard ideaId={ideaId} />
            </div>

            {/* Insights Overview */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Insights Overview</h2>
              <InsightsOverviewCard ideaId={ideaId} />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Validation</h2>
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <p>
                No validation data available. Run validation to see detailed
                insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
