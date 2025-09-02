import * as issueActions from "@/actions/issue";
import AllIssues from "@/components/project/issues/all-issues";
import { NewIssue } from "@/components/project/issues/new-issue";
import Header from "@/components/shared/header";
import getQueryClient from "@/lib/query/getQueryClient";
import Hydrate from "@/lib/query/hydrate.client";
import { dehydrate } from "@tanstack/react-query";
import React from "react";

const IssuesPage = async () => {
  const queryClient = getQueryClient();

  // Prefetch issues on the server
  await queryClient.prefetchQuery({
    queryKey: ["issues"],
    queryFn: async () => {
      const res = await issueActions.getAllIssues();
      return res;
    },
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Header crumb={[{ title: "Issues", url: "/issues" }]}>
        <NewIssue />
      </Header>
      <AllIssues />
    </Hydrate>
  );
};

export default IssuesPage;
