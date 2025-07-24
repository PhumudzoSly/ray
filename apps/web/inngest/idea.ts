import { inngestClient } from "@/lib/inngest";
import { prisma } from "@workspace/backend/prisma/prisma";

export const validateIdea = inngestClient.createFunction(
  { name: "Validate Idea", id: "validate-idea" },
  { event: "idea/validate" },
  async ({ event, step }: { event: any; step: any }) => {
    const { ideaId, additionalContext } = event.data;

    // Step 1: Fetch idea data
    const idea = await step.run("fetch-idea", async () => {
      const ideaData = await prisma.idea.findUnique({
        where: { id: ideaId },
        include: { organization: true },
      });
      if (!ideaData) throw new Error("Idea not found");
      return ideaData;
    });

    // Step 2: Run AI validation analysis with sequential data flow
    const validationResults = await step.run("run-ai-validation", async () => {
      try {
        const { runModularResearch } = await import(
          "@workspace/backend/ai/agents/research-orchestrator"
        );

        // Pass additional context from pre-validation questions if available
        const researchResult = await runModularResearch(
          ideaId,
          additionalContext
        );

        // Extract scorecard data for validation score
        const scorecardAgent = researchResult.researchResults.agents.find(
          (a: any) => a.type === "validation-scorecard"
        );

        const overallScore = scorecardAgent?.data?.overallScore || 0;
        const validationStatus =
          scorecardAgent?.data?.validationStatus || "NEEDS_VALIDATION";

        return {
          overallScore,
          validationStatus,
          recommendation:
            scorecardAgent?.data?.strategicRecommendations?.primary?.[0] ||
            "Validation completed successfully.",
          marketSize: "Market analysis completed with sequential data flow",
          competitorAnalysis:
            "Competitive landscape analyzed with enhanced context",
          customerFit:
            "Customer segments identified with SaaS-specific insights",
          feasibility:
            "Technical assessment completed with comprehensive analysis",
          financials:
            "Financial projections generated with unit economics focus",
          userStories: scorecardAgent?.data?.saasMetrics || {},
          researchResults: researchResult.researchResults,
          totalApiCalls: researchResult.totalApiCalls,
        };
      } catch (error) {
        console.error("AI validation failed:", error);
        return {
          overallScore: 0,
          validationStatus: "FAILED",
          recommendation:
            "Validation failed due to technical issues. Please try again.",
          marketSize: "Market analysis failed",
          competitorAnalysis: "Competitive analysis failed",
          customerFit: "Customer analysis failed",
          feasibility: "Technical analysis failed",
          financials: "Financial analysis failed",
          userStories: [],
          researchResults: null,
          totalApiCalls: 0,
        };
      }
    });

    // Step 3: Update idea with validation results
    const updatedIdea = await step.run("update-idea", async () => {
      const updateData: any = {};

      // Only update score if validation was successful
      if (validationResults.overallScore > 0) {
        updateData.aiOverallValidation = validationResults.overallScore;
      }

      // Update status based on validation results
      if (validationResults.validationStatus === "VALIDATED") {
        updateData.status = "VALIDATED";
      } else if (validationResults.validationStatus === "FAILED") {
        updateData.status = "INVALIDATED";
      }

      return await prisma.idea.update({
        where: { id: ideaId },
        data: updateData,
      });
    });

    return {
      success: true,
      ideaId,
      validationResults,
      updatedIdea,
    };
  }
);
