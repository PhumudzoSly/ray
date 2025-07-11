"use client";

import React from "react";
import { MarketAnalysis } from "@/components/idea/validation/market-analysis";
import { KeyFindingsTab } from "@/components/idea/validation/key-findings-tab";
import { NextStepsTab } from "@/components/idea/validation/next-steps-tab";
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
import { TrendingUp, Target, ArrowRight } from "lucide-react";

const MarketPage = ({ params }: { params: { id: string } }) => {
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
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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

  const hasValidation = validationDetails?.validation;

  return (
    <div className="space-y-6 p-6">
      {/* Market Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Market Analysis
          </CardTitle>
          <CardDescription>
            Market size, opportunity, and growth potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasValidation ? (
            <MarketAnalysis data={validationDetails.marketSize} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Validate your idea first to see market analysis</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Key Findings
            </CardTitle>
            <CardDescription>
              Important insights and discoveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasValidation ? (
              <KeyFindingsTab findings={validationDetails.keyFindings || []} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Validate your idea first to see key findings</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Recommended actions and priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasValidation ? (
              <NextStepsTab steps={validationDetails.nextSteps || []} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Validate your idea first to see next steps</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketPage;
