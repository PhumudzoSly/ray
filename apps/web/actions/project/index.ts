"use server";

import { ProjectOptionalDefaults, prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { checkProjectLimit } from "../account/limits";

// Health score calculation types
interface ProjectHealthMetrics {
  totalIssues: number;
  completedIssues: number;
  blockedIssues: number;
  cancelledIssues: number;
  issueCompletionRate: number;

  totalFeatures: number;
  completedFeatures: number;
  inProgressFeatures: number;
  featureCompletionRate: number;

  totalMilestones: number;
  completedMilestones: number;
  atRiskMilestones: number;
  delayedMilestones: number;
  milestoneCompletionRate: number;

  overallHealthScore: number;
  healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
  healthFactors: string[];
}

interface ProjectWithHealth extends ProjectOptionalDefaults {
  healthMetrics: ProjectHealthMetrics;
  _count?: {
    features: number;
    issues: number;
    milestones: number;
  };
}

// Calculate health score based on various factors
function calculateProjectHealth(
  issues: any[],
  features: any[],
  milestones: any[]
): ProjectHealthMetrics {
  // Issue metrics
  const totalIssues = issues.length;
  const completedIssues = issues.filter((i) => i.status === "DONE").length;
  const blockedIssues = issues.filter((i) => i.status === "BLOCKED").length;
  const cancelledIssues = issues.filter((i) => i.status === "CANCELLED").length;
  const inProgressIssues = issues.filter(
    (i) => i.status === "IN_PROGRESS"
  ).length;
  const reviewIssues = issues.filter((i) => i.status === "REVIEW").length;
  const backlogIssues = issues.filter((i) => i.status === "BACKLOG").length;

  const issueCompletionRate =
    totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 100;

  // Feature metrics
  const totalFeatures = features.length;
  const completedFeatures = features.filter((f) =>
    ["RELEASE", "LIVE"].includes(f.phase)
  ).length;
  const inProgressFeatures = features.filter((f) =>
    ["DEVELOPMENT", "TESTING"].includes(f.phase)
  ).length;
  const planningFeatures = features.filter((f) =>
    ["DISCOVERY", "PLANNING"].includes(f.phase)
  ).length;
  const deprecatedFeatures = features.filter(
    (f) => f.phase === "DEPRECATED"
  ).length;

  const featureCompletionRate =
    totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 100;

  // Milestone metrics
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const atRiskMilestones = milestones.filter(
    (m) => m.status === "AT_RISK"
  ).length;
  const delayedMilestones = milestones.filter(
    (m) => m.status === "DELAYED"
  ).length;
  const inProgressMilestones = milestones.filter(
    (m) => m.status === "IN_PROGRESS"
  ).length;
  const notStartedMilestones = milestones.filter(
    (m) => m.status === "NOT_STARTED"
  ).length;

  const milestoneCompletionRate =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 100;

  // Calculate overall health score (0-100) with weighted factors
  let healthScore = 0;
  const healthFactors: string[] = [];

  // Issue health (40% weight) - More sophisticated scoring
  let issueHealth = issueCompletionRate;

  // Penalize blocked issues heavily
  if (blockedIssues > 0) {
    const blockedPenalty = Math.min(30, (blockedIssues / totalIssues) * 100);
    issueHealth -= blockedPenalty;
    healthFactors.push(`${blockedIssues} blocked issues`);
  }

  // Bonus for issues in review (shows progress)
  if (reviewIssues > 0) {
    issueHealth += Math.min(10, (reviewIssues / totalIssues) * 20);
  }

  // Penalize too many cancelled issues
  if (cancelledIssues > 0) {
    const cancelledPenalty = Math.min(15, (cancelledIssues / totalIssues) * 50);
    issueHealth -= cancelledPenalty;
    healthFactors.push(`${cancelledIssues} cancelled issues`);
  }

  healthScore += Math.max(0, issueHealth) * 0.4;

  // Feature health (35% weight)
  let featureHealth = featureCompletionRate;

  // Bonus for features in progress (shows active development)
  if (inProgressFeatures > 0) {
    featureHealth += Math.min(15, (inProgressFeatures / totalFeatures) * 30);
  }

  // Penalize too many features in planning (lack of execution)
  // Only penalize if there are actually features in planning AND they represent more than 50% of total features
  // Also require at least 2 total features to avoid false positives with single features
  if (planningFeatures > 0 && totalFeatures >= 2 && planningFeatures > totalFeatures * 0.5) {
    featureHealth -= 10;
    healthFactors.push("Too many features in planning");
  }

  // Penalize deprecated features
  if (deprecatedFeatures > 0) {
    featureHealth -= Math.min(10, (deprecatedFeatures / totalFeatures) * 30);
    healthFactors.push(`${deprecatedFeatures} deprecated features`);
  }

  healthScore += Math.max(0, featureHealth) * 0.35;

  // Milestone health (25% weight)
  let milestoneHealth = milestoneCompletionRate;

  // Heavy penalty for at-risk milestones
  if (atRiskMilestones > 0) {
    const riskPenalty = Math.min(
      25,
      (atRiskMilestones / totalMilestones) * 100
    );
    milestoneHealth -= riskPenalty;
    healthFactors.push(`${atRiskMilestones} milestones at risk`);
  }

  // Penalty for delayed milestones
  if (delayedMilestones > 0) {
    const delayPenalty = Math.min(
      20,
      (delayedMilestones / totalMilestones) * 80
    );
    milestoneHealth -= delayPenalty;
    healthFactors.push(`${delayedMilestones} delayed milestones`);
  }

  // Bonus for milestones in progress
  if (inProgressMilestones > 0) {
    milestoneHealth += Math.min(
      10,
      (inProgressMilestones / totalMilestones) * 20
    );
  }

  healthScore += Math.max(0, milestoneHealth) * 0.25;

  // Determine health status with more granular thresholds
  let healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
  if (healthScore >= 85) healthStatus = "excellent";
  else if (healthScore >= 70) healthStatus = "good";
  else if (healthScore >= 50) healthStatus = "fair";
  else if (healthScore >= 30) healthStatus = "poor";
  else healthStatus = "critical";

  // Add positive factors for excellent/good health
  if (healthScore >= 70) {
    if (issueCompletionRate > 80)
      healthFactors.unshift("High issue completion rate");
    if (featureCompletionRate > 60)
      healthFactors.unshift("Good feature progress");
    if (milestoneCompletionRate > 80)
      healthFactors.unshift("Milestones on track");
    if (inProgressFeatures > 0)
      healthFactors.unshift("Active feature development");
  }

  // Add warning factors for poor/critical health
  if (healthScore < 50) {
    if (blockedIssues > 0)
      healthFactors.unshift("Blocked issues need attention");
    if (atRiskMilestones > 0) healthFactors.unshift("Milestones at risk");
    if (inProgressFeatures === 0 && totalFeatures > 0)
      healthFactors.unshift("No features in development");
  }

  return {
    totalIssues,
    completedIssues,
    blockedIssues,
    cancelledIssues,
    issueCompletionRate: Math.round(issueCompletionRate * 100) / 100,

    totalFeatures,
    completedFeatures,
    inProgressFeatures,
    featureCompletionRate: Math.round(featureCompletionRate * 100) / 100,

    totalMilestones,
    completedMilestones,
    atRiskMilestones,
    delayedMilestones,
    milestoneCompletionRate: Math.round(milestoneCompletionRate * 100) / 100,

    overallHealthScore: Math.round(healthScore * 100) / 100,
    healthStatus,
    healthFactors: healthFactors.slice(0, 5), // Limit to top 5 factors
  };
}

export const getProjects = async () => {
  const { org } = await getSession();

  const projects = await prisma.project.findMany({
    where: {
      organizationId: org,
    },
    include: {
      _count: {
        select: {
          features: true,
          issues: true,
          milestones: true,
        },
      },
      issues: {
        select: {
          status: true,
        },
      },
      features: {
        select: {
          phase: true,
        },
      },
      milestones: {
        select: {
          status: true,
        },
      },
    },
  });

  // Calculate health metrics for each project
  return projects.map((project) => ({
    ...project,
    healthMetrics: calculateProjectHealth(
      project.issues,
      project.features,
      project.milestones
    ),
  }));
};

export const getProject = async (id: string) => {
  await getSession();

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      issues: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          assignedToId: true,
        },
      },
      features: {
        select: {
          id: true,
          name: true,
          phase: true,
          priority: true,
          startDate: true,
          endDate: true,
          assignedToId: true,
        },
      },
      milestones: {
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true,
          ownerId: true,
        },
      },
    },
  });

  if (!project) return null;

  return {
    ...project,
    healthMetrics: calculateProjectHealth(
      project.issues,
      project.features,
      project.milestones
    ),
  };
};

