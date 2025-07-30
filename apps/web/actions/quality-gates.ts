"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "./account/user";

export interface QualityGateConfig {
  minMaintainabilityScore: number;
  minSecurityScore: number;
  maxCriticalIssues: number;
  maxTechnicalDebtHours: number;
  requiresCodeReview: boolean;
  blockOnSecurityIssues: boolean;
}

export interface QualityGateResult {
  passed: boolean;
  blockers: string[];
  warnings: string[];
  score: number;
}

/**
 * Get quality gate configuration for a project
 */
export const getQualityGateConfig = async (
  projectId: string
): Promise<QualityGateConfig> => {
  const { org } = await getSession();

  // Check if project has custom quality gate config
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: org },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Default quality gate configuration
  const defaultConfig: QualityGateConfig = {
    minMaintainabilityScore: 70,
    minSecurityScore: 80,
    maxCriticalIssues: 0,
    maxTechnicalDebtHours: 8,
    requiresCodeReview: true,
    blockOnSecurityIssues: true,
  };

  // In a real implementation, you might store this in the database
  // For now, return default config
  return defaultConfig;
};

/**
 * Evaluate quality gates for a project
 */
export const evaluateQualityGates = async (
  projectId: string
): Promise<QualityGateResult> => {
  try {
    const { org } = await getSession();
    const config = await getQualityGateConfig(projectId);

    // Get all repositories for the project
    const repositories = await prisma.codeRepository.findMany({
      where: {
        projectId,
        project: { organizationId: org },
        isActive: true,
      },
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
        passed: true,
        blockers: [],
        warnings: ["No repositories connected to evaluate quality gates"],
        score: 100,
      };
    }

    const blockers: string[] = [];
    const warnings: string[] = [];
    let totalScore = 0;
    let repoCount = 0;

    for (const repo of repositories) {
      const latestAnalysis = repo.analyses[0];
      if (!latestAnalysis) {
        warnings.push(`Repository ${repo.repositoryName} has no analysis data`);
        continue;
      }

      repoCount++;
      const repoScore =
        (latestAnalysis.maintainabilityIndex + latestAnalysis.securityScore) /
        2;
      totalScore += repoScore;

      // Check maintainability threshold
      if (
        latestAnalysis.maintainabilityIndex < config.minMaintainabilityScore
      ) {
        blockers.push(
          `Repository ${repo.repositoryName} maintainability score (${latestAnalysis.maintainabilityIndex}%) is below threshold (${config.minMaintainabilityScore}%)`
        );
      }

      // Check security threshold
      if (latestAnalysis.securityScore < config.minSecurityScore) {
        if (config.blockOnSecurityIssues) {
          blockers.push(
            `Repository ${repo.repositoryName} security score (${latestAnalysis.securityScore}%) is below threshold (${config.minSecurityScore}%)`
          );
        } else {
          warnings.push(
            `Repository ${repo.repositoryName} security score (${latestAnalysis.securityScore}%) is below threshold (${config.minSecurityScore}%)`
          );
        }
      }

      // Check critical issues
      const criticalIssues = repo.issues.filter(
        (issue) => issue.severity === "CRITICAL"
      ).length;
      if (criticalIssues > config.maxCriticalIssues) {
        blockers.push(
          `Repository ${repo.repositoryName} has ${criticalIssues} critical issues (max allowed: ${config.maxCriticalIssues})`
        );
      }

      // Check technical debt
      const techDebtHours = latestAnalysis.technicalDebtMinutes / 60;
      if (techDebtHours > config.maxTechnicalDebtHours) {
        warnings.push(
          `Repository ${repo.repositoryName} has ${techDebtHours.toFixed(1)}h technical debt (threshold: ${config.maxTechnicalDebtHours}h)`
        );
      }
    }

    const averageScore = repoCount > 0 ? totalScore / repoCount : 0;
    const passed = blockers.length === 0;

    return {
      passed,
      blockers,
      warnings,
      score: Math.round(averageScore),
    };
  } catch (error) {
    console.error("Error evaluating quality gates:", error);
    return {
      passed: false,
      blockers: ["Failed to evaluate quality gates"],
      warnings: [],
      score: 0,
    };
  }
};

/**
 * Update quality gate configuration for a project
 */
export const updateQualityGateConfig = async (
  projectId: string,
  config: Partial<QualityGateConfig>
) => {
  try {
    const { org } = await getSession();

    // Verify project access
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // In a real implementation, you would store this in the database
    // For now, we'll just return success
    // You could extend the Project model to include qualityGateConfig JSON field

    return { success: true, data: config };
  } catch (error) {
    console.error("Error updating quality gate config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Check if deployment should be blocked based on quality gates
 */
export const checkDeploymentGate = async (
  projectId: string
): Promise<{
  canDeploy: boolean;
  reason?: string;
  qualityGateResult: QualityGateResult;
}> => {
  try {
    const qualityGateResult = await evaluateQualityGates(projectId);

    if (!qualityGateResult.passed) {
      return {
        canDeploy: false,
        reason: `Quality gates failed: ${qualityGateResult.blockers.join(", ")}`,
        qualityGateResult,
      };
    }

    return {
      canDeploy: true,
      qualityGateResult,
    };
  } catch (error) {
    console.error("Error checking deployment gate:", error);
    return {
      canDeploy: false,
      reason: "Failed to evaluate quality gates",
      qualityGateResult: {
        passed: false,
        blockers: ["System error"],
        warnings: [],
        score: 0,
      },
    };
  }
};
