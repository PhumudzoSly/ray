import type { Redis } from "@upstash/redis";
import type {
  ResearchSession,
  ResearchPhase,
  PhaseStatus,
  ResearchDepth,
  ResearchProgress,
  ResearchStatus,
} from "@/types/research";

export class ResearchStateManager {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // Key patterns for Redis storage
  private getKeys(sessionId: string) {
    return {
      session: `research:${sessionId}:session`,
      phase: (phaseId: string) => `research:${sessionId}:phase:${phaseId}`,
      progress: `research:${sessionId}:progress`,
      findings: (phaseId: string) =>
        `research:${sessionId}:findings:${phaseId}`,
      questions: (phaseId: string) =>
        `research:${sessionId}:questions:${phaseId}`,
      lock: `research:${sessionId}:lock`,
      iterations: (phaseId: string) =>
        `research:${sessionId}:iterations:${phaseId}`,
    };
  }

  async initializeSession(session: ResearchSession): Promise<void> {
    const keys = this.getKeys(session.id);
    const ttl = this.getTTL(session.depth);

    try {
      const pipeline = this.redis.pipeline();

      // Store session data
      pipeline.hset(keys.session, {
        id: session.id,
        ideaId: session.ideaId,
        organizationId: session.organizationId,
        depth: session.depth,
        status: session.status,
        currentPhaseIndex: session.currentPhaseIndex,
        overallConfidence: session.overallConfidence,
        totalCost: session.totalCost,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        estimatedCompletion: session.estimatedCompletion?.toISOString(),
        actualCompletion: session.actualCompletion?.toISOString(),
      });

      pipeline.expire(keys.session, ttl);

      // Initialize phases
      for (const phase of session.phases) {
        const phaseKey = keys.phase(phase.id);
        pipeline.hset(phaseKey, {
          id: phase.id,
          name: phase.name,
          status: phase.status,
          confidence: phase.confidence,
          duration: phase.duration,
          iterations: phase.iterations,
          startedAt: phase.startedAt?.toISOString() || "",
          completedAt: phase.completedAt?.toISOString() || "",
          error: phase.error || "",
        });
        pipeline.expire(phaseKey, ttl);
      }

      await pipeline.exec();
    } catch (error) {
      console.error("Failed to initialize research session in Redis:", error);
      throw new Error("Failed to initialize research session");
    }
  }

