import { getSession } from "@/actions/account/user";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import React from "react";
import IssueSidebar from "./components/issue-sidebar";
import { redirect } from "next/navigation";
import IssueDetails from "./components/issue-details";
import { preloadQuery } from "convex/nextjs";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import Header from "@/components/shared/header";

const SingleIssuePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  //
  const { id } = await params;
  const { token } = await getSession();

  const issue = preloadQuery(api.issue.index.getIssueById, {
    token,
    id: id as Id<"issues">,
  });

  if (!issue) {
    return redirect("/issues");
  }

  return (
    <>
      <Header
        crumb={[{ title: "Issues", url: "/issues" }, { title: "Manage issue" }]}
      >
        {null}
      </Header>
      <ExpandedLayoutContainer
        sidebar={<IssueSidebar issueId={id as Id<"issues">} />}
      >
        <div className="p-4">
          <IssueDetails id={id} />
        </div>
      </ExpandedLayoutContainer>
    </>
  );
};

export default SingleIssuePage;
