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
    // Enhanced stats
    totalProjects,
    completedProjects,
    totalIdeas,
    completedIdeas,
    totalFeatures,
    completedFeatures,
    totalMilestones,
    completedMilestones,
    totalWaitlistEntries,
    // Code quality metrics
    totalCodeRepositories,
    activeCodeRepositories,
    totalCodeAnalyses,
    avgMaintainabilityScore,
    avgSecurityScore,
    totalCodeIssues,
    criticalCodeIssues,
    totalTechnicalDebtMinutes,
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
    // Enhanced stats queries
    prisma.project.count({
      where: { organizationId: org },
    }),
    prisma.project.count({
      where: { organizationId: org, status: "completed" },
    }),
    prisma.idea.count({
      where: { organizationId: org },
    }),
    prisma.idea.count({
      where: { organizationId: org, status: "LAUNCHED" },
    }),
    prisma.feature.count({
      where: { organizationId: org },
    }),
    prisma.feature.count({
      where: { organizationId: org, phase: "LIVE" },
    }),
    prisma.milestone.count({
      where: { organizationId: org },
    }),
    prisma.milestone.count({
      where: { organizationId: org, status: "COMPLETED" },
    }),
    prisma.issue.count({
      where: { organizationId: org },
    }),
    prisma.issue.count({
      where: { organizationId: org, status: "DONE" },
    }),
    prisma.publicRoadmap.count({
      where: { project: { organizationId: org } },
    }),
    prisma.waitlistEntry.count({
      where: { waitlist: { organizationId: org } },
    }),
    prisma.roadmapItem.count({
      where: { roadmap: { project: { organizationId: org } } },
    }),
    prisma.roadmapItem.count({
      where: {
        roadmap: { project: { organizationId: org } },
        status: "DONE",
      },
    }),
    // Code quality metrics queries
    prisma.codeRepository.count({
      where: { project: { organizationId: org } },
    }),
    prisma.codeRepository.count({
      where: { project: { organizationId: org }, isActive: true },
    }),
    prisma.codeAnalysis.count({
      where: { repository: { project: { organizationId: org } } },
    }),
    prisma.codeAnalysis.aggregate({
      _avg: { maintainabilityIndex: true },
      where: { repository: { project: { organizationId: org } } },
    }),
    prisma.codeAnalysis.aggregate({
      _avg: { securityScore: true },
      where: { repository: { project: { organizationId: org } } },
    }),
    prisma.codeQualityIssue.count({
      where: {
        repository: { project: { organizationId: org } },
        status: "OPEN",
      },
    }),
    prisma.codeQualityIssue.count({
      where: {
        repository: { project: { organizationId: org } },
        status: "OPEN",
        severity: "CRITICAL",
      },
    }),
    prisma.codeAnalysis.aggregate({
      _sum: { technicalDebtMinutes: true },
      where: { repository: { project: { organizationId: org } } },
    }),
  ]);

  const totalStorageMB = totalStorageBytes._sum.fileSize
    ? Number((totalStorageBytes._sum.fileSize / (1024 * 1024)).toFixed(2))
    : 0;

  // Calculate completion rates
  const projectCompletionRate =
    totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
  const ideaCompletionRate =
    totalIdeas > 0 ? (completedIdeas / totalIdeas) * 100 : 0;
  const featureCompletionRate =
    totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 0;
  const milestoneCompletionRate =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Calculate code quality metrics
  const avgMaintainability =
    avgMaintainabilityScore._avg.maintainabilityIndex || 0;
  const avgSecurity = avgSecurityScore._avg.securityScore || 0;
  const totalTechDebtHours = totalTechnicalDebtMinutes._sum.technicalDebtMinutes
    ? Math.round(totalTechnicalDebtMinutes._sum.technicalDebtMinutes / 60)
    : 0;

  return {
    // Original stats
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

    // Enhanced organization-wide stats
    advancedStats: {
      projects: {
        total: totalProjects,
        completed: completedProjects,
        completionRate: Number(projectCompletionRate.toFixed(1)),
      },
      ideas: {
        total: totalIdeas,
        completed: completedIdeas,
        completionRate: Number(ideaCompletionRate.toFixed(1)),
      },
      features: {
        total: totalFeatures,
        completed: completedFeatures,
        completionRate: Number(featureCompletionRate.toFixed(1)),
      },
      milestones: {
        total: totalMilestones,
        completed: completedMilestones,
        completionRate: Number(milestoneCompletionRate.toFixed(1)),
      },

      waitlistEntries: {
        total: totalWaitlistEntries,
      },
    },

    // Code quality metrics
    codeQuality: {
      totalRepositories: totalCodeRepositories,
      activeRepositories: activeCodeRepositories,
      totalAnalyses: totalCodeAnalyses,
      avgMaintainability: Math.round(avgMaintainability),
      avgSecurity: Math.round(avgSecurity),
      totalIssues: totalCodeIssues,
      criticalIssues: criticalCodeIssues,
      technicalDebtHours: totalTechDebtHours,
    },
  };
};

export const getIssuesSummaryData = async () => {
  const { org } = await getSession();

  // Fetch issues by label with status information
  const issuesByLabel = await prisma.issue.groupBy({
    by: ["label", "status"],
    where: { organizationId: org },
    _count: { _all: true },
  });

  // Group by label and calculate completed vs non-completed
  const labelMap = new Map<
    string,
    { completed: number; nonCompleted: number }
  >();

  issuesByLabel.forEach((issue) => {
    const label = issue.label ?? "Unknown";
    const count = issue._count._all;
    const isCompleted = issue.status === "DONE";

    if (!labelMap.has(label)) {
      labelMap.set(label, { completed: 0, nonCompleted: 0 });
    }

    const current = labelMap.get(label)!;
    if (isCompleted) {
      current.completed += count;
    } else {
      current.nonCompleted += count;
    }
  });

  // Convert to array format for the chart
  const result = Array.from(labelMap.entries()).map(([label, counts]) => ({
    label,
    completed: counts.completed,
    nonCompleted: counts.nonCompleted,
  }));

  return result;
};
