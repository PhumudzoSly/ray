import { ResearchStateManager } from "@/lib/redis/researchState";
import { redis } from "@/lib/redis";
import type {
  ResearchSession,
  ResearchPhase,
  ResearchPhaseType,
  ResearchContext,
  ResearchProgress,
  ResearchDepth,
} from "@/types/research";
import {
  RESEARCH_DEPTHS,
  PHASE_DESCRIPTIONS,
} from "@/lib/config/researchConfig";

// Import all analyzers
import { MarketScanAnalyzer } from "../analyzers/marketScanAnalyzer";
import {
  CompetitiveOverviewAnalyzer,
  CompetitiveDeepDiveAnalyzer,
} from "../analyzers/competitiveAnalyzer";
import { CustomerValidationAnalyzer } from "../analyzers/customerValidationAnalyzer";
import { BusinessModelAnalyzer } from "../analyzers/businessModelAnalyzer";
import { FinancialProjectionsAnalyzer } from "../analyzers/financialProjectionsAnalyzer";
import { RiskAnalysisAnalyzer } from "../analyzers/riskAnalysisAnalyzer";
import { TechnicalFeasibilityAnalyzer } from "../analyzers/technicalFeasibilityAnalyzer";
import type { PhaseAnalyzer } from "../analyzers/baseAnalyzer";

export class ResearchOrchestrator {
  private stateManager: ResearchStateManager;
  private phaseAnalyzers: Map<ResearchPhaseType, PhaseAnalyzer>;

  constructor() {
    this.stateManager = new ResearchStateManager(redis);
    this.phaseAnalyzers = new Map();
    this.initializeAnalyzers();
  }

  async executeResearch(
    sessionId: string,
    context: ResearchContext,
    onProgress?: (progress: ResearchProgress) => void
  ): Promise<ResearchSession> {
    const session = await this.stateManager.getSessionState(sessionId);
    if (!session) {
      throw new Error("Research session not found");
    }

    // Acquire lock to prevent concurrent execution
    const lockAcquired = await this.stateManager.acquireLock(sessionId, 1800); // 30 minutes
    if (!lockAcquired) {
      throw new Error("Research session is already being processed");
    }

    try {
      await this.stateManager.updateSessionStatus(sessionId, "IN_PROGRESS");

      const config = RESEARCH_DEPTHS[session.depth];
      const totalPhases = session.phases.length;

      for (let i = session.currentPhaseIndex; i < session.phases.length; i++) {
        const phase = session.phases[i];
        if (!phase) {
          throw new Error(
            `Invalid session state: missing phase at index ${i}. Please restart the research.`
          );
        }

        // Check if session was paused
        const currentSession =
          await this.stateManager.getSessionState(sessionId);
        if (currentSession?.status === "PAUSED") {
          break;
        }

        // Update progress
        const progress: ResearchProgress = {
          sessionId,
          currentPhase: phase.name,
          phaseProgress: 0,
          overallProgress: (i / totalPhases) * 100,
          estimatedTimeRemaining: this.calculateRemainingTime(
            session.phases,
            i
          ),
          completedPhases: session.phases.slice(0, i).map((p) => p.name),
          failedPhases: session.phases
            .filter((p) => p.status === "FAILED")
            .map((p) => p.name),
        };

        await this.stateManager.updateProgress(sessionId, progress);
        onProgress?.(progress);

        // Execute the phase
        await this.executePhase(
          sessionId,
          phase,
          context,
          config.maxIterations,
          onProgress
        );

        // Update session progress
        session.currentPhaseIndex = i + 1;
        await this.stateManager.updateSession(sessionId, {
          currentPhaseIndex: i + 1,
          overallConfidence: this.calculateOverallConfidence(session.phases),
        });
      }

      // Mark as completed if all phases are done
      if (session.currentPhaseIndex >= session.phases.length) {
        await this.stateManager.updateSessionStatus(sessionId, "COMPLETED");
        await this.stateManager.updateSession(sessionId, {
          actualCompletion: new Date(),
        });
      }

      return (await this.stateManager.getSessionState(sessionId)) || session;
    } catch (error) {
      console.error("Research execution failed:", error);
      await this.stateManager.updateSessionStatus(sessionId, "FAILED");
      throw error;
    } finally {
      await this.stateManager.releaseLock(sessionId);
    }
  }

