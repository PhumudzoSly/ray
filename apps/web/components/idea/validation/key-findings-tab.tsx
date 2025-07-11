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
import { Lightbulb, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface KeyFindingsTabProps {
  findings: any[];
}

export const KeyFindingsTab: React.FC<KeyFindingsTabProps> = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No key findings available</p>
        </CardContent>
      </Card>
    );
  }

  const getImportanceIcon = (importance: string) => {
    switch (importance.toLowerCase()) {
      case "critical":
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <XCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance.toLowerCase()) {
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
            <Lightbulb className="h-5 w-5 text-blue-500" />
            Key Findings
          </CardTitle>
          <CardDescription>
            Important insights discovered during the validation process
          </CardDescription>
        </CardHeader>
      </Card>

      {findings.map((finding: any, index: number) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getImportanceIcon(finding.importance)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getImportanceColor(finding.importance)}
                  >
                    {finding.importance}
                  </Badge>
                  <Badge variant="secondary">{finding.category}</Badge>
                </div>
                <p className="text-sm leading-relaxed">{finding.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
