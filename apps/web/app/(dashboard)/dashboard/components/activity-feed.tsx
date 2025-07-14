"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Activity,
  GitCommit,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Users,
  FileText,
  Lightbulb,
  Rocket,
  Star,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ActivityFeedProps {
  stats: any;
}

// Sample activity data - replace with your actual data
const generateActivityData = () => {
  const activities = [
    {
      id: 1,
      type: "project_created",
      title: "New project created",
      description: "FlowMind Analytics Dashboard",
      user: { name: "Sarah Chen", avatar: "/avatars/sarah.jpg" },
      timestamp: "2 hours ago",
      icon: <Rocket className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
      priority: "high",
    },
    {
      id: 2,
      type: "issue_resolved",
      title: "Critical issue resolved",
      description: "Fixed authentication bug in login flow",
      user: { name: "Mike Johnson", avatar: "/avatars/mike.jpg" },
      timestamp: "4 hours ago",
      icon: <CheckCircle2 className="h-4 w-4" />,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
      priority: "high",
    },
    {
      id: 3,
      type: "comment_added",
      title: "New comment on feature request",
      description: "Added implementation details for dark mode",
      user: { name: "Emily Davis", avatar: "/avatars/emily.jpg" },
      timestamp: "6 hours ago",
      icon: <MessageSquare className="h-4 w-4" />,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
      priority: "medium",
    },
    {
      id: 4,
      type: "team_member_joined",
      title: "New team member joined",
      description: "Alex Rodriguez joined as Frontend Developer",
      user: { name: "Alex Rodriguez", avatar: "/avatars/alex.jpg" },
      timestamp: "8 hours ago",
      icon: <Users className="h-4 w-4" />,
      color:
        "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
      priority: "medium",
    },
    {
      id: 5,
      type: "idea_submitted",
      title: "New idea submitted",
      description: "AI-powered code suggestions feature",
      user: { name: "Lisa Park", avatar: "/avatars/lisa.jpg" },
      timestamp: "12 hours ago",
      icon: <Lightbulb className="h-4 w-4" />,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
      priority: "low",
    },
    {
      id: 6,
      type: "document_updated",
      title: "PRD updated",
      description: "Updated requirements for mobile app",
      user: { name: "David Kim", avatar: "/avatars/david.jpg" },
      timestamp: "1 day ago",
      icon: <FileText className="h-4 w-4" />,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
      priority: "medium",
    },
  ];

  return activities;
};

const ActivityItem: React.FC<{ activity: any; isLast: boolean }> = ({
  activity,
  isLast,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border/50 group-hover:bg-border transition-colors" />
      )}

      {/* Activity icon */}
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border-2 border-background shadow-sm transition-all duration-200",
          activity.color,
          "group-hover:shadow-md group-hover:scale-105"
        )}
      >
        {activity.icon}
      </div>

      {/* Activity content */}
      <div className="flex-1 space-y-2 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{activity.title}</h4>
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2 py-0.5",
                activity.priority === "high" &&
                  "border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/20",
                activity.priority === "medium" &&
                  "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-950/20",
                activity.priority === "low" &&
                  "border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950/20"
              )}
            >
              {activity.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {activity.timestamp}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{activity.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={activity.user.avatar}
                alt={activity.user.name}
              />
              <AvatarFallback className="text-xs">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {activity.user.name}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            View
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const ActivityStats: React.FC<{ stats: any }> = ({ stats }) => {
  const activityStats = [
    {
      label: "Actions Today",
      value: 12,
      change: "+23%",
      positive: true,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: "Team Activity",
      value: 89,
      change: "+12%",
      positive: true,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Issues Resolved",
      value: 6,
      change: "+50%",
      positive: true,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {activityStats.map((stat, index) => (
        <Card
          key={index}
          className="border-0 bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "text-xs font-medium",
                  stat.positive ? "text-green-600" : "text-red-600"
                )}
              >
                {stat.change}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ stats }) => {
  // Get recent activities from actual data
  const recentProjects = stats?.projects?.slice(0, 3) || [];
  const recentIssues =
    stats?.issues
      ?.filter((issue: any) => issue.status !== "DONE")
      .slice(0, 3) || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-normal">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Projects
            </p>
            {recentProjects.map((project: any) => (
              <Link
                key={project._id}
                href={`/project/${project._id}`}
                className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-medium">{project.name}</p>
                <Badge variant="outline" className="mt-1">
                  {project.status || "planning"}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {recentProjects.length > 0 && recentIssues.length > 0 && <Separator />}

        {/* Recent Issues */}
        {recentIssues.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Open Issues
            </p>
            {recentIssues.map((issue: any) => (
              <Link
                key={issue._id}
                href={`/issues/${issue._id}`}
                className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-medium">{issue.title}</p>
                <p className="text-xs text-muted-foreground">#{issue.number}</p>
              </Link>
            ))}
          </div>
        )}

        {recentProjects.length === 0 && recentIssues.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-8">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
};