export const getSimpleProject = async (id: string) => {
  await getSession();

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return project;
};

// Get project health summary for dashboard
export const getProjectHealthSummary = async (projectId: string) => {
  await getSession();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      issues: {
        select: { status: true, priority: true },
      },
      features: {
        select: { phase: true, priority: true },
      },
      milestones: {
        select: { status: true },
      },
    },
  });

  if (!project) return null;

  const healthMetrics = calculateProjectHealth(
    project.issues,
    project.features,
    project.milestones
  );

  // Additional insights
  const criticalIssues = project.issues.filter(
    (i) => i.priority === "CRITICAL"
  ).length;
  const highPriorityFeatures = project.features.filter(
    (f) => f.priority === "CRITICAL" || f.priority === "HIGH"
  ).length;

  return {
    ...healthMetrics,
    criticalIssues,
    highPriorityFeatures,
    recentActivity: await getRecentProjectActivity(projectId),
  };
};

// Get comprehensive project insights with additional metrics
export const getProjectInsights = async (projectId: string) => {
  await getSession();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      issues: {
        select: {
          status: true,
          priority: true,
          dueDate: true,
          assignedToId: true,
        },
      },
      features: {
        select: {
          phase: true,
          priority: true,
          startDate: true,
          endDate: true,
          assignedToId: true,
          createdAt: true,
        },
      },
      milestones: {
        select: {
          status: true,
          startDate: true,
          endDate: true,
          ownerId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!project) return null;

  const healthMetrics = calculateProjectHealth(
    project.issues,
    project.features,
    project.milestones
  );

  // Priority breakdowns
  const criticalIssues = project.issues.filter(
    (i) => i.priority === "CRITICAL"
  ).length;
  const highPriorityIssues = project.issues.filter(
    (i) => i.priority === "HIGH"
  ).length;
  const criticalFeatures = project.features.filter(
    (f) => f.priority === "CRITICAL"
  ).length;
  const highPriorityFeatures = project.features.filter(
    (f) => f.priority === "HIGH"
  ).length;

  // Due date analysis
  const now = new Date();
  const overdueIssues = project.issues.filter(
    (i) => i.dueDate && new Date(i.dueDate) < now && i.status !== "DONE"
  ).length;
  const upcomingDeadlines = project.issues.filter(
    (i) =>
      i.dueDate &&
      new Date(i.dueDate) > now &&
      new Date(i.dueDate) <=
        new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) &&
      i.status !== "DONE"
  ).length;

  // Assignment analysis
  const unassignedIssues = project.issues.filter((i) => !i.assignedToId).length;
  const unassignedFeatures = project.features.filter(
    (f) => !f.assignedToId
  ).length;

  // Recent activity (last 7 days) - only features have createdAt
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentIssues = 0; // Issues don't have createdAt field
  const recentFeatures = project.features.filter(
    (f) => new Date(f.createdAt) >= sevenDaysAgo
  ).length;

  return {
    ...healthMetrics,
    // Priority insights
    criticalIssues,
    highPriorityIssues,
    criticalFeatures,
    highPriorityFeatures,

    // Timeline insights
    overdueIssues,
    upcomingDeadlines,

    // Assignment insights
    unassignedIssues,
    unassignedFeatures,

    // Recent activity
    recentIssues,
    recentFeatures,
  };
};

