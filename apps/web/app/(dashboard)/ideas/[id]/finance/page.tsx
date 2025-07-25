import React from "react";
import { FinancialProjections } from "@/components/idea/finance/financial-projections";
import { UnitEconomics } from "@/components/idea/finance/unit-economics";
import { FundingRequirements } from "@/components/idea/finance/funding-requirements";
import { RiskAnalysis } from "@/components/idea/finance/risk-analysis";
import { getSingleIdea } from "@/actions/idea";
import {
  getFinancialProjection,
  getFundingRounds,
} from "@/actions/idea/financial-analysis";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { DollarSign, TrendingUp, Users, AlertTriangle } from "lucide-react";

interface FinancePageProps {
  params: Promise<{ id: string }>;
}

export default async function FinancePage({ params }: FinancePageProps) {
  const { id } = await params;

  const queryClient = new QueryClient();

  // Prefetch data on the server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["idea", id],
      queryFn: () => getSingleIdea(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["financial-projection", id],
      queryFn: () => getFinancialProjection(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["funding-rounds", id],
      queryFn: () => getFundingRounds(id),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Projections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Financial Projections
              </CardTitle>
              <CardDescription>
                Revenue projections, costs, and break-even analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialProjections ideaId={id} />
            </CardContent>
          </Card>

          {/* Unit Economics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Unit Economics
              </CardTitle>
              <CardDescription>
                Customer lifetime value, acquisition costs, and payback periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnitEconomics ideaId={id} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funding Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Funding Requirements
              </CardTitle>
              <CardDescription>
                Funding needs, rounds timeline, and investor information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FundingRequirements ideaId={id} />
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Risk Analysis
              </CardTitle>
              <CardDescription>
                Risk factors, mitigation strategies, and scenario analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskAnalysis ideaId={id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </HydrationBoundary>
  );
}
