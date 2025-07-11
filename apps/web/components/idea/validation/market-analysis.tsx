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
import { Globe, TrendingUp, Users, DollarSign } from "lucide-react";

interface MarketAnalysisProps {
  data: any;
}

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ data }) => {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No market analysis data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount}`;
  };

  return (
    <div className="space-y-6">
      {/* Market Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <CardTitle>Market Size Analysis</CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {data.score}/100
            </Badge>
          </div>
          <CardDescription>
            Total addressable market and growth potential assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Market Viability Score</span>
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

      {/* Market Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.marketSizeUSD && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <CardTitle className="text-lg">Market Size</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(data.marketSizeUSD)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total Addressable Market (TAM)
              </p>
            </CardContent>
          </Card>
        )}

        {data.growthRate && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-lg">Growth Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {data.growthRate}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Annual market growth
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-lg">Market Potential</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-purple-600 capitalize">
              {data.potential}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Overall market opportunity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Target Segments */}
      {data.targetSegments && data.targetSegments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Target Market Segments
            </CardTitle>
            <CardDescription>
              Key customer segments identified for this market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.targetSegments.map((segment: string, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{segment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>
            Key takeaways from the market analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-green-700 mb-2">
                  Opportunities
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {data.marketSizeUSD && (
                    <li>
                      • Large addressable market of{" "}
                      {formatCurrency(data.marketSizeUSD)}
                    </li>
                  )}
                  {data.growthRate && data.growthRate > 5 && (
                    <li>
                      • Growing market with {data.growthRate}% annual growth
                    </li>
                  )}
                  {data.potential === "high" && (
                    <li>• High market potential identified</li>
                  )}
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-orange-700 mb-2">
                  Considerations
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {data.score < 70 && (
                    <li>• Market validation score could be improved</li>
                  )}
                  {!data.marketSizeUSD && (
                    <li>• Market size data needs further research</li>
                  )}
                  {data.potential === "low" && (
                    <li>• Limited market potential identified</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
