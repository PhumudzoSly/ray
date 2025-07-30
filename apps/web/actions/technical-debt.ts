"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "./account/user";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * Get technical debt overview for a project
 */
export const getProjectTechnicalDebt = async (projectId: string) => {
  try {
    const { org } = await getSession();

    // Verify project access
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Get all repositories for the project
    const repositories = await prisma.codeRepository.findMany({
      where: { projectId },
      include: {
        analyses: {
          orderBy: { analyzedAt: "desc" },
          take: 1,
        },
        issues: {
          where: { status: "OPEN" },
        },
      },
    });

    if (repositories.length === 0) {
      return {
        success: true,
        data: {
          totalDebtMinutes: 0,
          debtRatio: 0,
          trend: "stable" as const,
          categories: [],
          impactOnVelocity: 0,
          recommendedActions: [],
          repositories: [],
        },
      };
    }

    // Calculate aggregate metrics
    const totalDebtMinutes = repositories.reduce((sum, repo) => {
      const latestAnalysis = repo.analyses[0];
      return sum + (latestAnalysis?.technicalDebtMinutes || 0);
    }, 0);

    const totalLinesOfCode = repositories.reduce((sum, repo) => {
      const latestAnalysis = repo.analyses[0];
      return sum + (latestAnalysis?.linesOfCode || 0);
    }, 0);

    const debtRatio =
      totalLinesOfCode > 0 ? (totalDebtMinutes / totalLinesOfCode) * 100 : 0;

    // Categorize debt by issue types
    const categories = await categorizeDebt(repositories);

    // Calculate trend (compare with previous analyses)
    const trend = await calculateDebtTrend(repositories);

    // Estimate impact on velocity
    const impactOnVelocity = calculateVelocityImpact(
      totalDebtMinutes,
      totalLinesOfCode
    );

    // Generate AI recommendations
    const recommendedActions = await generateDebtRecommendations(
      repositories,
      totalDebtMinutes
    );

    return {
      success: true,
      data: {
        totalDebtMinutes,
        debtRatio,
        trend,
        categories,
        impactOnVelocity,
        recommendedActions,
        repositories: repositories.map((repo) => ({
          id: repo.id,
          name: repo.repositoryName,
          debtMinutes: repo.analyses[0]?.technicalDebtMinutes || 0,
          issuesCount: repo.issues.length,
          lastAnalyzed: repo.analyses[0]?.analyzedAt || null,
        })),
      },
    };
  } catch (error) {
    console.error("Error getting project technical debt:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get technical debt impact on project timeline
 */
export const getDebtTimelineImpact = async (projectId: string) => {
  try {
    const { org } = await getSession();

    // Get project with milestones
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org },
      include: {
        milestones: {
          where: { status: { not: "COMPLETED" } },
          orderBy: { endDate: "asc" },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Get technical debt data
    const debtData = await getProjectTechnicalDebt(projectId);
    if (!debtData.success) {
      throw new Error("Failed to get technical debt data");
    }

    const { totalDebtMinutes, impactOnVelocity } = debtData.data;

    // Calculate impact on each milestone
    const milestoneImpacts = project.milestones.map((milestone) => {
      const originalDuration =
        milestone.endDate && milestone.startDate
          ? Math.ceil(
              (milestone.endDate.getTime() - milestone.startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 30; // Default 30 days if no dates

      const additionalDays = Math.ceil(
        (totalDebtMinutes / 60 / 8) * (impactOnVelocity / 100)
      );
      const adjustedEndDate = milestone.endDate
        ? new Date(
            milestone.endDate.getTime() + additionalDays * 24 * 60 * 60 * 1000
          )
        : null;

      return {
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        originalEndDate: milestone.endDate,
        adjustedEndDate,
        additionalDays,
        riskLevel:
          additionalDays > 7 ? "high" : additionalDays > 3 ? "medium" : "low",
      };
    });

    return {
      success: true,
      data: {
        totalDebtMinutes,
        impactOnVelocity,
        milestoneImpacts,
        recommendations: generateTimelineRecommendations(
          milestoneImpacts,
          totalDebtMinutes
        ),
      },
    };
  } catch (error) {
    console.error("Error getting debt timeline impact:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Create issues for high-priority technical debt
 */
export const createTechnicalDebtIssues = async (
  projectId: string,
  debtThreshold: number = 120
) => {
  try {
    const { org } = await getSession();

    // Get repositories with high technical debt
    const repositories = await prisma.codeRepository.findMany({
      where: {
        projectId,
        project: { organizationId: org },
      },
      include: {
        analyses: {
          orderBy: { analyzedAt: "desc" },
          take: 1,
        },
        issues: {
          where: {
            status: "OPEN",
            severity: { in: ["CRITICAL", "MAJOR"] },
          },
          orderBy: { effort: "desc" },
          take: 10,
        },
      },
    });

    const createdIssues = [];

    for (const repo of repositories) {
      const latestAnalysis = repo.analyses[0];
      if (
        !latestAnalysis ||
        latestAnalysis.technicalDebtMinutes < debtThreshold
      ) {
        continue;
      }

      // Group issues by type and create consolidated issues
      const issueGroups = groupIssuesByType(repo.issues);

      for (const [issueType, issues] of Object.entries(issueGroups)) {
        if (issues.length === 0) continue;

        const totalEffort = issues.reduce(
          (sum, issue) => sum + issue.effort,
          0
        );
        if (totalEffort < 60) continue; // Skip if less than 1 hour of work

        const issueTitle = `Technical Debt: ${issueType} in ${repo.repositoryName}`;
        const issueDescription = generateIssueDescription(
          issues,
          repo.repositoryName
        );

        const createdIssue = await prisma.issue.create({
          data: {
            title: issueTitle,
            description: issueDescription,
            projectId,
            organizationId: org,
            status: "BACKLOG",
            priority: issues.some((i) => i.severity === "CRITICAL")
              ? "CRITICAL"
              : "HIGH",
            label: mapIssueTypeToLabel(issueType),
            sourceType: "technical_debt",
          },
        });

        // Link code quality issues to the project issue
        await Promise.all(
          issues.map((issue) =>
            prisma.codeQualityIssue.update({
              where: { id: issue.id },
              data: { issueId: createdIssue.id },
            })
          )
        );

        createdIssues.push(createdIssue);
      }
    }

    return {
      success: true,
      data: {
        createdIssues: createdIssues.length,
        issues: createdIssues,
      },
    };
  } catch (error) {
    console.error("Error creating technical debt issues:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Helper functions
async function categorizeDebt(repositories: any[]) {
  const categories = {
    complexity: { debtMinutes: 0, issueCount: 0, trend: 0 },
    duplication: { debtMinutes: 0, issueCount: 0, trend: 0 },
    coverage: { debtMinutes: 0, issueCount: 0, trend: 0 },
    security: { debtMinutes: 0, issueCount: 0, trend: 0 },
    maintainability: { debtMinutes: 0, issueCount: 0, trend: 0 },
  };

  for (const repo of repositories) {
    const latestAnalysis = repo.analyses[0];
    if (!latestAnalysis) continue;

    // Categorize based on analysis metrics and issues
    const complexityDebt = Math.max(
      0,
      (latestAnalysis.cyclomaticComplexity - 10) * 10
    );
    const maintainabilityDebt = Math.max(
      0,
      (100 - latestAnalysis.maintainabilityIndex) * 2
    );
    const securityDebt = Math.max(0, (100 - latestAnalysis.securityScore) * 3);

    categories.complexity.debtMinutes += complexityDebt;
    categories.maintainability.debtMinutes += maintainabilityDebt;
    categories.security.debtMinutes += securityDebt;

    // Count issues by type
    for (const issue of repo.issues) {
      categories[getCategoryForIssueType(issue.type)].issueCount++;
    }
  }

  return Object.entries(categories).map(([type, data]) => ({
    type,
    ...data,
  }));
}

async function calculateDebtTrend(repositories: any[]) {
  // Get previous analyses for trend calculation
  const previousAnalyses = await prisma.codeAnalysis.findMany({
    where: {
      repositoryId: { in: repositories.map((r) => r.id) },
      analyzedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    orderBy: { analyzedAt: "desc" },
  });

  if (previousAnalyses.length < 2) {
    return "stable";
  }

  const recent = previousAnalyses.slice(
    0,
    Math.floor(previousAnalyses.length / 2)
  );
  const older = previousAnalyses.slice(Math.floor(previousAnalyses.length / 2));

  const recentAvg =
    recent.reduce((sum, a) => sum + a.technicalDebtMinutes, 0) / recent.length;
  const olderAvg =
    older.reduce((sum, a) => sum + a.technicalDebtMinutes, 0) / older.length;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (change > 10) return "degrading";
  if (change < -10) return "improving";
  return "stable";
}

function calculateVelocityImpact(
  totalDebtMinutes: number,
  totalLinesOfCode: number
): number {
  // Simple heuristic: every hour of technical debt reduces velocity by 1%
  // Cap at 50% impact
  const hoursOfDebt = totalDebtMinutes / 60;
  const linesPerHour = totalLinesOfCode / Math.max(hoursOfDebt, 1);

  // More debt relative to code size = higher impact
  const debtRatio = hoursOfDebt / (totalLinesOfCode / 1000); // Debt hours per 1k lines

  return Math.min(50, Math.max(0, debtRatio * 5));
}

async function generateDebtRecommendations(
  repositories: any[],
  totalDebtMinutes: number
) {
  try {
    const repoSummary = repositories.map((repo) => ({
      name: repo.repositoryName,
      debt: repo.analyses[0]?.technicalDebtMinutes || 0,
      issues: repo.issues.length,
      complexity: repo.analyses[0]?.cyclomaticComplexity || 0,
    }));

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Analyze technical debt and provide recommendations:

Total Technical Debt: ${totalDebtMinutes} minutes (${Math.round(totalDebtMinutes / 60)} hours)

Repository Summary:
${JSON.stringify(repoSummary, null, 2)}

Provide actionable recommendations to reduce technical debt.`,
      schema: z.object({
        actions: z.array(
          z.object({
            priority: z.number().min(1).max(10),
            description: z.string(),
            estimatedEffort: z.string(),
            expectedImpact: z.string(),
            affectedFiles: z.array(z.string()),
          })
        ),
      }),
    });

    return result.object.actions;
  } catch (error) {
    console.error("Error generating debt recommendations:", error);
    return [];
  }
}

function generateTimelineRecommendations(
  milestoneImpacts: any[],
  totalDebtMinutes: number
) {
  const recommendations = [];

  const highRiskMilestones = milestoneImpacts.filter(
    (m) => m.riskLevel === "high"
  );
  if (highRiskMilestones.length > 0) {
    recommendations.push({
      type: "urgent",
      title: "Address Critical Technical Debt",
      description: `${highRiskMilestones.length} milestone(s) at high risk due to technical debt. Consider dedicating 20% of sprint capacity to debt reduction.`,
      estimatedImpact: "Reduce timeline risk by 50%",
    });
  }

  if (totalDebtMinutes > 480) {
    // More than 8 hours
    recommendations.push({
      type: "planning",
      title: "Schedule Debt Reduction Sprint",
      description:
        "Plan a dedicated sprint to address the most critical technical debt items.",
      estimatedImpact: `Could reduce debt by ${Math.round((totalDebtMinutes * 0.3) / 60)} hours`,
    });
  }

  return recommendations;
}

function groupIssuesByType(issues: any[]) {
  return issues.reduce(
    (groups, issue) => {
      const type = issue.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(issue);
      return groups;
    },
    {} as Record<string, any[]>
  );
}

function generateIssueDescription(issues: any[], repoName: string) {
  const issuesByFile = issues.reduce(
    (groups, issue) => {
      if (!groups[issue.file]) groups[issue.file] = [];
      groups[issue.file].push(issue);
      return groups;
    },
    {} as Record<string, any[]>
  );

  let description = `Technical debt issues found in ${repoName}:\n\n`;

  for (const [file, fileIssues] of Object.entries(issuesByFile)) {
    description += `**${file}:**\n`;
    fileIssues.slice(0, 5).forEach((issue) => {
      description += `- Line ${issue.line}: ${issue.message}\n`;
    });
    if (fileIssues.length > 5) {
      description += `- ... and ${fileIssues.length - 5} more issues\n`;
    }
    description += "\n";
  }

  const totalEffort = issues.reduce((sum, issue) => sum + issue.effort, 0);
  description += `**Estimated effort:** ${Math.round(totalEffort / 60)} hours\n`;
  description += `**Priority:** ${issues.some((i) => i.severity === "CRITICAL") ? "Critical" : "High"}\n`;

  return description;
}

function mapIssueTypeToLabel(issueType: string) {
  const mapping: Record<string, string> = {
    VULNERABILITY: "SECURITY",
    SECURITY_HOTSPOT: "SECURITY",
    BUG: "BUG",
    CODE_SMELL: "REFACTOR",
    PERFORMANCE: "PERFORMANCE",
    MAINTAINABILITY: "REFACTOR",
  };

  return mapping[issueType] || "TASK";
}

function getCategoryForIssueType(issueType: string) {
  const mapping: Record<string, keyof typeof categories> = {
    VULNERABILITY: "security",
    SECURITY_HOTSPOT: "security",
    BUG: "maintainability",
    CODE_SMELL: "maintainability",
    PERFORMANCE: "complexity",
    MAINTAINABILITY: "maintainability",
  };

  return mapping[issueType] || "maintainability";
}
