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
import { ArrowRight, Flag, CheckCircle } from "lucide-react";

interface NextStepsTabProps {
  steps: any[];
}

export const NextStepsTab: React.FC<NextStepsTabProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No next steps available</p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-blue-500" />
            Next Steps
          </CardTitle>
          <CardDescription>
            Recommended actions to move forward with this idea
          </CardDescription>
        </CardHeader>
      </Card>

      {steps.map((step: any, index: number) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {index + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getPriorityColor(step.priority)}
                  >
                    {step.priority} Priority
                  </Badge>
                  <Badge variant="secondary">{step.category}</Badge>
                </div>
                <p className="text-sm leading-relaxed">{step.content}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
