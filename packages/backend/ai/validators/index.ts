import { generateObject } from "ai";
import { prisma } from "../../prisma/prisma";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
// Import new modular agents
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

  const { object: validationPrep } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: z.object({
      questionsRequired: z.boolean({
        description:
          "Do you have any questions you want to ask before proceeding with the validation process, based on what you know about this SaaS idea",
      }),
      requiredQuestions: z.array(
        z.object({
          question: z.string({ description: "The question to ask the user" }),
          importance: z.enum(["low", "medium", "important"]),
          context: z.string({
            description: "Brief explanation of why this information is needed",
          }),
        })
      ),
    }),
    prompt: `As an expert SaaS validator, analyze the following SaaS idea and determine if additional information is needed before proceeding with validation.

    IDEA DETAILS:
    ${JSON.parse(JSON.stringify(idea))}

    VALIDATION FRAMEWORK:
    ${SAAS_VALIDATION_PROMPT}

    ANALYSIS REQUIREMENTS:
    1. Thoroughly evaluate if the idea provides clear information about:
       - Core value proposition and unique selling points
       - Target market and ideal customer profile
       - Key problems being solved
       - Revenue model and pricing strategy
       - Technical feasibility and implementation approach
       - Competitive landscape and differentiation
       - Go-to-market strategy
       - Scalability potential

    2. Identify any critical gaps in information that could impact validation accuracy
    
    3. Consider industry-specific factors and regulatory requirements

    4. Assess whether the idea demonstrates:
       - Market viability
       - Technical feasibility
       - Business model sustainability
       - Competitive advantage
       - Growth potential

    RESPONSE FORMAT:
    {
        questionsRequired: true/false,
        requiredQuestions: [
            {
                question: "Specific, focused question addressing information gap",
                importance: "low/medium/important",
                context: "Brief explanation of why this information is needed"
            }
        ]
    }

    GUIDELINES:
    - Only request information that is truly missing and critical for validation
    - Prioritize questions based on their impact on validation accuracy
    - Frame questions to elicit specific, actionable responses
    - Avoid asking about information already provided
    - Consider both immediate validation needs and long-term success factors

    Return questionsRequired: false only if the idea is comprehensively detailed and ready for full validation.
    `,
  });

  return validationPrep;
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
