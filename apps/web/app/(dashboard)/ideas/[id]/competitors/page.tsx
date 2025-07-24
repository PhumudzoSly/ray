"use client";

import React from "react";
import { CompetitorAnalysis } from "@/components/idea/validation/competitor-analysis";
import { SwotAnalysisTab } from "@/components/idea/validation/swot-analysis-tab";
import { getSingleIdea, getValidationDetails } from "@/actions/idea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Zap, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const CompetitorsPage = ({ params }: { params: { id: string } }) => {
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
        <div className="grid grid-cols-1 gap-6">
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
      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Competitor Analysis
          </CardTitle>
          <CardDescription>
            Competitive landscape and positioning analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasValidation ? (
            <CompetitorAnalysis
              data={validationDetails.competitorAnalysis}
              competitors={validationDetails.competitors}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Validate your idea first to see competitor analysis</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SWOT Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-500" />
            SWOT Analysis
          </CardTitle>
          <CardDescription>
            Strengths, Weaknesses, Opportunities, and Threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasValidation ? (
            <SwotAnalysisTab swot={validationDetails.swotAnalysis} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Validate your idea first to see SWOT analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorsPage;