  async pauseResearch(sessionId: string): Promise<void> {
    const session = await this.stateManager.getSessionState(sessionId);
    if (!session) {
      throw new Error("Research session not found");
    }

    if (session.status !== "IN_PROGRESS") {
      throw new Error("Can only pause research that is in progress");
    }

    await this.stateManager.updateSessionStatus(sessionId, "PAUSED");
  }

  async resumeResearch(
    sessionId: string,
    context: ResearchContext,
    onProgress?: (progress: ResearchProgress) => void
  ): Promise<ResearchSession> {
    const session = await this.stateManager.getSessionState(sessionId);
    if (!session) {
      throw new Error("Research session not found or expired");
    }

    if (session.status !== "PAUSED") {
      throw new Error("Can only resume paused research");
    }

    // Validate that all previous phase data is still available
    for (let i = 0; i < session.currentPhaseIndex; i++) {
      const phase = session.phases[i];
      if (!phase) {
        throw new Error(
          "Invalid session state: missing phase data. Please restart the research."
        );
      }

      const findings = await this.stateManager.getPhaseFindings(
        sessionId,
        phase.id
      );
      if (!findings && phase.status === "COMPLETED") {
        throw new Error(
          "Previous research data has expired. Please restart the research."
        );
      }
    }

    return this.executeResearch(sessionId, context, onProgress);
  }

  async getResearchProgress(
    sessionId: string
  ): Promise<ResearchProgress | null> {
    return this.stateManager.getProgress(sessionId);
  }

  private async executePhase(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext,
    maxIterations: number,
    onProgress?: (progress: ResearchProgress) => void
  ): Promise<void> {
    const analyzer = this.phaseAnalyzers.get(phase.name);
    if (!analyzer) {
      throw new Error(`No analyzer found for phase: ${phase.name}`);
    }

    await this.stateManager.updatePhaseStatus(
      sessionId,
      phase.id,
      "IN_PROGRESS",
      {
        startedAt: new Date(),
      }
    );

    // Update progress for phase start
    const session = await this.stateManager.getSessionState(sessionId);
    if (session) {
      const progress: ResearchProgress = {
        sessionId,
        currentPhase: phase.name,
        phaseProgress: 0,
        overallProgress:
          (session.currentPhaseIndex / session.phases.length) * 100,
        estimatedTimeRemaining: this.calculateRemainingTime(
          session.phases,
          session.currentPhaseIndex
        ),
        completedPhases: session.phases
          .slice(0, session.currentPhaseIndex)
          .map((p) => p.name),
        failedPhases: session.phases
          .filter((p) => p.status === "FAILED")
          .map((p) => p.name),
      };
      await this.stateManager.updateProgress(sessionId, progress);
      onProgress?.(progress);
    }

    try {
      const startTime = Date.now();

      // Set max iterations for this phase
      if ("maxIterations" in analyzer) {
        (analyzer as any).maxIterations = maxIterations;
      }

      const result = await analyzer.analyze(sessionId, phase, context);

      const duration = Date.now() - startTime;

      // Update phase with results
      await this.stateManager.updatePhaseStatus(
        sessionId,
        phase.id,
        "COMPLETED",
        {
          confidence: result.confidence,
          duration,
          iterations: result.iterations,
          completedAt: new Date(),
        }
      );

      await this.stateManager.storePhaseFindings(
        sessionId,
        phase.id,
        result.findings
      );

      // Update phase progress to 100%
      if (session) {
        const progress: ResearchProgress = {
          sessionId,
          currentPhase: phase.name,
          phaseProgress: 100,
          overallProgress:
            ((session.currentPhaseIndex + 1) / session.phases.length) * 100,
          estimatedTimeRemaining: this.calculateRemainingTime(
            session.phases,
            session.currentPhaseIndex + 1
          ),
          completedPhases: [
            ...session.phases
              .slice(0, session.currentPhaseIndex)
              .map((p) => p.name),
            phase.name,
          ],
          failedPhases: session.phases
            .filter((p) => p.status === "FAILED")
            .map((p) => p.name),
        };
        await this.stateManager.updateProgress(sessionId, progress);
        onProgress?.(progress);
      }
    } catch (error) {
      console.error(`Phase ${phase.name} failed:`, error);

      await this.stateManager.updatePhaseStatus(sessionId, phase.id, "FAILED", {
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      });

      // Continue with other phases instead of failing completely
      // This implements the requirement for graceful degradation
    }
  }