// Get recent activity for health context
async function getRecentProjectActivity(projectId: string) {
  // First, get all issues and features that belong to this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      issues: {
        select: { id: true },
      },
      features: {
        select: { id: true },
      },
    },
  });

  if (!project) {
    return [];
  }

  // Get all issue and feature IDs
  const issueIds = project.issues.map((issue) => issue.id);
  const featureIds = project.features.map((feature) => feature.id);

  const recentActivity = await prisma.activityFeed.findMany({
    where: {
      OR: [
        // Project-level activities
        {
          entityType: "PROJECT",
          entityId: projectId,
        },
        // Issue activities
        {
          entityType: "ISSUE",
          entityId: { in: issueIds },
        },
        // Feature activities
        {
          entityType: "FEATURE",
          entityId: { in: featureIds },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      type: true,
      title: true,
      createdAt: true,
    },
  });

  return recentActivity;
}

export const createProject = async (data: ProjectOptionalDefaults) => {
  const { org } = await getSession();

  // Check project limits before creating
  const projectLimit = await checkProjectLimit();

  if (projectLimit.limitReached) {
    throw new Error(
      `Project limit reached. You have ${projectLimit.currentCount}/${projectLimit.maxAllowed} projects. Please upgrade your subscription to create more projects.`
    );
  }

  const project = await prisma.project.create({
    data: {
      ...data,
      organizationId: org,
    },
  });

  return project;
};

export const updateProject = async (
  id: string,
  data: ProjectOptionalDefaults
) => {
  const { org } = await getSession();

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      organizationId: org,
    },
  });

  return project;
};

