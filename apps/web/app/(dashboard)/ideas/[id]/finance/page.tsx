"use client";

import React from "react";
import { FinancialAnalysis } from "@/components/idea/validation/financial-analysis";
import { FeasibilityAnalysis } from "@/components/idea/validation/feasibility-analysis";
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
import { DollarSign, CheckCircle2 } from "lucide-react";

const FinancePage = ({ params }: { params: { id: string } }) => {
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

  const hasValidation = validationDetails?.validation;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Financial Analysis
            </CardTitle>
            <CardDescription>
              Revenue projections, costs, and financial viability
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasValidation ? (
              <FinancialAnalysis data={validationDetails.financials} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Validate your idea first to see financial analysis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feasibility Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              Feasibility Analysis
            </CardTitle>
            <CardDescription>
              Technical feasibility and implementation challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasValidation ? (
              <FeasibilityAnalysis data={validationDetails.feasibility} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Validate your idea first to see feasibility analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancePage;
