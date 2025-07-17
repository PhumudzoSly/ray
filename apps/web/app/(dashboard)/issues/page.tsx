"use client";
import { useQuery } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import AllIssues from "@/components/project/issues/all-issues";
import { IssuesSkeleton } from "@/components/project/issues/issue-skeleton";
import { NewIssue } from "@/components/project/issues/new-issue";
import Header from "@/components/shared/header";
import { useSession } from "@/context/session-context";

const IssuesPage = () => {
	const { token } = useSession();

	const { data: issues, isLoading } = useQuery({
		queryKey: ["issues"],
		queryFn: () => issueActions.getAllIssues(),
		select: (res) => res?.success ? res.data : [],
	});

	return (
		<>
			<Header crumb={[{ title: "Issues", url: "/issues" }]}>
				<NewIssue />
			</Header>
			{isLoading ? (
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
