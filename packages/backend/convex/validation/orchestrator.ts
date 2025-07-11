import { v } from "convex/values";
import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { ConvexSession } from "../betterAuth";
import { Id } from "../_generated/dataModel";

// Type definitions for validation results
type MarketSizeResult = {
  score: number;
  analysis: string;
  potential: string;
  marketSizeUSD?: number;
  growthRate?: number;
  targetSegments?: string[];
};

type CompetitorAnalysisResult = {
  score: number;
  competitors: string[];
  differentiators: string[];
  analysis: string;
  competitiveAdvantage?: string;
};

type CustomerFitResult = {
  score: number;
  painPoints: string[];
  willingness: string;
  analysis: string;
  customerAcquisitionCost?: number;
};

type FeasibilityResult = {
  score: number;
  technicalChallenges: string[];
  timeToMarket: string;
  analysis: string;
  riskFactors?: string[];
};

type FinancialsResult = {
  score: number;
  analysis: string;
  estimatedRevenue: {
    year1: number;
    year2: number;
    year3: number;
  };
  estimatedCosts: {
    year1: number;
    year2: number;
    year3: number;
  };
  breakEvenPoint: string;
  fundingRequirements?: number;
};

type UserStoryResult = {
  persona: string;
  story: string;
  acceptanceCriteria: string[];
};

type KeyFindingResult = {
  content: string;
  importance: "low" | "medium" | "high";
  category: "market" | "competition" | "technical" | "financial" | "customer";
  order: number;
};

type NextStepResult = {
  content: string;
  priority: "low" | "medium" | "high";
  category:
    | "research"
    | "development"
    | "marketing"
    | "validation"
    | "planning";
  order: number;
};

type AdopterProfileResult = {
  name: string;
  description: string;
  techSavviness: "low" | "medium" | "high";
  innovativeness: "low" | "medium" | "high";
  riskTolerance: "low" | "medium" | "high";
  socialInfluence: "low" | "medium" | "high";
  needRecognition: "low" | "medium" | "high";
  financialResources: "limited" | "moderate" | "substantial";
  channelsWhereToFind?: string;
  problemSolvingMotivation?: string;
  statusSeekingMotivation?: string;
  location?: string;
  industry?: string;
};

type CompetitorResult = {
  name: string;
  description: string;
  industry?: string;
  location?: string;
  website?: string;
  revenue?: number;
  marketShare?: number;
};

type SwotAnalysisResult = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

type ValidationResults = {
  marketSize: MarketSizeResult;
  competitorAnalysis: CompetitorAnalysisResult;
  customerFit: CustomerFitResult;
  feasibility: FeasibilityResult;
  financials: FinancialsResult;
  userStories: UserStoryResult[];
  keyFindings: KeyFindingResult[];
  nextSteps: NextStepResult[];
  adopterProfiles: AdopterProfileResult[];
  competitors: CompetitorResult[];
  swotAnalysis: SwotAnalysisResult;
  overallScore: number;
  recommendation: string;
};

