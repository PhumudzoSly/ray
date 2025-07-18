import * as issueActions from "@/actions/issue";
import AllIssues from "@/components/project/issues/all-issues";
import { NewIssue } from "@/components/project/issues/new-issue";
import Header from "@/components/shared/header";

const IssuesPage = async () => {
  const issues = await issueActions.getAllIssues();

  return (
    <>
      <Header crumb={[{ title: "Issues", url: "/issues" }]}>
        <NewIssue />
      </Header>

      <AllIssues issues={issues?.data || []} />
    </>
  );
};

export default IssuesPage;
