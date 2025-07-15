"use client";

import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Clock, AlertCircle } from "lucide-react";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const statusColors = {
  BACKLOG: "bg-slate-100 text-slate-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  REVIEW: "bg-purple-100 text-purple-800",
  DONE: "bg-green-100 text-green-800",
  BLOCKED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function UpcomingIssues() {
  const { token } = useSession();
  const { data: issues, isPending } = useData(api.dashboard.getUpcomingIssues, {
    token,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!issues?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Clock className="h-12 w-12 mb-2 opacity-20" />
        <p>No upcoming issues due in the next 7 days</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center p-4 border-b">
        <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
        <h3 className="font-semibold">Due Soon</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue._id}>
              <TableCell>
                <Link
                  href={`/issues/${issue._id}`}
                  className="hover:underline text-primary"
                >
                  {issue.title}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/project/${issue.project?._id}`}
                  className="hover:underline text-muted-foreground"
                >
                  {issue.project?.name}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(issue.dueDate!), "MMM d")}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={priorityColors[issue.priority]}
                >
                  {issue.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[issue.status]}
                >
                  {issue.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {issue.assignee ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {issue.assignee.name?.[0]}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {issue.assignee.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