export const deleteProject = async (id: string) => {
  const { org } = await getSession();

  const project = await prisma.project.delete({
    where: { id, organizationId: org },
  });

  return project;
};

// Get organization-wide project health insights
export const getOrganizationHealthInsights = async () => {
  const { org } = await getSession();

  const projects = await prisma.project.findMany({
    where: { organizationId: org },
    include: {
      issues: {
        select: { status: true, priority: true },
      },
      features: {
        select: { phase: true, priority: true },
      },
      milestones: {
        select: { status: true },
      },
    },
  });

  const projectHealths = projects.map((project) => ({
    id: project.id,
    name: project.name,
    healthMetrics: calculateProjectHealth(
      project.issues,
      project.features,
      project.milestones
    ),
  }));

  // Calculate organization-wide metrics
  const totalProjects = projects.length;
  const excellentProjects = projectHealths.filter(
    (p) => p.healthMetrics.healthStatus === "excellent"
  ).length;
  const goodProjects = projectHealths.filter(
    (p) => p.healthMetrics.healthStatus === "good"
  ).length;
  const fairProjects = projectHealths.filter(
    (p) => p.healthMetrics.healthStatus === "fair"
  ).length;
  const poorProjects = projectHealths.filter(
    (p) => p.healthMetrics.healthStatus === "poor"
  ).length;
  const criticalProjects = projectHealths.filter(
    (p) => p.healthMetrics.healthStatus === "critical"
  ).length;

  const avgHealthScore =
    projectHealths.length > 0
      ? projectHealths.reduce(
          (sum, p) => sum + p.healthMetrics.overallHealthScore,
          0
        ) / projectHealths.length
      : 0;

  // Aggregate all issues, features, and milestones
  const allIssues = projects.flatMap((p) => p.issues);
  const allFeatures = projects.flatMap((p) => p.features);
  const allMilestones = projects.flatMap((p) => p.milestones);

  const orgHealthMetrics = calculateProjectHealth(
    allIssues,
    allFeatures,
    allMilestones
  );

  return {
    totalProjects,
    projectHealths,
    healthDistribution: {
      excellent: excellentProjects,
      good: goodProjects,
      fair: fairProjects,
      poor: poorProjects,
      critical: criticalProjects,
    },
    averageHealthScore: Math.round(avgHealthScore * 100) / 100,
    organizationHealth: orgHealthMetrics,
    topPerformers: projectHealths
      .filter((p) => p.healthMetrics.healthStatus === "excellent")
      .slice(0, 3),
    needsAttention: projectHealths
      .filter((p) =>
        ["poor", "critical"].includes(p.healthMetrics.healthStatus)
      )
      .slice(0, 5),
  };
};
