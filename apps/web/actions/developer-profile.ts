"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "./account/user";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * Get or create developer profile for a user
 */
export const getDeveloperProfile = async (userId?: string) => {
  const { userId: sessionUserId } = await getSession();
  const targetUserId = userId || sessionUserId;

  let profile = await prisma.developerProfile.findUnique({
    where: { userId: targetUserId },
  });

  if (!profile) {
    // Create default profile
    profile = await prisma.developerProfile.create({
      data: {
        userId: targetUserId,
        skillLevel: "mid",
        preferredLanguages: [],
        codingPatterns: {},
        improvementAreas: [],
      },
    });
  }

  return { success: true, data: profile };
};

/**
 * Update developer profile based on code analysis
 */
export const updateDeveloperProfileFromAnalysis = async (
  userId: string,
  analysisData: {
    languages: string[];
    codeQuality: number;
    securityScore: number;
    complexityScore: number;
    issueTypes: string[];
  }
) => {
  try {
    const profile = await prisma.developerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Developer profile not found");
    }

    // Update preferred languages
    const currentLanguages = profile.preferredLanguages;
    const updatedLanguages = Array.from(
      new Set([...currentLanguages, ...analysisData.languages])
    ).slice(0, 10); // Keep top 10 languages

    // Analyze coding patterns with AI
    const patterns = await generateCodingPatterns(analysisData, profile);

    // Determine improvement areas
    const improvementAreas = determineImprovementAreas(analysisData);

    // Update skill level based on code quality trends
    const skillLevel = determineSkillLevel(analysisData, profile);

    const updatedProfile = await prisma.developerProfile.update({
      where: { userId },
      data: {
        preferredLanguages: updatedLanguages,
        codingPatterns: patterns,
        improvementAreas,
        skillLevel,
      },
    });

    return { success: true, data: updatedProfile };
  } catch (error) {
    console.error("Error updating developer profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get personalized code suggestions for a developer
 */
export const getPersonalizedSuggestions = async (userId: string) => {
  try {
    const profile = await prisma.developerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Developer profile not found");
    }

    // Get recent code quality issues for this user
    const recentIssues = await prisma.codeQualityIssue.findMany({
      where: {
        repository: {
          project: {
            createdById: userId,
          },
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    // Generate personalized suggestions with AI
    const suggestions = await generatePersonalizedSuggestions(
      profile,
      recentIssues
    );

    return { success: true, data: suggestions };
  } catch (error) {
    console.error("Error getting personalized suggestions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get developer progress and skill progression
 */
export const getDeveloperProgress = async (userId: string) => {
  try {
    const profile = await prisma.developerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Developer profile not found");
    }

    // Get code analysis history for progress tracking
    const analysisHistory = await prisma.codeAnalysis.findMany({
      where: {
        repository: {
          project: {
            createdById: userId,
          },
        },
      },
      orderBy: { analyzedAt: "desc" },
      take: 50,
    });

    // Calculate progress metrics
    const progressMetrics = calculateProgressMetrics(analysisHistory);

    // Get issue resolution trends
    const issueResolutionTrends = await getIssueResolutionTrends(userId);

    return {
      success: true,
      data: {
        profile,
        progressMetrics,
        issueResolutionTrends,
        skillProgression: calculateSkillProgression(analysisHistory),
      },
    };
  } catch (error) {
    console.error("Error getting developer progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Helper functions
async function generateCodingPatterns(analysisData: any, profile: any) {
  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Analyze coding patterns for a developer:

Current Analysis:
- Languages: ${analysisData.languages.join(", ")}
- Code Quality: ${analysisData.codeQuality}%
- Security Score: ${analysisData.securityScore}%
- Complexity Score: ${analysisData.complexityScore}
- Issue Types: ${analysisData.issueTypes.join(", ")}

Current Profile:
- Skill Level: ${profile.skillLevel}
- Preferred Languages: ${profile.preferredLanguages.join(", ")}
- Previous Patterns: ${JSON.stringify(profile.codingPatterns)}

Identify coding patterns and tendencies.`,
      schema: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        tendencies: z.array(z.string()),
        preferredPatterns: z.array(z.string()),
        riskAreas: z.array(z.string()),
      }),
    });

    return result.object;
  } catch (error) {
    console.error("Error generating coding patterns:", error);
    return profile.codingPatterns || {};
  }
}

function determineImprovementAreas(analysisData: any): string[] {
  const areas = [];

  if (analysisData.codeQuality < 70) {
    areas.push("Code Quality");
  }
  if (analysisData.securityScore < 80) {
    areas.push("Security Best Practices");
  }
  if (analysisData.complexityScore > 15) {
    areas.push("Code Complexity Management");
  }
  if (analysisData.issueTypes.includes("PERFORMANCE")) {
    areas.push("Performance Optimization");
  }
  if (analysisData.issueTypes.includes("CODE_SMELL")) {
    areas.push("Clean Code Practices");
  }

  return areas.slice(0, 5); // Limit to top 5 areas
}

function determineSkillLevel(analysisData: any, profile: any): string {
  const currentLevel = profile.skillLevel;
  const overallScore =
    (analysisData.codeQuality + analysisData.securityScore) / 2;

  if (overallScore >= 90 && currentLevel !== "senior") {
    return "senior";
  } else if (
    overallScore >= 70 &&
    overallScore < 90 &&
    currentLevel === "junior"
  ) {
    return "mid";
  } else if (overallScore < 50 && currentLevel === "mid") {
    return "junior";
  }

  return currentLevel;
}

async function generatePersonalizedSuggestions(
  profile: any,
  recentIssues: any[]
) {
  try {
    const issuesSummary = recentIssues.slice(0, 10).map((issue) => ({
      type: issue.type,
      severity: issue.severity,
      message: issue.message,
    }));

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Generate personalized coding suggestions for a developer:

Developer Profile:
- Skill Level: ${profile.skillLevel}
- Preferred Languages: ${profile.preferredLanguages.join(", ")}
- Improvement Areas: ${profile.improvementAreas.join(", ")}

Recent Issues:
${JSON.stringify(issuesSummary, null, 2)}

Provide actionable, personalized suggestions for improvement.`,
      schema: z.object({
        suggestions: z.array(
          z.object({
            category: z.string(),
            title: z.string(),
            description: z.string(),
            priority: z.enum(["high", "medium", "low"]),
            estimatedTime: z.string(),
            resources: z.array(z.string()),
          })
        ),
        learningPath: z.array(
          z.object({
            step: z.number(),
            title: z.string(),
            description: z.string(),
            resources: z.array(z.string()),
          })
        ),
      }),
    });

    return result.object;
  } catch (error) {
    console.error("Error generating personalized suggestions:", error);
    return {
      suggestions: [],
      learningPath: [],
    };
  }
}

function calculateProgressMetrics(analysisHistory: any[]) {
  if (analysisHistory.length < 2) {
    return {
      maintainabilityTrend: 0,
      securityTrend: 0,
      complexityTrend: 0,
      overallProgress: 0,
    };
  }

  const recent = analysisHistory.slice(0, 10);
  const older = analysisHistory.slice(10, 20);

  const recentAvg = {
    maintainability:
      recent.reduce((sum, a) => sum + a.maintainabilityIndex, 0) /
      recent.length,
    security:
      recent.reduce((sum, a) => sum + a.securityScore, 0) / recent.length,
    complexity:
      recent.reduce((sum, a) => sum + a.cyclomaticComplexity, 0) /
      recent.length,
  };

  const olderAvg = {
    maintainability:
      older.length > 0
        ? older.reduce((sum, a) => sum + a.maintainabilityIndex, 0) /
          older.length
        : recentAvg.maintainability,
    security:
      older.length > 0
        ? older.reduce((sum, a) => sum + a.securityScore, 0) / older.length
        : recentAvg.security,
    complexity:
      older.length > 0
        ? older.reduce((sum, a) => sum + a.cyclomaticComplexity, 0) /
          older.length
        : recentAvg.complexity,
  };

  return {
    maintainabilityTrend: recentAvg.maintainability - olderAvg.maintainability,
    securityTrend: recentAvg.security - olderAvg.security,
    complexityTrend: olderAvg.complexity - recentAvg.complexity, // Lower complexity is better
    overallProgress:
      (recentAvg.maintainability -
        olderAvg.maintainability +
        (recentAvg.security - olderAvg.security) +
        (olderAvg.complexity - recentAvg.complexity)) /
      3,
  };
}

async function getIssueResolutionTrends(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const recentResolved = await prisma.codeQualityIssue.count({
    where: {
      repository: {
        project: {
          createdById: userId,
        },
      },
      status: "RESOLVED",
      resolvedAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  const previousResolved = await prisma.codeQualityIssue.count({
    where: {
      repository: {
        project: {
          createdById: userId,
        },
      },
      status: "RESOLVED",
      resolvedAt: {
        gte: sixtyDaysAgo,
        lt: thirtyDaysAgo,
      },
    },
  });

  return {
    recentResolved,
    previousResolved,
    trend: recentResolved - previousResolved,
    resolutionRate:
      recentResolved > 0
        ? (recentResolved / (recentResolved + previousResolved)) * 100
        : 0,
  };
}

function calculateSkillProgression(analysisHistory: any[]) {
  if (analysisHistory.length < 5) {
    return {
      progression: "insufficient_data",
      trend: "stable",
      nextMilestone: "Complete more code analyses",
    };
  }

  const recent = analysisHistory.slice(0, 10);
  const avgQuality =
    recent.reduce((sum, a) => sum + a.maintainabilityIndex, 0) / recent.length;
  const avgSecurity =
    recent.reduce((sum, a) => sum + a.securityScore, 0) / recent.length;
  const overallScore = (avgQuality + avgSecurity) / 2;

  let progression = "beginner";
  let nextMilestone = "Focus on code quality fundamentals";

  if (overallScore >= 90) {
    progression = "expert";
    nextMilestone = "Mentor others and contribute to best practices";
  } else if (overallScore >= 80) {
    progression = "advanced";
    nextMilestone = "Achieve consistent 90%+ quality scores";
  } else if (overallScore >= 70) {
    progression = "intermediate";
    nextMilestone = "Improve security practices and code maintainability";
  } else if (overallScore >= 60) {
    progression = "developing";
    nextMilestone = "Focus on reducing code complexity and improving quality";
  }

  // Determine trend
  const firstHalf = recent.slice(0, 5);
  const secondHalf = recent.slice(5, 10);
  const firstAvg =
    firstHalf.reduce((sum, a) => sum + a.maintainabilityIndex, 0) /
    firstHalf.length;
  const secondAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((sum, a) => sum + a.maintainabilityIndex, 0) /
        secondHalf.length
      : firstAvg;

  const trend =
    firstAvg > secondAvg + 5
      ? "improving"
      : firstAvg < secondAvg - 5
        ? "declining"
        : "stable";

  return {
    progression,
    trend,
    nextMilestone,
    currentScore: Math.round(overallScore),
  };
}
