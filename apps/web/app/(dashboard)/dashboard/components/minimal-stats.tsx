"use client";
import React from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Users, Briefcase, Lightbulb, AlertCircle } from "lucide-react";

interface MinimalStatsProps {
  stats: any;
}

export const MinimalStats: React.FC<MinimalStatsProps> = ({ stats }) => {
  const openIssues =
    stats?.issues?.filter((issue: any) => issue.status !== "DONE").length || 0;
  const totalMembers = stats?.members?.length || 0;
  const activeProjects = stats?.projects?.length || 0;
  const totalIdeas = stats?.ideas?.length || 0;

  const statItems = [
    {
      label: "Team Members",
      value: totalMembers,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Projects",
      value: activeProjects,
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      label: "Ideas",
      value: totalIdeas,
      icon: <Lightbulb className="h-4 w-4" />,
    },
    {
      label: "Open Issues",
      value: openIssues,
      icon: <AlertCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="border-muted">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
            <p className="text-2xl font-medium">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
