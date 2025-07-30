import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface CachedAnalysisResult {
  analysisId: string;
  repositoryId: string;
  commitSha: string;
  metrics: {
    linesOfCode: number;
    cyclomaticComplexity: number;
    technicalDebtMinutes: number;
    maintainabilityIndex: number;
    testCoverage: number | null;
    securityScore: number;
  };
  issuesCount: number;
  criticalIssuesCount: number;
  analyzedAt: string;
  expiresAt: number;
}

export interface CachedRepositoryHealth {
  repositoryId: string;
  overallHealth: number;
  trend: "improving" | "stable" | "degrading";
  lastAnalyzed: string;
  issuesSummary: {
    total: number;
    critical: number;
    major: number;
    minor: number;
  };
  expiresAt: number;
}

export interface CachedProjectDebt {
  projectId: string;
  totalDebtMinutes: number;
  debtRatio: number;
  impactOnVelocity: number;
  repositoriesCount: number;
  lastUpdated: string;
  expiresAt: number;
}

class CodeAnalysisCache {
  private readonly TTL = {
    ANALYSIS_RESULT: 60 * 60 * 24, // 24 hours
    REPOSITORY_HEALTH: 60 * 60 * 2, // 2 hours
    PROJECT_DEBT: 60 * 60 * 1, // 1 hour
    DEVELOPER_PROFILE: 60 * 60 * 12, // 12 hours
  };

  // Analysis Results Cache
  async cacheAnalysisResult(result: CachedAnalysisResult): Promise<void> {
    const key = `analysis:${result.repositoryId}:${result.commitSha}`;
    const data = {
      ...result,
      expiresAt: Date.now() + this.TTL.ANALYSIS_RESULT * 1000,
    };

    await redis.setex(key, this.TTL.ANALYSIS_RESULT, JSON.stringify(data));

    // Also cache by repository for quick lookup
    await redis.setex(
      `analysis:latest:${result.repositoryId}`,
      this.TTL.ANALYSIS_RESULT,
      JSON.stringify(data)
    );
  }

  async getAnalysisResult(
    repositoryId: string,
    commitSha?: string
  ): Promise<CachedAnalysisResult | null> {
    const key = commitSha
      ? `analysis:${repositoryId}:${commitSha}`
      : `analysis:latest:${repositoryId}`;

    const cached = await redis.get(key);
    if (!cached) return null;

    const data = JSON.parse(cached as string) as CachedAnalysisResult;

    // Check if expired
    if (Date.now() > data.expiresAt) {
      await redis.del(key);
      return null;
    }

    return data;
  }

  // Repository Health Cache
  async cacheRepositoryHealth(health: CachedRepositoryHealth): Promise<void> {
    const key = `health:${health.repositoryId}`;
    const data = {
      ...health,
      expiresAt: Date.now() + this.TTL.REPOSITORY_HEALTH * 1000,
    };

    await redis.setex(key, this.TTL.REPOSITORY_HEALTH, JSON.stringify(data));
  }

  async getRepositoryHealth(
    repositoryId: string
  ): Promise<CachedRepositoryHealth | null> {
    const cached = await redis.get(`health:${repositoryId}`);
    if (!cached) return null;

    const data = JSON.parse(cached as string) as CachedRepositoryHealth;

    if (Date.now() > data.expiresAt) {
      await redis.del(`health:${repositoryId}`);
      return null;
    }

    return data;
  }

  // Project Technical Debt Cache
  async cacheProjectDebt(debt: CachedProjectDebt): Promise<void> {
    const key = `debt:${debt.projectId}`;
    const data = {
      ...debt,
      expiresAt: Date.now() + this.TTL.PROJECT_DEBT * 1000,
    };

    await redis.setex(key, this.TTL.PROJECT_DEBT, JSON.stringify(data));
  }

  async getProjectDebt(projectId: string): Promise<CachedProjectDebt | null> {
    const cached = await redis.get(`debt:${projectId}`);
    if (!cached) return null;

    const data = JSON.parse(cached as string) as CachedProjectDebt;

    if (Date.now() > data.expiresAt) {
      await redis.del(`debt:${projectId}`);
      return null;
    }

    return data;
  }

  // Developer Profile Cache
  async cacheDeveloperProfile(userId: string, profile: any): Promise<void> {
    const key = `profile:${userId}`;
    const data = {
      ...profile,
      expiresAt: Date.now() + this.TTL.DEVELOPER_PROFILE * 1000,
    };

    await redis.setex(key, this.TTL.DEVELOPER_PROFILE, JSON.stringify(data));
  }

  async getDeveloperProfile(userId: string): Promise<any | null> {
    const cached = await redis.get(`profile:${userId}`);
    if (!cached) return null;

    const data = JSON.parse(cached as string);

    if (Date.now() > data.expiresAt) {
      await redis.del(`profile:${userId}`);
      return null;
    }

    return data;
  }

  // Code Quality Trends Cache
  async cacheTrends(repositoryId: string, trends: any): Promise<void> {
    const key = `trends:${repositoryId}`;
    await redis.setex(key, this.TTL.REPOSITORY_HEALTH, JSON.stringify(trends));
  }

