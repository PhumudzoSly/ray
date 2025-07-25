"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getFinancialProjection,
  getFundingRounds,
} from "@/actions/idea/financial-analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import {
  DollarSign,
  Calendar,
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  PieChart,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatting";

interface FundingRequirementsProps {
  ideaId: string;
}

export function FundingRequirements({ ideaId }: FundingRequirementsProps) {
  const { data: projection, isLoading: projectionLoading } = useQuery({
    queryKey: ["financial-projection", ideaId],
    queryFn: () => getFinancialProjection(ideaId),
  });

  const { data: fundingRounds, isLoading: roundsLoading } = useQuery({
    queryKey: ["funding-rounds", ideaId],
    queryFn: () => getFundingRounds(ideaId),
  });

  const isLoading = projectionLoading || roundsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
      </div>
    );
  }

  if (!projection && (!fundingRounds || fundingRounds.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No funding requirements data available</p>
        <p className="text-sm">Add funding needs and rounds to see analysis</p>
      </div>
    );
  }

  const totalFundingNeeded = projection?.fundingNeeded || 0;
  const totalRaised =
    fundingRounds?.reduce((sum, round) => sum + round.amount, 0) || 0;
  const fundingProgress =
    totalFundingNeeded > 0 ? (totalRaised / totalFundingNeeded) * 100 : 0;

  const getInvestorTypeIcon = (type: string) => {
    switch (type) {
      case "ANGEL":
        return <Users className="h-4 w-4" />;
      case "VENTURE_CAPITAL":
        return <Building className="h-4 w-4" />;
      case "PRIVATE_EQUITY":
        return <TrendingUp className="h-4 w-4" />;
      case "CORPORATE":
        return <Building className="h-4 w-4" />;
      case "CROWDFUNDING":
        return <Users className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getInvestorTypeColor = (type: string) => {
    switch (type) {
      case "ANGEL":
        return "text-blue-600";
      case "VENTURE_CAPITAL":
        return "text-green-600";
      case "PRIVATE_EQUITY":
        return "text-purple-600";
      case "CORPORATE":
        return "text-orange-600";
      case "CROWDFUNDING":
        return "text-indigo-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Funding Overview */}
      {(totalFundingNeeded > 0 || totalRaised > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Funding Overview
            </CardTitle>
            <CardDescription>Total funding needs and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Funding Needed */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Funding Needed</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalFundingNeeded)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total capital required
                </p>
              </div>

              {/* Total Raised */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Raised</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRaised)}
                </div>
                <p className="text-xs text-muted-foreground">Capital secured</p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Progress</span>
                </div>
                <div className="text-2xl font-bold">
                  {fundingProgress.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Funding secured</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Funding Progress</span>
                <Badge
                  variant={
                    fundingProgress >= 100
                      ? "default"
                      : fundingProgress >= 50
                        ? "secondary"
                        : "outline"
                  }
                >
                  {fundingProgress >= 100
                    ? "Complete"
                    : fundingProgress >= 50
                      ? "Good Progress"
                      : "Early Stage"}
                </Badge>
              </div>
              <Progress value={Math.min(fundingProgress, 100)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funding Rounds Timeline */}
      {fundingRounds && fundingRounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Funding Rounds
            </CardTitle>
            <CardDescription>
              Funding rounds timeline and investor details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fundingRounds.map((round, index) => (
                <div key={round.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full bg-muted ${getInvestorTypeColor(round.investorType)}`}
                      >
                        {getInvestorTypeIcon(round.investorType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{round.roundName}</span>
                          <Badge variant="outline">
                            {round.investorType.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {round.investorName && `${round.investorName} • `}
                          {round.timeline
                            ? `${round.timeline} months`
                            : "Timeline TBD"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(round.amount)}
                      </div>
                      {round.equity && (
                        <div className="text-sm text-muted-foreground">
                          {round.equity}% equity
                        </div>
                      )}
                      {round.valuation && (
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(round.valuation)} valuation
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fund Allocation */}
                  {(round.developmentAllocation ||
                    round.marketingAllocation ||
                    round.operationsAllocation) && (
                    <div className="mt-3 ml-11 space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Fund Allocation:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        {round.developmentAllocation && (
                          <div className="flex justify-between">
                            <span>Development</span>
                            <span className="font-medium">
                              {formatCurrency(round.developmentAllocation)}
                            </span>
                          </div>
                        )}
                        {round.marketingAllocation && (
                          <div className="flex justify-between">
                            <span>Marketing</span>
                            <span className="font-medium">
                              {formatCurrency(round.marketingAllocation)}
                            </span>
                          </div>
                        )}
                        {round.operationsAllocation && (
                          <div className="flex justify-between">
                            <span>Operations</span>
                            <span className="font-medium">
                              {formatCurrency(round.operationsAllocation)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {index < fundingRounds.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funding Health Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Funding Health
          </CardTitle>
          <CardDescription>
            Assessment of funding strategy and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Funding Progress Assessment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Funding Progress</span>
                <Badge
                  variant={
                    fundingProgress >= 100
                      ? "default"
                      : fundingProgress >= 50
                        ? "secondary"
                        : "outline"
                  }
                >
                  {fundingProgress >= 100
                    ? "Fully Funded"
                    : fundingProgress >= 50
                      ? "Well Funded"
                      : "Seeking Funding"}
                </Badge>
              </div>
              <Progress value={Math.min(fundingProgress, 100)} />
            </div>

            {/* Round Diversity */}
            {fundingRounds && fundingRounds.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Investor Diversity
                  </span>
                  <Badge
                    variant={
                      fundingRounds.length >= 3
                        ? "default"
                        : fundingRounds.length >= 2
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {fundingRounds.length >= 3
                      ? "Diverse"
                      : fundingRounds.length >= 2
                        ? "Good"
                        : "Limited"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {fundingRounds.length} funding round
                  {fundingRounds.length !== 1 ? "s" : ""}
                </div>
              </div>
            )}

            {/* Overall Assessment */}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Overall Funding Health
              </span>
              <Badge
                variant={
                  fundingProgress >= 100 &&
                  fundingRounds &&
                  fundingRounds.length >= 2
                    ? "default"
                    : fundingProgress >= 50 &&
                        fundingRounds &&
                        fundingRounds.length >= 1
                      ? "secondary"
                      : "outline"
                }
              >
                {fundingProgress >= 100 &&
                fundingRounds &&
                fundingRounds.length >= 2
                  ? "Excellent"
                  : fundingProgress >= 50 &&
                      fundingRounds &&
                      fundingRounds.length >= 1
                    ? "Good"
                    : "Needs Attention"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Alert */}
      {!totalFundingNeeded &&
        (!fundingRounds || fundingRounds.length === 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Funding data needed
                  </p>
                  <p className="text-sm text-orange-700">
                    Add funding needs and rounds for complete funding analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
