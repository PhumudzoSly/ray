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
import { Users, Heart, DollarSign } from "lucide-react";

interface CustomerFitAnalysisProps {
  data: any;
}

export const CustomerFitAnalysis: React.FC<CustomerFitAnalysisProps> = ({
  data,
}) => {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No customer fit analysis data available
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
              <Users className="h-5 w-5 text-green-500" />
              <CardTitle>Customer Fit Analysis</CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {data.score}/100
            </Badge>
          </div>
          <CardDescription>
            Product-market fit and customer validation analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Customer Fit Score</span>
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

      {data.painPoints && data.painPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Customer Pain Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.painPoints.map((point: string, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <p className="text-sm">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.customerAcquisitionCost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Customer Acquisition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data.customerAcquisitionCost}
            </div>
            <p className="text-sm text-muted-foreground">Estimated CAC</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