  private calculateRemainingTime(
    phases: ResearchPhase[],
    currentIndex: number
  ): number {
    let remainingTime = 0;

    for (let i = currentIndex; i < phases.length; i++) {
      const phase = phases[i];
      if (!phase) {
        continue; // Skip undefined phases
      }

      const phaseDescription = PHASE_DESCRIPTIONS[phase.name];
      remainingTime += phaseDescription.estimatedDuration;
    }

    return remainingTime;
  }

  private calculateOverallConfidence(phases: ResearchPhase[]): number {
    const completedPhases = phases.filter((p) => p.status === "COMPLETED");

    if (completedPhases.length === 0) {
      return 0;
    }

    const totalConfidence = completedPhases.reduce(
      (sum, phase) => sum + phase.confidence,
      0
    );
    return Math.round(totalConfidence / completedPhases.length);
  }

  private initializeAnalyzers(): void {
    this.phaseAnalyzers.set("MARKET_SCAN", new MarketScanAnalyzer());
    this.phaseAnalyzers.set(
      "COMPETITIVE_OVERVIEW",
      new CompetitiveOverviewAnalyzer()
    );
    this.phaseAnalyzers.set(
      "COMPETITIVE_DEEP_DIVE",
      new CompetitiveDeepDiveAnalyzer()
    );
    this.phaseAnalyzers.set(
      "CUSTOMER_VALIDATION",
      new CustomerValidationAnalyzer()
    );
    this.phaseAnalyzers.set("BUSINESS_MODEL", new BusinessModelAnalyzer());
    this.phaseAnalyzers.set(
      "FINANCIAL_PROJECTIONS",
      new FinancialProjectionsAnalyzer()
    );
    this.phaseAnalyzers.set("RISK_ANALYSIS", new RiskAnalysisAnalyzer());
    this.phaseAnalyzers.set(
      "TECHNICAL_FEASIBILITY",
      new TechnicalFeasibilityAnalyzer()
    );
  }

  // Utility method to create a new research session
  async createResearchSession(
    ideaId: string,
    organizationId: string,
    depth: ResearchDepth,
    context: ResearchContext
  ): Promise<string> {
    const sessionId = `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const config = RESEARCH_DEPTHS[depth];

    // Create phases based on depth configuration
    const phases: ResearchPhase[] = config.phases.map((phaseName, index) => ({
      id: `${sessionId}_phase_${index}`,
      name: phaseName,
      status: "PENDING",
      findings: {},
      questions: [],
      confidence: 0,
      duration: 0,
      iterations: 0,
    }));

    const estimatedCompletion = new Date();
    estimatedCompletion.setMilliseconds(
      estimatedCompletion.getMilliseconds() + config.timeout
    );

    const session: ResearchSession = {
      id: sessionId,
      ideaId,
      organizationId,
      depth,
      status: "INITIALIZING",
      phases,
      currentPhaseIndex: 0,
      overallConfidence: 0,
      estimatedCompletion,
      totalCost: config.costEstimate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.stateManager.initializeSession(session);

    return sessionId;
  }

  // Utility method to get session status
  async getSessionStatus(sessionId: string): Promise<ResearchSession | null> {
    return this.stateManager.getSessionState(sessionId);
  }

  // Utility method to cleanup expired sessions
  async cleanupSession(sessionId: string): Promise<void> {
    await this.stateManager.cleanupSession(sessionId);
  }
}
