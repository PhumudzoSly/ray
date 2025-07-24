"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

// Milestone-specific metrics
interface MilestoneMetrics {
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  atRiskMilestones: number;
  delayedMilestones: number;
  notStartedMilestones: number;
  milestoneCompletionRate: number;
  averageMilestoneDuration: number;
  overdueMilestones: number;
  upcomingMilestones: number;
  milestoneHealthScore: number;
  milestoneHealthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
}

// Date-based analytics
interface DateAnalytics {
  overdueIssues: number;
  upcomingDeadlines: number;
  recentActivity: {
    issues: number;
    features: number;
    milestones: number;
    total: number;
  };
  activityTrend: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
  };
  completionTrends: {
    issues: { completed: number; total: number; rate: number };
    features: { completed: number; total: number; rate: number };
    milestones: { completed: number; total: number; rate: number };
  };
}

export async function getMilestoneMetrics(
  projectId: string
): Promise<MilestoneMetrics> {
  await getSession();

  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
    },
  });

  const now = new Date();

  // Basic counts
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const inProgressMilestones = milestones.filter(
    (m) => m.status === "IN_PROGRESS"
  ).length;
  const atRiskMilestones = milestones.filter(
    (m) => m.status === "AT_RISK"
  ).length;
  const delayedMilestones = milestones.filter(
    (m) => m.status === "DELAYED"
  ).length;
  const notStartedMilestones = milestones.filter(
    (m) => m.status === "NOT_STARTED"
  ).length;

  // Completion rate
  const milestoneCompletionRate =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 100;

  // Date-based analysis
  const overdueMilestones = milestones.filter(
    (m) => m.endDate && new Date(m.endDate) < now && m.status !== "COMPLETED"
  ).length;

  const upcomingMilestones = milestones.filter(
    (m) =>
      m.endDate &&
      new Date(m.endDate) > now &&
      new Date(m.endDate) <=
        new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) &&
      m.status !== "COMPLETED"
  ).length;

  // Calculate average duration for completed milestones
  const completedMilestonesWithDates = milestones.filter(
    (m) => m.status === "COMPLETED" && m.startDate && m.endDate
  );

  const averageMilestoneDuration =
    completedMilestonesWithDates.length > 0
      ? completedMilestonesWithDates.reduce((sum, m) => {
          const duration =
            new Date(m.endDate!).getTime() - new Date(m.startDate!).getTime();
          return sum + duration;
        }, 0) /
        completedMilestonesWithDates.length /
        (1000 * 60 * 60 * 24) // Convert to days
      : 0;

  // Calculate milestone health score
  let healthScore = milestoneCompletionRate;

  // Penalties
  if (atRiskMilestones > 0) {
    healthScore -= Math.min(25, (atRiskMilestones / totalMilestones) * 100);
  }
  if (delayedMilestones > 0) {
    healthScore -= Math.min(20, (delayedMilestones / totalMilestones) * 80);
  }
  if (overdueMilestones > 0) {
    healthScore -= Math.min(30, (overdueMilestones / totalMilestones) * 100);
  }

  // Bonuses
  if (inProgressMilestones > 0) {
    healthScore += Math.min(10, (inProgressMilestones / totalMilestones) * 20);
  }

  healthScore = Math.max(0, Math.min(100, healthScore));

  // Determine health status
  let milestoneHealthStatus:
    | "excellent"
    | "good"
    | "fair"
    | "poor"
    | "critical";
  if (healthScore >= 85) milestoneHealthStatus = "excellent";
  else if (healthScore >= 70) milestoneHealthStatus = "good";
  else if (healthScore >= 50) milestoneHealthStatus = "fair";
  else if (healthScore >= 30) milestoneHealthStatus = "poor";
  else milestoneHealthStatus = "critical";

  return {
    totalMilestones,
    completedMilestones,
    inProgressMilestones,
    atRiskMilestones,
    delayedMilestones,
    notStartedMilestones,
    milestoneCompletionRate: Math.round(milestoneCompletionRate * 100) / 100,
    averageMilestoneDuration: Math.round(averageMilestoneDuration * 100) / 100,
    overdueMilestones,
    upcomingMilestones,
    milestoneHealthScore: Math.round(healthScore * 100) / 100,
    milestoneHealthStatus,
  };
}

// Helper function to get activity count from activity feed
async function getActivityCount(
  projectId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      issues: { select: { id: true } },
      features: { select: { id: true } },
    },
  });

  if (!project) return 0;

  const issueIds = project.issues.map((i) => i.id);
  const featureIds = project.features.map((f) => f.id);

  const activityCount = await prisma.activityFeed.count({
    where: {
      OR: [
        { entityType: "PROJECT", entityId: projectId },
        { entityType: "ISSUE", entityId: { in: issueIds } },
        { entityType: "FEATURE", entityId: { in: featureIds } },
      ],
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return activityCount;
}

// Helper function to get recent items count from activity feed
async function getRecentItemsCount(
  projectId: string,
  entityType: "ISSUE" | "FEATURE" | "MILESTONE",
  startDate: Date
): Promise<number> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      issues: { select: { id: true } },
      features: { select: { id: true } },
      milestones: { select: { id: true } },
    },
  });

  if (!project) return 0;

  let entityIds: string[] = [];
  switch (entityType) {
    case "ISSUE":
      entityIds = project.issues.map((i) => i.id);
      break;
    case "FEATURE":
      entityIds = project.features.map((f) => f.id);
      break;
    case "MILESTONE":
      entityIds = project.milestones.map((m) => m.id);
      break;
  }

  const count = await prisma.activityFeed.count({
    where: {
      entityType,
      entityId: { in: entityIds },
      type: "CREATED",
      createdAt: {
        gte: startDate,
      },
    },
  });

  return count;
}