  async updateSessionStatus(
    sessionId: string,
    status: ResearchStatus
  ): Promise<void> {
    const keys = this.getKeys(sessionId);

    try {
      await this.redis.hset(keys.session, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update session status in Redis:", error);
      throw new Error("Failed to update session status");
    }
  }

  async updatePhaseStatus(
    sessionId: string,
    phaseId: string,
    status: PhaseStatus,
    additionalData?: Partial<ResearchPhase>
  ): Promise<void> {
    const keys = this.getKeys(sessionId);

    try {
      const updateData: Record<string, any> = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (additionalData) {
        if (additionalData.confidence !== undefined) {
          updateData.confidence = additionalData.confidence;
        }
        if (additionalData.duration !== undefined) {
          updateData.duration = additionalData.duration;
        }
        if (additionalData.iterations !== undefined) {
          updateData.iterations = additionalData.iterations;
        }
        if (additionalData.startedAt) {
          updateData.startedAt = additionalData.startedAt.toISOString();
        }
        if (additionalData.completedAt) {
          updateData.completedAt = additionalData.completedAt.toISOString();
        }
        if (additionalData.error) {
          updateData.error = additionalData.error;
        }
      }

      await this.redis.hset(keys.phase(phaseId), updateData);
    } catch (error) {
      console.error("Failed to update phase status in Redis:", error);
      throw new Error("Failed to update phase status");
    }
  }

  async storePhaseFindings(
    sessionId: string,
    phaseId: string,
    findings: any
  ): Promise<void> {
    const keys = this.getKeys(sessionId);

    try {
      await this.redis.hset(keys.findings(phaseId), {
        findings: JSON.stringify(findings),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to store phase findings in Redis:", error);
      throw new Error("Failed to store phase findings");
    }
  }

  async getPhaseFindings(
    sessionId: string,
    phaseId: string
  ): Promise<any | null> {
    const keys = this.getKeys(sessionId);

    try {
      const data = await this.redis.hget(keys.findings(phaseId), "findings");
      return data ? JSON.parse(data as string) : null;
    } catch (error) {
      console.error("Failed to get phase findings from Redis:", error);
      return null;
    }
  }

  async storeIterationResult(
    sessionId: string,
    phaseId: string,
    iteration: number,
    findings: any,
    confidence: number
  ): Promise<void> {
    const keys = this.getKeys(sessionId);

    try {
      await this.redis.hset(keys.iterations(phaseId), {
        [`iteration_${iteration}`]: JSON.stringify({
          findings,
          confidence,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Failed to store iteration result in Redis:", error);
      // Don't throw here as this is for debugging purposes
    }
  }

  async getSessionState(sessionId: string): Promise<ResearchSession | null> {
    const keys = this.getKeys(sessionId);

    try {
      const sessionData = await this.redis.hgetall(keys.session);

      if (!sessionData || Object.keys(sessionData).length === 0) {
        return null;
      }

      // Get all phases for this session
      const phases: ResearchPhase[] = [];
      const phaseKeys = await this.redis.keys(`research:${sessionId}:phase:*`);

      for (const phaseKey of phaseKeys) {
        const phaseData = await this.redis.hgetall(phaseKey);
        if (phaseData && Object.keys(phaseData).length > 0) {
          const findings = await this.getPhaseFindings(
            sessionId,
            phaseData.id as string
          );

          phases.push({
            id: phaseData.id as string,
            name: phaseData.name as any,
            status: phaseData.status as PhaseStatus,
            findings: findings || {},
            questions: [], // Will be populated from findings if needed
            confidence: Number(phaseData.confidence) || 0,
            duration: Number(phaseData.duration) || 0,
            iterations: Number(phaseData.iterations) || 0,
            startedAt: phaseData.startedAt
              ? new Date(phaseData.startedAt as string)
              : undefined,
            completedAt: phaseData.completedAt
              ? new Date(phaseData.completedAt as string)
              : undefined,
            error: (phaseData.error as string) || undefined,
          });
        }
      }

      return {
        id: sessionData.id as string,
        ideaId: sessionData.ideaId as string,
        organizationId: sessionData.organizationId as string,
        depth: sessionData.depth as any,
        status: sessionData.status as ResearchStatus,
        phases: phases.sort((a, b) => a.name.localeCompare(b.name)),
        currentPhaseIndex: Number(sessionData.currentPhaseIndex) || 0,
        overallConfidence: Number(sessionData.overallConfidence) || 0,
        totalCost: Number(sessionData.totalCost) || 0,
        createdAt: new Date(sessionData.createdAt as string),
        updatedAt: new Date(sessionData.updatedAt as string),
        estimatedCompletion: sessionData.estimatedCompletion
          ? new Date(sessionData.estimatedCompletion as string)
          : new Date(),
        actualCompletion: sessionData.actualCompletion
          ? new Date(sessionData.actualCompletion as string)
          : undefined,
      };
    } catch (error) {
      console.error("Failed to get session state from Redis:", error);
      return null;
    }
  }

  async updateProgress(
    sessionId: string,
    progress: ResearchProgress
  ): Promise<void> {
    const keys = this.getKeys(sessionId);

    try {
      await this.redis.hset(keys.progress, {
        sessionId: progress.sessionId,
        currentPhase: progress.currentPhase,
        phaseProgress: progress.phaseProgress,
        overallProgress: progress.overallProgress,
        estimatedTimeRemaining: progress.estimatedTimeRemaining,
        completedPhases: JSON.stringify(progress.completedPhases),
        failedPhases: JSON.stringify(progress.failedPhases),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update progress in Redis:", error);
      throw new Error("Failed to update progress");
    }
  }

  async getProgress(sessionId: string): Promise<ResearchProgress | null> {
    const keys = this.getKeys(sessionId);

    try {
      const progressData = await this.redis.hgetall(keys.progress);

      if (!progressData || Object.keys(progressData).length === 0) {
        return null;
      }

      return {
        sessionId: progressData.sessionId as string,
        currentPhase: progressData.currentPhase as any,
        phaseProgress: Number(progressData.phaseProgress) || 0,
        overallProgress: Number(progressData.overallProgress) || 0,
        estimatedTimeRemaining:
          Number(progressData.estimatedTimeRemaining) || 0,
        completedPhases: JSON.parse(
          (progressData.completedPhases as string) || "[]"
        ),
        failedPhases: JSON.parse((progressData.failedPhases as string) || "[]"),
      };
    } catch (error) {
      console.error("Failed to get progress from Redis:", error);
      return null;
    }
  }

  async acquireLock(sessionId: string, ttl: number = 300): Promise<boolean> {
    const keys = this.getKeys(sessionId);

    try {
      const result = await this.redis.set(keys.lock, "locked", {
        nx: true,
        ex: ttl,
      });
      return result === "OK";
    } catch (error) {
      console.error("Failed to acquire lock:", error);
      return false;
    }
  }

  async releaseLock(sessionId: string): Promise<void> {
    const keys = this.getKeys(sessionId);

    try {
      await this.redis.del(keys.lock);
    } catch (error) {
      console.error("Failed to release lock:", error);
    }
  }

  async cleanupSession(sessionId: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`research:${sessionId}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error("Failed to cleanup session from Redis:", error);
    }
  }

  async updateSession(
    sessionId: string,
    updates: Partial<ResearchSession>
  ): Promise<void> {
    const keys = this.getKeys(sessionId);

    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (updates.status) updateData.status = updates.status;
      if (updates.currentPhaseIndex !== undefined)
        updateData.currentPhaseIndex = updates.currentPhaseIndex;
      if (updates.overallConfidence !== undefined)
        updateData.overallConfidence = updates.overallConfidence;
      if (updates.totalCost !== undefined)
        updateData.totalCost = updates.totalCost;
      if (updates.actualCompletion)
        updateData.actualCompletion = updates.actualCompletion.toISOString();

      await this.redis.hset(keys.session, updateData);
    } catch (error) {
      console.error("Failed to update session in Redis:", error);
      throw new Error("Failed to update session");
    }
  }

  private getTTL(depth: ResearchDepth): number {
    const ttlMap = {
      QUICK: 7200, // 2 hours
      STANDARD: 14400, // 4 hours
      DEEP: 28800, // 8 hours
      EXHAUSTIVE: 86400, // 24 hours
    };
    return ttlMap[depth];
  }
}
