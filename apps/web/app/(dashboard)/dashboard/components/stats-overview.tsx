"use client";
import React from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Users,
  Briefcase,
  Lightbulb,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  message?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  message,
  variant = "default",
}: StatCardProps) => {
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        variant === "success" && "border-green-200 dark:border-green-800",
        variant === "warning" && "border-yellow-200 dark:border-yellow-800",
        variant === "danger" && "border-red-200 dark:border-red-800"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-3 rounded-full bg-muted">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsOverviewProps {
  stats: any;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const openIssues =
    stats?.issues?.filter((issue: any) => issue.status !== "DONE").length || 0;
  const totalMembers = stats?.members?.length || 0;
  const activeProjects = stats?.projects?.length || 0;
  const totalIdeas = stats?.ideas?.length || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Team Members"
        value={totalMembers}
        icon={<Users className="h-5 w-5" />}
        variant={totalMembers > 5 ? "success" : "default"}
      />

      <StatCard
        title="Active Projects"
        value={activeProjects}
        icon={<Briefcase className="h-5 w-5" />}
        variant={activeProjects > 0 ? "success" : "default"}
      />

      <StatCard
        title="Ideas"
        value={totalIdeas}
        icon={<Lightbulb className="h-5 w-5" />}
        variant="default"
      />

      <StatCard
        title="Open Issues"
        value={openIssues}
        icon={<AlertCircle className="h-5 w-5" />}
        variant={
          openIssues > 10 ? "danger" : openIssues > 5 ? "warning" : "success"
        }
      />
    </div>
  );
};
