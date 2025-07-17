"use client";
import React, { useState } from "react";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { toast } from "sonner";
import { GitBranch, Clock, Inbox, Plug } from "lucide-react";
import { NewIssue } from "@/components/project/issues/new-issue";
import { ActivityFeed, BlockEditor, NoData } from "@/components/shared";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { StatusSelector } from "@/components/ui/selectors/status-selector";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { Room } from "@/components/liveblocks/room";
import Editor from "@/components/shared/editor";
import { Comments } from "@/components/liveblocks/comments";
import { BiInfoCircle } from "react-icons/bi";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

const IssueDetails = ({ id }: { id: string }) => {
  const [view, setView] = useState<"details" | "relationship" | "activity">(
    "details"
  );
  const queryClient = useQueryClient();
  // Fetch issue details
  const { data: issue, isLoading: isPending } = useQuery({
    queryKey: ["issue", id],
    queryFn: async () => {
      const { success, data } = await issueActions.getIssue(id);
      if (!success) throw new Error("Failed to fetch issue");
      return data;
    },
  });
  // Fetch issue hierarchy
  const { data: issueHierarchy } = useQuery({
    queryKey: ["issueHierarchy", id],
    queryFn: async () => {
      return await issueActions.getIssueHierarchy(id);
    },
  });
  // Optimistic update for title
  const updateTitleMutation = useMutation({
    mutationFn: async ({ issueId, title }: { issueId: string; title: string }) => {
      return await issueActions.updateIssue(issueId, { title });
    },
    onMutate: async ({ issueId, title }) => {
      await queryClient.cancelQueries({ queryKey: ["issue", id] });
      const previousIssue = queryClient.getQueryData(["issue", id]);
      queryClient.setQueryData(["issue", id], (old: any) => ({ ...old, title }));
      return { previousIssue };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(["issue", id], context.previousIssue);
      }
      toast.error("Failed to update title");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
    },
  });
  // Optimistic update for description
  const updateDescriptionMutation = useMutation({
    mutationFn: async ({ issueId, description }: { issueId: string; description: string }) => {
      return await issueActions.updateIssue(issueId, { description });
    },
    onMutate: async ({ issueId, description }) => {
      await queryClient.cancelQueries({ queryKey: ["issue", id] });
      const previousIssue = queryClient.getQueryData(["issue", id]);
      queryClient.setQueryData(["issue", id], (old: any) => ({ ...old, description }));
      return { previousIssue };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(["issue", id], context.previousIssue);
      }
      toast.error("Failed to update description");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
    },
  });

  if (isPending || issue === undefined)
    return (
      <div className="flex items-center justify-center p-20">
        <LoadingSpinner />
      </div>
    );
  if (issue === null) return <NoData />;

  return (
    <div className="container space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="dark" className="text-xs font-medium px-2 py-0.5">
          Issue
        </Badge>
        <Link
          href={`/project/${issue.projectId}`}
          className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1"
        >
          <span>{issue?.project?.name}</span>
        </Link>
      </div>

      <div className="p-1.5">
        <InlineEditField
          value={issue.title}
          onSave={async (value) => {
            await updateTitleMutation.mutateAsync({ issueId: id, title: value });
          }}
          displayValue={
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {issue.title}
            </h1>
          }
          className="text-2xl md:text-3xl font-bold"
        />
      </div>

      <div className="mt-2">
        <InlineEditTextArea
          value={issue.description || ""}
          onSave={async (value) => {
            await updateDescriptionMutation.mutateAsync({ issueId: id, description: value });
          }}
          placeholder="No description provided."
        />
      </div>

      <div className="w-full border-y">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex flex-wrap w-full gap-4 p-4">
            <button
              onClick={() => setView("details")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "details"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <BiInfoCircle size={18} />
              Details
            </button>
            <button
              onClick={() => setView("relationship")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "relationship"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <Plug size={18} />
              Relationship
            </button>

            <button
              onClick={() => setView("activity")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "activity"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <Clock size={18} />
              Activity
            </button>
          </div>
        </ScrollArea>
      </div>

      {view === "details" ? (
        <>
          <Room id={id}>
            <div>
              <Editor />
              <div className="flex items-center gap-2 mt-10 mb-4">
                <Inbox size={18} />
                <h6>Comments</h6>
              </div>
              <Comments id={id} />
            </div>
          </Room>
        </>
      ) : null}

      {view === "relationship" ? (
        <div>
          {/* Parent Issue Section */}
          {issueHierarchy?.parentIssue && (
            <div className="space-y-2 mt-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Parent Issue
              </h3>
              <Link
                href={`/issues/${issueHierarchy.parentIssue._id}`}
                className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {issueHierarchy.parentIssue.title}
                    </h4>
                    {issueHierarchy.parentIssue.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {issueHierarchy.parentIssue.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {issueHierarchy.parentIssue.status}
                    </Badge>
                    {issueHierarchy.parentIssue.user && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {issueHierarchy.parentIssue.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Sub-Issues Section */}
          {issueHierarchy?.subIssues && issueHierarchy.subIssues.length > 0 && (
            <div className="space-y-3 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Sub-Issues ({issueHierarchy.subIssues.length})
                </h3>
                <NewIssue
                  projectId={issue.projectId}
                  parentIssueId={id}
                  variant="sub-issue"
                />
              </div>
              <div className="space-y-2">
                {issueHierarchy.subIssues.map((subIssue) => (
                  <Link
                    key={subIssue._id}
                    href={`/issues/${subIssue._id}`}
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-medium">{subIssue.title}</h4>
                        {subIssue.description && (
                          <p className="text-sm text-muted-foreground">
                            {subIssue.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PrioritySelector
                          priority={subIssue.priority}
                          disabled
                        />
                        <StatusSelector status={subIssue.status} disabled />
                        <AssigneeSelector
                          assignee={(subIssue.assignedTo as any) || null}
                          iconOnly
                          disabled
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Add Sub-Issue Button for issues without sub-issues */}
          {(!issueHierarchy?.subIssues ||
            issueHierarchy.subIssues.length === 0) && (
              <div className="mt-6">
                <NewIssue
                  projectId={issue.projectId}
                  parentIssueId={id}
                  variant="sub-issue"
                />
              </div>
            )}
        </div>
      ) : null}

      {view === "activity" ? (
        <ActivityFeed
          entityType="issue"
          entityId={id}
          emptyMessage="No issue activity yet"
        />
      ) : null}
    </div>
  );
};

export default IssueDetails;
