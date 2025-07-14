"use client";
import { NewIssue } from "@/components/project/issues/new-issue";
import React from "react";
import AllIssues from "@/components/project/issues/all-issues";
import { useSession } from "@/context/session-context";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { IssuesSkeleton } from "@/components/project/issues/issue-skeleton";
import NoData from "@/components/shared/no-data";
import Header from "@/components/shared/header";

const IssuesPage = () => {
  const { token } = useSession();

  const { data: issues, isPending } = useData(api.issue.index.getIssues, {
    token,
  });

  return (
    <>
      <Header crumb={[{ title: "Issues", url: "/issues" }]}>
        <NewIssue />
      </Header>
      {isPending ? (
        <IssuesSkeleton />
      ) : (
        <>
          {issues === undefined ? (
            <NoData title="Failed to get issues" />
          ) : (
            <AllIssues issues={issues || []} />
          )}
        </>
      )}
    </>
  );
};

export default IssuesPage;
