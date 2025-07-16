"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getStats = async () => {
	const { org } = await getSession();

	// Fetch all data in parallel
	const [
		totalStorageBytes,
		projectsByStatus,
		issuesByStatus,
		issuesByLabel,
		totalRoadmaps,
		totalWaitlists,
		totalIssues,
	] = await Promise.all([
		prisma.asset.aggregate({
			_sum: { fileSize: true },
			where: { organizationId: org },
		}),
		prisma.project.groupBy({
			by: ["status"],
			where: { organizationId: org },
			_count: { _all: true },
		}),
		prisma.issue.groupBy({
			by: ["status"],
			where: { organizationId: org },
			_count: { _all: true },
		}),
		prisma.issue.groupBy({
			by: ["label"],
			where: { organizationId: org },
			_count: { _all: true },
		}),
		prisma.publicRoadmap.count({
			where: { project: { organizationId: org } },
		}),
		prisma.waitlist.count({
			where: { organizationId: org },
		}),
		prisma.issue.count({
			where: { organizationId: org, status: { not: "DONE" } },
		}),
	]);

	const totalStorageMB = totalStorageBytes._sum.fileSize
		? Number((totalStorageBytes._sum.fileSize / (1024 * 1024)).toFixed(2))
		: 0;

	return {
		projectsByStatus: projectsByStatus.map((p) => ({
			value: p._count._all,
			label: p.status ?? "Unknown",
		})),
		issuesByStatus: issuesByStatus.map((i) => ({
			value: i._count._all,
			label: i.status ?? "Unknown",
		})),
		issuesByLabel: issuesByLabel.map((i) => ({
			value: i._count._all,
			label: i.label ?? "Unknown",
		})),
		totalStorage: { value: totalStorageMB, label: "Total Storage (MB)" },
		totalRoadmaps: { value: totalRoadmaps, label: "Total Roadmaps" },
		totalWaitlists: { value: totalWaitlists, label: "Total Waitlists" },
		totalIssues: { value: totalIssues, label: "Active Issues" },
	};
};
