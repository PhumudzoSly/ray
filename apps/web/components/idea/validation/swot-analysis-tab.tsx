"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { TrendingUp, AlertTriangle, Target, Shield } from "lucide-react";

interface SwotAnalysisTabProps {
  swot: any;
}

export const SwotAnalysisTab: React.FC<SwotAnalysisTabProps> = ({ swot }) => {
  if (!swot) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No SWOT analysis data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const swotSections = [
    {
      title: "Strengths",
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      items: swot.strengths || [],
    },
    {
      title: "Weaknesses",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      items: swot.weaknesses || [],
    },
    {
      title: "Opportunities",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      items: swot.opportunities || [],
    },
    {
      title: "Threats",
      icon: Target,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      items: swot.threats || [],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SWOT Analysis</CardTitle>
          <CardDescription>
            Strengths, Weaknesses, Opportunities, and Threats analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {swotSections.map((section) => (
          <Card
            key={section.title}
            className={`${section.bgColor} ${section.borderColor} border-2`}
          >
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${section.color}`}>
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.items.length > 0 ? (
                <ul className="space-y-2">
                  {section.items.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${section.color.replace("text-", "bg-")} mt-2 flex-shrink-0`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No {section.title.toLowerCase()} identified
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
