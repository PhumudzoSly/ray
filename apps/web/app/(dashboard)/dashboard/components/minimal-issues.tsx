"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface MinimalIssuesProps {
  issues: any[];
}

export const MinimalIssues: React.FC<MinimalIssuesProps> = ({ issues }) => {
  const openIssues = issues.filter((issue) => issue.status !== "DONE");

  const getPriorityBadge = (priority?: string) => {
    const priorityConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      CRITICAL: { variant: "destructive", label: "Critical" },
      HIGH: { variant: "destructive", label: "High" },
      MEDIUM: { variant: "secondary", label: "Medium" },
      LOW: { variant: "outline", label: "Low" },
    };
    return priorityConfig[priority || "MEDIUM"] || priorityConfig["MEDIUM"];
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-normal flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Open Issues
        </CardTitle>
        <Link
          href="/issues"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {openIssues.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No open issues
          </p>
        ) : (
          <div className="space-y-4">
            {openIssues.slice(0, 5).map((issue) => {
              const priority = getPriorityBadge(issue.priority);
              return (
                <Link
                  key={issue._id}
                  href={`/issues/${issue._id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none group-hover:text-primary">
                        {issue.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>#{issue.number}</span>
                        {issue._creationTime && (
                          <>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(
                                new Date(issue._creationTime),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={priority.variant} className="ml-2">
                      {priority.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
