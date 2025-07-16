"use client";
import { api } from "@workspace/backend";
import { useQuery } from "convex/react";
import AllIssues from "@/components/project/issues/all-issues";
import { IssuesSkeleton } from "@/components/project/issues/issue-skeleton";
import { NewIssue } from "@/components/project/issues/new-issue";
import Header from "@/components/shared/header";
import { useSession } from "@/context/session-context";

const IssuesPage = () => {
	const { token } = useSession();

	const issues = useQuery(api.issue.index.getIssues, {
		token,
	});

	return (
		<>
			<Header crumb={[{ title: "Issues", url: "/issues" }]}>
				<NewIssue />
			</Header>
			{issues === undefined ? (
				<IssuesSkeleton />
			) : (
				<>
					<AllIssues issues={issues || []} />
				</>
			)}
		</>
	);
};

export default IssuesPage;
