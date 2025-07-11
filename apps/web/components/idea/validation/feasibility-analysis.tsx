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
import { Zap, Clock, AlertTriangle } from "lucide-react";

interface FeasibilityAnalysisProps {
  data: any;
}

export const FeasibilityAnalysis: React.FC<FeasibilityAnalysisProps> = ({
  data,
}) => {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No feasibility analysis data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <CardTitle>Technical Feasibility</CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {data.score}/100
            </Badge>
          </div>
          <CardDescription>
            Development complexity and technical implementation analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Feasibility Score</span>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Time to Market
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {data.timeToMarket}
          </div>
          <p className="text-sm text-muted-foreground">
            Estimated development time
          </p>
        </CardContent>
      </Card>

      {data.technicalChallenges && data.technicalChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Technical Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.technicalChallenges.map(
                (challenge: string, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="text-sm">{challenge}</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