export const validateIdea = action({
  args: {
    token: v.string(),
    ideaId: v.id("idea"),
    idea: v.object({
      name: v.string(),
      description: v.string(),
      industry: v.string(),
      problemSolved: v.optional(v.string()),
      solutionOffered: v.optional(v.string()),
      internal: v.optional(v.boolean()),
      openSource: v.optional(v.boolean()),
    }),
  },
  handler: async (
    ctx,
    { token, ideaId, idea }
  ): Promise<{
    success: boolean;
    results: ValidationResults;
    ideaId: Id<"idea">;
  }> => {
    // Verify authentication
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Verify idea ownership
    const ideaRecord = await ctx.runQuery(api.idea.getSingleIdea, {
      id: ideaId,
      token,
    });

    if (!ideaRecord) {
      throw new Error("Idea not found");
    }

    try {
      console.log(`[Validation] Starting validation for idea: ${idea.name}`);

      // Step 1: Market Size Analysis
      console.log(`[Validation] Step 1: Market Size Analysis`);
      const marketSize: MarketSizeResult = await ctx.runAction(
        api.validation.marketSize.validateMarketSize,
        {
          idea,
        }
      );

      // Step 2: Competitor Analysis (with market context)
      console.log(`[Validation] Step 2: Competitor Analysis`);
      const competitorAnalysis: CompetitorAnalysisResult = await ctx.runAction(
        api.validation.competitorAnalysis.validateCompetitorAnalysis,
        {
          idea,
          marketSizeData: marketSize,
        }
      );

      // Step 3: Customer Fit Analysis (with previous context)
      console.log(`[Validation] Step 3: Customer Fit Analysis`);
      const customerFit: CustomerFitResult = await ctx.runAction(
        api.validation.customerFit.validateCustomerFit,
        {
          idea,
          previousData: {
            marketSize,
            competitorAnalysis,
          },
        }
      );

      // Step 4: Feasibility Analysis (with all previous context)
      console.log(`[Validation] Step 4: Feasibility Analysis`);
      const feasibility: FeasibilityResult = await ctx.runAction(
        api.validation.feasibility.validateFeasibility,
        {
          idea,
          previousData: {
            marketSize,
            competitorAnalysis,
            customerFit,
          },
        }
      );

      // Step 5: Financial Analysis (with comprehensive context)
      console.log(`[Validation] Step 5: Financial Analysis`);
      const financials: FinancialsResult = await ctx.runAction(
        api.validation.financials.validateFinancials,
        {
          idea,
          previousData: {
            marketSize,
            competitorAnalysis,
            customerFit,
            feasibility,
          },
        }
      );

      // Step 6: Generate User Stories (with customer insights)
      console.log(`[Validation] Step 6: User Stories Generation`);
      const userStories: UserStoryResult[] = await ctx.runAction(
        api.validation.additionalValidations.generateUserStories,
        {
          idea,
          validationData: {
            customerFit: {
              painPoints: customerFit.painPoints,
              willingness: customerFit.willingness,
            },
          },
        }
      );

      // Step 7: Generate Key Findings (with all scores)
      console.log(`[Validation] Step 7: Key Findings Generation`);
      const keyFindings: KeyFindingResult[] = await ctx.runAction(
        api.validation.additionalValidations.generateKeyFindings,
        {
          idea,
          allValidationData: {
            marketSize: { score: marketSize.score },
            competitorAnalysis: { score: competitorAnalysis.score },
            customerFit: { score: customerFit.score },
            feasibility: { score: feasibility.score },
            financials: { score: financials.score },
          },
        }
      );

      // Step 8: Generate Next Steps
      console.log(`[Validation] Step 8: Next Steps Generation`);
      const nextSteps: NextStepResult[] = await ctx.runAction(
        api.validation.additionalValidations.generateNextSteps,
        {
          idea,
        }
      );

      // Step 9: Generate Adopter Profiles
      console.log(`[Validation] Step 9: Adopter Profiles Generation`);
      const adopterProfiles: AdopterProfileResult[] = await ctx.runAction(
        api.validation.additionalValidations.generateAdopterProfiles,
        {
          idea,
        }
      );

      // Step 10: Generate Competitor Details
      console.log(`[Validation] Step 10: Competitor Details Generation`);
      const competitors: CompetitorResult[] = await ctx.runAction(
        api.validation.additionalValidations.generateCompetitorDetails,
        {
          idea,
        }
      );

      // Step 11: Generate SWOT Analysis
      console.log(`[Validation] Step 11: SWOT Analysis Generation`);
      const swotAnalysis: SwotAnalysisResult = await ctx.runAction(
        api.validation.additionalValidations.generateSwotAnalysis,
        {
          idea,
        }
      );

      // Calculate overall score
      const componentScores = [
        marketSize.score,
        competitorAnalysis.score,
        customerFit.score,
        feasibility.score,
        financials.score,
      ];

      const overallScore = Math.round(
        componentScores.reduce((sum, score) => sum + score, 0) /
          componentScores.length
      );

      // Generate overall recommendation
      let recommendation: string;
      if (overallScore >= 80) {
        recommendation =
          "Strongly recommended: This idea shows excellent potential across all key areas.";
      } else if (overallScore >= 65) {
        recommendation =
          "Recommended with conditions: This idea has good potential but requires attention to identified weaknesses.";
      } else if (overallScore >= 50) {
        recommendation =
          "Proceed with caution: This idea has moderate potential but faces significant challenges.";
      } else {
        recommendation =
          "Not recommended: This idea faces substantial challenges that may make it unviable.";
      }

      console.log(`[Validation] Overall Score: ${overallScore}/100`);

      // Compile complete validation results
      const validationResults: ValidationResults = {
        marketSize,
        competitorAnalysis,
        customerFit,
        feasibility,
        financials,
        userStories,
        keyFindings,
        nextSteps,
        adopterProfiles,
        competitors,
        swotAnalysis,
        overallScore,
        recommendation,
      };

      // Store validation results in the database
      console.log(`[Validation] Storing validation results in database`);
      await ctx.runMutation(api.idea.updateValidation, {
        token,
        id: ideaId,
        validationResults,
      });

      // Update idea status to validated
      await ctx.runMutation(api.idea.changeStatus, {
        token,
        status: "VALIDATED",
        id: ideaId,
      });

      console.log(
        `[Validation] Validation completed successfully for idea: ${idea.name}`
      );

      return {
        success: true,
        results: validationResults,
        ideaId,
      };
    } catch (error) {
      console.error(`[Validation] Error validating idea ${idea.name}:`, error);

      // Update idea status to failed validation
      try {
        await ctx.runMutation(api.idea.changeStatus, {
          token,
          status: "INVALIDATED",
          id: ideaId,
        });
      } catch (statusError) {
        console.error(
          `[Validation] Failed to update idea status:`,
          statusError
        );
      }

      throw new Error(
        `Failed to validate idea: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