  async getTrends(repositoryId: string): Promise<any | null> {
    const cached = await redis.get(`trends:${repositoryId}`);
    return cached ? JSON.parse(cached as string) : null;
  }

  // Invalidation methods
  async invalidateRepository(repositoryId: string): Promise<void> {
    const keys = [
      `analysis:latest:${repositoryId}`,
      `health:${repositoryId}`,
      `trends:${repositoryId}`,
    ];

    await Promise.all(keys.map((key) => redis.del(key)));
  }

  async invalidateProject(projectId: string): Promise<void> {
    await redis.del(`debt:${projectId}`);
  }

  async invalidateUser(userId: string): Promise<void> {
    await redis.del(`profile:${userId}`);
  }

  // Batch operations
  async getMultipleRepositoryHealth(
    repositoryIds: string[]
  ): Promise<Record<string, CachedRepositoryHealth | null>> {
    const keys = repositoryIds.map((id) => `health:${id}`);
    const results = await redis.mget(...keys);

    const healthData: Record<string, CachedRepositoryHealth | null> = {};

    repositoryIds.forEach((id, index) => {
      const cached = results[index];
      if (cached) {
        const data = JSON.parse(cached as string) as CachedRepositoryHealth;
        healthData[id] = Date.now() > data.expiresAt ? null : data;
      } else {
        healthData[id] = null;
      }
    });

    return healthData;
  }

  // Analytics and monitoring
  async getCacheStats(): Promise<{
    analysisResults: number;
    repositoryHealth: number;
    projectDebt: number;
    developerProfiles: number;
  }> {
    const [analysisKeys, healthKeys, debtKeys, profileKeys] = await Promise.all(
      [
        redis.keys("analysis:*"),
        redis.keys("health:*"),
        redis.keys("debt:*"),
        redis.keys("profile:*"),
      ]
    );

    return {
      analysisResults: analysisKeys.length,
      repositoryHealth: healthKeys.length,
      projectDebt: debtKeys.length,
      developerProfiles: profileKeys.length,
    };
  }

  // Cleanup expired entries
  async cleanup(): Promise<void> {
    const allKeys = await redis.keys("*");
    const expiredKeys = [];

    for (const key of allKeys) {
      const data = await redis.get(key);
      if (data) {
        try {
          const parsed = JSON.parse(data as string);
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            expiredKeys.push(key);
          }
        } catch {
          // Skip non-JSON entries
        }
      }
    }

    if (expiredKeys.length > 0) {
      await redis.del(...expiredKeys);
    }
  }

  // Preload cache for project
  async preloadProjectCache(
    projectId: string,
    repositoryIds: string[]
  ): Promise<void> {
    // This would be called when a user navigates to a project
    // to preload commonly accessed data

    const promises = repositoryIds.map(async (repoId) => {
      // Check if we need to refresh cache
      const health = await this.getRepositoryHealth(repoId);
      if (!health) {
        // Cache miss - would trigger background refresh
        console.log(`Cache miss for repository health: ${repoId}`);
      }
    });

    await Promise.all(promises);
  }
}

export const codeAnalysisCache = new CodeAnalysisCache();

// Utility functions for cache warming
export async function warmRepositoryCache(
  repositoryId: string,
  analysisData: any
): Promise<void> {
  const cachedResult: CachedAnalysisResult = {
    analysisId: analysisData.id,
    repositoryId,
    commitSha: analysisData.commitSha,
    metrics: {
      linesOfCode: analysisData.linesOfCode,
      cyclomaticComplexity: analysisData.cyclomaticComplexity,
      technicalDebtMinutes: analysisData.technicalDebtMinutes,
      maintainabilityIndex: analysisData.maintainabilityIndex,
      testCoverage: analysisData.testCoverage,
      securityScore: analysisData.securityScore,
    },
    issuesCount: analysisData.issuesCount || 0,
    criticalIssuesCount: analysisData.criticalIssuesCount || 0,
    analyzedAt: analysisData.analyzedAt.toISOString(),
    expiresAt: 0, // Will be set by cache method
  };

  await codeAnalysisCache.cacheAnalysisResult(cachedResult);

  // Also cache health summary
  const health: CachedRepositoryHealth = {
    repositoryId,
    overallHealth:
      (analysisData.maintainabilityIndex + analysisData.securityScore) / 2,
    trend: "stable", // Would be calculated based on historical data
    lastAnalyzed: analysisData.analyzedAt.toISOString(),
    issuesSummary: {
      total: analysisData.issuesCount || 0,
      critical: analysisData.criticalIssuesCount || 0,
      major: analysisData.majorIssuesCount || 0,
      minor: analysisData.minorIssuesCount || 0,
    },
    expiresAt: 0,
  };

  await codeAnalysisCache.cacheRepositoryHealth(health);
}

export async function warmProjectDebtCache(
  projectId: string,
  debtData: any
): Promise<void> {
  const cachedDebt: CachedProjectDebt = {
    projectId,
    totalDebtMinutes: debtData.totalDebtMinutes,
    debtRatio: debtData.debtRatio,
    impactOnVelocity: debtData.impactOnVelocity,
    repositoriesCount: debtData.repositories.length,
    lastUpdated: new Date().toISOString(),
    expiresAt: 0,
  };

  await codeAnalysisCache.cacheProjectDebt(cachedDebt);
}
