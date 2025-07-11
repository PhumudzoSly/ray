"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

interface FinancialAnalysisProps {
  data: any;
}

export const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({
  data,
}) => {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No financial analysis data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <CardTitle>Financial Viability</CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {data.score}/100
            </Badge>
          </div>
          <CardDescription>
            Revenue potential and financial sustainability analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Financial Score</span>
                <span className="font-medium">{data.score}%</span>
              </div>
              <Progress value={data.score} className="h-2" />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm leading-relaxed">{data.analysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.estimatedRevenue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Revenue Projections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.estimatedRevenue.year1)}
                </div>
                <p className="text-sm text-muted-foreground">Year 1</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.estimatedRevenue.year2)}
                </div>
                <p className="text-sm text-muted-foreground">Year 2</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.estimatedRevenue.year3)}
                </div>
                <p className="text-sm text-muted-foreground">Year 3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Break-Even Point
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-orange-600">
            {data.breakEvenPoint}
          </div>
          <p className="text-sm text-muted-foreground">Time to profitability</p>
        </CardContent>
      </Card>
    </div>
  );
};
