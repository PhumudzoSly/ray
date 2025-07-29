import { aiClient } from "../client";
import {
  ValidationScorecardOptionalDefaultsSchema,
  ValidationScoreBreakdownOptionalDefaultsSchema,
} from "@workspace/backend/prisma/generated/zod";
import { validationScorecardDB } from "../database";
import { researchUtils } from "../research";
import { z } from "zod";

// Modified schemas for AI client compatibility (excluding UUID and date fields)
const ValidationScorecardInputSchema =
  ValidationScorecardOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

const ValidationScoreBreakdownInputSchema =
  ValidationScoreBreakdownOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
  });

export interface CreateValidationScorecardParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
  existingData?: {
    competitiveLandscape?: any;
    competitors?: any[];
    customerNeeds?: any[];
    marketTrends?: any[];
    marketSignals?: any[];
    targetAudiences?: any[];
    validationInsights?: any[];
  };
}

export interface CreateValidationScorecardResult {
  success: boolean;
  validationScorecard?: any;
  scoreBreakdown?: any[];
  error?: string;
  researchData?: any;
}

export async function createValidationScorecard({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  existingData,
}: CreateValidationScorecardParams): Promise<CreateValidationScorecardResult> {
  try {
    console.log(`[Validation Scorecard] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if validation scorecard already exists
    const existingScorecard = await validationScorecardDB.get(researchId);
    if (existingScorecard) {
      console.log(
        `[Validation Scorecard] Found existing validation scorecard for research: ${researchId}`
      );
      return {
        success: true,
        validationScorecard: existingScorecard,
        scoreBreakdown: existingScorecard.scoreBreakdown || [],
      };
    }

    // Step 2: Research validation metrics and scoring
    console.log(
      `[Validation Scorecard] Researching validation metrics for: ${targetMarket}`
    );

    const validationMetricsQueries = [
      `${targetMarket} market validation metrics`,
      `${targetMarket} SaaS success factors`,
      `${targetMarket} startup validation criteria`,
      `${targetMarket} market opportunity assessment`,
      `${targetMarket} competitive analysis metrics`,
      `${targetMarket} technical feasibility assessment`,
      `${targetMarket} financial viability metrics`,
      `${targetMarket} risk assessment criteria`,
    ];

    const validationMetricsResearch = await researchUtils.multiQueryResearch(
      validationMetricsQueries,
      {
        maxResultsPerQuery: 3,
        includeContent: true,
      }
    );

    // Step 3: Generate comprehensive validation scorecard analysis
    console.log(
      `[Validation Scorecard] Generating validation scorecard analysis`
    );

    const validationScorecardAnalysisPrompt = `
You are a specialized validation scorecard expert for SaaS validation. Create a comprehensive validation scorecard for the following SaaS idea:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

EXISTING DATA:
${
  existingData
    ? `
Competitive Landscape: ${existingData.competitiveLandscape ? "Available" : "Not available"}
Competitors: ${existingData.competitors ? existingData.competitors.length : 0} found
Customer Needs: ${existingData.customerNeeds ? existingData.customerNeeds.length : 0} identified
Market Trends: ${existingData.marketTrends ? existingData.marketTrends.length : 0} analyzed
Market Signals: ${existingData.marketSignals ? existingData.marketSignals.length : 0} detected
Target Audiences: ${existingData.targetAudiences ? existingData.targetAudiences.length : 0} segments
Validation Insights: ${existingData.validationInsights ? existingData.validationInsights.length : 0} insights
`
    : "No existing data available"
}

RESEARCH DATA:
${validationMetricsResearch.results
  .map(
    (result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map((s) => s.url).join(", ")}
`
  )
  .join("\n")}

Create a comprehensive validation scorecard covering:

1. OVERALL SCORES: Market score, competitive score, technical score, financial score, risk score (all as numbers 0-100)
2. WEIGHTED COMPONENTS: Weight for each category (as numbers 0-1)
3. RECOMMENDATIONS: Primary recommendation and secondary recommendations (as arrays of strings)
4. RISK MITIGATION: Risk mitigation strategies (as array of strings)
5. NEXT STEPS: Recommended next steps (as string)
6. VALIDATION STATUS: Validation status (IN_PROGRESS, VALIDATED, NEEDS_IMPROVEMENT, FAILED, REQUIRES_REVIEW)

Be specific, data-driven, and provide actionable scoring based on the research data. Ensure enum values match the exact casing specified.
`;

    const validationScorecardAnalysisText = await aiClient.generateText(
      validationScorecardAnalysisPrompt,
      {
        temperature: 0.7,
        system: `You are a world-class SaaS validation expert with 15+ years of experience in analyzing and scoring SaaS ideas. Provide detailed, actionable scoring based on the research data and existing analysis.`,
      }
    );

    // Step 4: Generate structured validation scorecard data
    console.log(`[Validation Scorecard] Generating structured scorecard data`);

    const structuredScorecardPrompt = `
Based on the validation scorecard analysis below, extract and structure the scorecard information:

ANALYSIS:
${validationScorecardAnalysisText}

Extract the following information in a structured format:
- Overall scores for each category (as numbers 0-100)
- Weight for each category (as numbers 0-1)
- Primary recommendation (as string)
- Secondary recommendations (as array of strings)
- Risk mitigation strategies (as array of strings)
- Next steps (as string)
- Validation status (IN_PROGRESS, VALIDATED, NEEDS_IMPROVEMENT, FAILED, REQUIRES_REVIEW)

Provide specific, quantifiable data where possible. Ensure enum values match the exact casing specified.
`;

    const scorecardData = await aiClient.generateObject(
      ValidationScorecardInputSchema,
      structuredScorecardPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract scorecard information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing specified.`,
      }
    );

    // Step 5: Save validation scorecard to database
    console.log(`[Validation Scorecard] Saving scorecard to database`);

    const savedScorecard = await validationScorecardDB.save(
      scorecardData,
      researchId
    );

    // Step 6: Generate score breakdown
    console.log(`[Validation Scorecard] Generating score breakdown`);

    const scoreBreakdownPrompt = `
Based on the validation scorecard analysis, create detailed breakdown for each scoring category:

ANALYSIS:
${validationScorecardAnalysisText}

Create breakdown for each category (Market, Competitive, Technical, Financial, Risk) including:
- Category name
- Score (as number 0-100)
- Weight (as number 0-1)
- Weighted score (as number 0-100)
- Reasoning for the score
- Recommendations for improvement

Provide specific, actionable breakdown for each category.
`;

    const scoreBreakdownData = await aiClient.generateObject(
      z.array(ValidationScoreBreakdownInputSchema),
      scoreBreakdownPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract score breakdown information in the exact format specified by the schema. Be precise and accurate.`,
      }
    );

    // Step 7: Save score breakdown to database
    console.log(`[Validation Scorecard] Saving score breakdown to database`);

    const savedScoreBreakdown = [];
    for (const breakdownData of scoreBreakdownData) {
      const savedBreakdown = await validationScorecardDB.saveScoreBreakdown(
        breakdownData,
        savedScorecard.id
      );
      savedScoreBreakdown.push(savedBreakdown);
    }

    console.log(
      `[Validation Scorecard] Analysis completed successfully for idea: ${ideaId}`
    );

    return {
      success: true,
      validationScorecard: savedScorecard,
      scoreBreakdown: savedScoreBreakdown,
      researchData: validationMetricsResearch,
    };
  } catch (error) {
    console.error(`[Validation Scorecard] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
