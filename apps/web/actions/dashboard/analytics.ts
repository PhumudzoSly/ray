"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getStats = async () => {
	const { org } = await getSession();

	// Total storage used by assets (in MB)
	const totalStorageBytes = await prisma.asset.aggregate({
		_sum: { fileSize: true },
		where: { organizationId: org },
	});
	const totalStorageMB = totalStorageBytes._sum.fileSize
		? Number((totalStorageBytes._sum.fileSize / (1024 * 1024)).toFixed(2))
		: 0;

	// Projects grouped by status
	const projectsByStatus = await prisma.project.groupBy({
		by: ["status"],
		where: { organizationId: org },
		_count: { _all: true },
	});

	// Issues grouped by status
	const issuesByStatus = await prisma.issue.groupBy({
		by: ["status"],
		where: { organizationId: org },
		_count: { _all: true },
	});

	// Issues grouped by label
	const issuesByLabel = await prisma.issue.groupBy({
		by: ["label"],
		where: { organizationId: org },
		_count: { _all: true },
	});

	// Total roadmaps
	const totalRoadmaps = await prisma.publicRoadmap.count({
		where: { project: { organizationId: org } },
	});

	// Total waitlists
	const totalWaitlists = await prisma.waitlist.count({
		where: { organizationId: org },
	});

	// Total assets
	const totalAssets = await prisma.asset.count({
		where: { organizationId: org },
	});

	return {
		totalStorage: { value: totalStorageMB, label: "Total Storage (MB)" },
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
		totalRoadmaps: { value: totalRoadmaps, label: "Total Roadmaps" },
		totalWaitlists: { value: totalWaitlists, label: "Total Waitlists" },
		totalAssets: { value: totalAssets, label: "Total Assets" },
	};
};
