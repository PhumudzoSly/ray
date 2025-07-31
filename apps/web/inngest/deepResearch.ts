import { inngestClient } from "@/lib/inngest";
import { ResearchOrchestrator } from "./orchestrator/researchOrchestrator";
import { prisma } from "@workspace/backend";
import type { ResearchDepth, ResearchContext } from "@/types/research";
import { RESEARCH_DEPTHS } from "@/lib/config/researchConfig";

// Main deep research function
export const deepResearchAgent = inngestClient.createFunction(
  {
    id: "deep-research-agent",
    name: "Deep Research SaaS Validation Agent",
    concurrency: {
      limit: 10, // Allow up to 10 concurrent research sessions
    },
  },
  { event: "deep-research/start" },
  async ({ step, event }) => {
    const { ideaId, organizationId, depth, userId, researchId } =
      event.data as {
        ideaId: string;
        organizationId: string;
        depth: ResearchDepth;
        userId: string;
        researchId?: string;
      };

    console.log("🚀 Starting deep research process", { ideaId, depth });

    // Step 1: Validate inputs and fetch idea
    const { idea, context } = await step.run(
      "validate-and-fetch-idea",
      async () => {
        const idea = await prisma.idea.findUnique({
          where: { id: ideaId },
          include: {
            organization: true,
          },
        });

        if (!idea) {
          throw new Error(`Idea not found: ${ideaId}`);
        }

        if (idea.organizationId !== organizationId) {
          throw new Error("Unauthorized: Idea does not belong to organization");
        }

        const context: ResearchContext = {
          ideaName: idea.name,
          ideaDescription: idea.description,
          industry: idea.industry,
          targetAudience: idea.problemSolved || undefined,
          problemSolved: idea.problemSolved || undefined,
          solutionOffered: idea.solutionOffered || undefined,
        };

        return { idea, context };
      }
    );

    // Step 2: Create research session
    const sessionId = await step.run("create-research-session", async () => {
      const orchestrator = new ResearchOrchestrator();
      const sessionId = await orchestrator.createResearchSession(
        ideaId,
        organizationId,
        depth,
        context
      );

      // Create database record
      await prisma.researchSession.create({
        data: {
          id: sessionId,
          ideaId,
          organizationId,
          depth,
          status: "INITIALIZING",
          currentPhaseIndex: 0,
          overallConfidence: 0,
          totalCost: RESEARCH_DEPTHS[depth].costEstimate,
        },
      });

      return sessionId;
    });

    // Step 3: Execute research
    const result = await step.run("execute-research", async () => {
      const orchestrator = new ResearchOrchestrator();

      // Progress callback that updates both session and research records
      const progressCallback = async (progress: any) => {
        // Calculate current phase index based on completed phases
        const currentPhaseIndex = progress.completedPhases?.length || 0;

        await prisma.researchSession.update({
          where: { id: sessionId },
          data: {
            currentPhaseIndex,
            // Don't overwrite overallConfidence with progress percentage
            // It will be updated with actual confidence when research completes
            updatedAt: new Date(),
          },
        });

        // Only update marketResearch with actual confidence scores, not progress
        // This will be done in the final persist-results step
      };

      try {
        const session = await orchestrator.executeResearch(
          sessionId,
          context,
          progressCallback
        );

        return { success: true, session };
      } catch (error) {
        console.error("Research execution failed:", error);

        // Update database with failure
        await prisma.researchSession.update({
          where: { id: sessionId },
          data: {
            status: "FAILED",
            updatedAt: new Date(),
          },
        });

        // Also mark the marketResearch as failed if provided
        if (researchId) {
          await prisma.marketResearch.update({
            where: { id: researchId },
            data: {
              completed: false,
              lastUpdated: new Date(),
            },
          });

          // Reset idea status back to invalidated
          await prisma.idea.update({
            where: { id: ideaId },
            data: {
              status: "INVALIDATED",
            },
          });
        }

        throw error;
      }
    });

    // Step 4: Persist final results to database
    await step.run("persist-results", async () => {
      const orchestrator = new ResearchOrchestrator();
      const finalSession = await orchestrator.getSessionStatus(sessionId);

      if (!finalSession) {
        throw new Error("Session not found after execution");
      }

      // Create phase results in database
      for (const phase of finalSession.phases) {
        if (phase.status === "COMPLETED") {
          await prisma.researchPhaseResult.create({
            data: {
              sessionId,
              phaseName: phase.name,
              status: phase.status,
              findings: phase.findings,
              confidence: phase.confidence,
              duration: phase.duration,
              iterations: phase.iterations,
              startedAt: phase.startedAt,
              completedAt: phase.completedAt,
            },
          });
        }
      }

      // Update final session status
      await prisma.researchSession.update({
        where: { id: sessionId },
        data: {
          status: finalSession.status,
          overallConfidence: finalSession.overallConfidence,
          actualCompletion: finalSession.actualCompletion,
          updatedAt: new Date(),
        },
      });

      // Mark the marketResearch as completed if provided
      if (researchId && finalSession.status === "COMPLETED") {
        await prisma.marketResearch.update({
          where: { id: researchId },
          data: {
            completed: true,
            validationScore: finalSession.overallConfidence,
            confidenceLevel:
              finalSession.overallConfidence > 80
                ? "HIGH"
                : finalSession.overallConfidence > 60
                  ? "MEDIUM"
                  : "LOW",
            lastUpdated: new Date(),
          },
        });

        // Update idea status to validated
        await prisma.idea.update({
          where: { id: ideaId },
          data: {
            status: "VALIDATED",
          },
        });
      }
    });

    console.log("✅ Deep research process completed", { sessionId });
    return { success: true, sessionId };
  }
);

// Cleanup function for expired sessions
export const cleanupExpiredSessions = inngestClient.createFunction(
  {
    id: "cleanup-expired-sessions",
    name: "Cleanup Expired Research Sessions",
  },
  { cron: "0 */6 * * *" }, // Run every 6 hours
  async ({ step }) => {
    await step.run("cleanup-sessions", async () => {
      const orchestrator = new ResearchOrchestrator();

      // Find sessions that should be cleaned up (older than 24 hours and not completed)
      const expiredSessions = await prisma.researchSession.findMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          },
          status: {
            in: ["INITIALIZING", "IN_PROGRESS", "PAUSED", "FAILED"],
          },
        },
      });

      console.log(
        `Found ${expiredSessions.length} expired sessions to cleanup`
      );

      for (const session of expiredSessions) {
        try {
          await orchestrator.cleanupSession(session.id);

          // Update database status
          await prisma.researchSession.update({
            where: { id: session.id },
            data: {
              status: "FAILED",
              updatedAt: new Date(),
            },
          });

          console.log(`Cleaned up session: ${session.id}`);
        } catch (error) {
          console.error(`Failed to cleanup session ${session.id}:`, error);
        }
      }

      return { cleanedUp: expiredSessions.length };
    });
  }
);
