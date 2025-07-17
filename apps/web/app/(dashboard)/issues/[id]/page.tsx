import { getSession } from "@/actions/account/user";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import React from "react";
import IssueSidebar from "./components/issue-sidebar";
import { redirect } from "next/navigation";
import IssueDetails from "./components/issue-details";
import { getIssue } from "@/actions/issue";
import Header from "@/components/shared/header";

const SingleIssuePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  //
  const { id } = await params;
  const { token } = await getSession();

  const { success, data: issue } = await getIssue(id);

  if (!success || !issue) {
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
        sidebar={<IssueSidebar issueId={id} />}
      >
        <div className="p-4">
          <IssueDetails id={id} />
        </div>
      </ExpandedLayoutContainer>
    </>
  );
};

export default SingleIssuePage;
