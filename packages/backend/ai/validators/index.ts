import { generateObject } from "ai";
import { prisma } from "../../prisma/prisma";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import {
  runModularResearch,
  ResearchResults,
} from "../agents/research-orchestrator";

// ============================================================================
// RESEARCH SYSTEM SELECTOR (MAIN ENTRY POINT)
// ============================================================================

export const runResearch = async (
  ideaId: string,
  additionalContext?: any
): Promise<ResearchResults> => {
  try {
    console.log("🚀 Starting modular research for idea:", ideaId);
    const result = await runModularResearch(ideaId, additionalContext);
    return result.researchResults;
  } catch (error) {
    console.error("❌ Research generation failed:", error);
    throw error;
  }
};

// ============================================================================
// VALIDATION QUESTION GENERATOR
// ============================================================================

export const suggestQuestions = async (id: string) => {
  const idea = await prisma.idea.findUnique({ where: { id } });

  if (!idea) throw new Error("Idea does not exist");

  try {
    const { object: validationPrep } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        questionsRequired: z
          .boolean()
          .describe("Whether the idea needs more information"),
        requiredQuestions: z.array(
          z.object({
            question: z.string().describe("The question to ask the user"),
            importance: z
              .enum(["low", "medium", "important"])
              .describe("The importance of the question"),
            context: z.string().describe("The context of the question"),
          })
        ),
      }),
      prompt: `You are an expert SaaS validator. Analyze this SaaS idea and determine if additional information is needed before validation.

IDEA: ${idea.name}
DESCRIPTION: ${idea.description || "No description provided"}
INDUSTRY: ${idea.industry || "Not specified"}
PROBLEM SOLVED: ${idea.problemSolved || "Not specified"}
SOLUTION: ${idea.solutionOffered || "Not specified"}

Check if the idea has clear information about:
- Target market and customer profile
- Revenue model and pricing
- Technical approach
- Competitive differentiation
- Go-to-market strategy

If critical information is missing, return questionsRequired: true with specific questions.
If the idea is well-defined, return questionsRequired: false with empty requiredQuestions array.

IMPORTANT: Return a valid JSON object, not a string. The response should be structured data, not text.
`,
    });

    return validationPrep;
  } catch (error) {
    console.error("Error in suggestQuestions:", error);
    throw new Error("Idea not found");
  }
};

// ============================================================================
// EXPORT ALL FUNCTIONS FOR WEB APP USAGE
// ============================================================================

// Main research function
export { runModularResearch } from "../agents/research-orchestrator";

// Individual agent functions for direct access if needed
export { generateMarketSizeData } from "../agents/market-size-agent";
export { generateCompetitorData } from "../agents/competitor-discovery-agent";
export { generateCustomerSegmentsData } from "../agents/customer-segments-agent";
export { generateTechnologyTrendsData } from "../agents/technology-trends-agent";
export { generateValidationScorecard } from "../agents/validation-scorecard-agent";
