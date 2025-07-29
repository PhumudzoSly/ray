import { aiClient } from "../client";
import {
  FinancialProjectionOptionalDefaultsSchema,
  FundingRoundOptionalDefaultsSchema,
} from "@workspace/backend/prisma/generated/zod";
import { financialProjectionDB } from "../database";
import { researchUtils } from "../research";
import { z } from "zod";

// Modified schemas for AI client compatibility (excluding UUID and date fields)
const FinancialProjectionInputSchema =
  FinancialProjectionOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
  });

const FundingRoundInputSchema = FundingRoundOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
});

export interface CreateFinancialProjectionParams {
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

export interface CreateFinancialProjectionResult {
  success: boolean;
  financialProjection?: any;
  fundingRounds?: any[];
  error?: string;
  researchData?: any;
}

export async function createFinancialProjection({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  existingData,
}: CreateFinancialProjectionParams): Promise<CreateFinancialProjectionResult> {
  try {
    console.log(`[Financial Projection] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if financial projection already exists
    const existingProjection = await financialProjectionDB.exists(researchId);
    if (existingProjection.exists) {
      console.log(
        `[Financial Projection] Found existing financial projection for research: ${researchId}`
      );
      return {
        success: true,
        financialProjection: existingProjection.projection,
        fundingRounds: existingProjection.projection?.fundingRounds || [],
      };
    }

    // Step 2: Research financial metrics and projections
    console.log(
      `[Financial Projection] Researching financial metrics for: ${targetMarket}`
    );

    const financialMetricsQueries = [
      `${targetMarket} financial projections`,
      `${targetMarket} revenue models`,
      `${targetMarket} pricing strategies`,
      `${targetMarket} cost structure`,
      `${targetMarket} unit economics`,
      `${targetMarket} funding requirements`,
      `${targetMarket} market size estimates`,
      `${targetMarket} growth projections`,
    ];

    const financialMetricsResearch = await researchUtils.multiQueryResearch(
      financialMetricsQueries,
      {
        maxResultsPerQuery: 3,
        includeContent: true,
      }
    );

    // Step 3: Generate comprehensive financial projection analysis
    console.log(
      `[Financial Projection] Generating financial projection analysis`
    );

    const financialProjectionAnalysisPrompt = `
You are a specialized financial projection expert for SaaS validation. Create a comprehensive financial projection for the following SaaS idea:

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
${financialMetricsResearch.results
  .map(
    (result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map((s) => s.url).join(", ")}
`
  )
  .join("\n")}

Create a comprehensive financial projection covering:

1. REVENUE PROJECTIONS: Projected revenue and revenue growth rate (as numbers)
2. BREAK-EVEN ANALYSIS: Break-even point in months (as number)
3. REVENUE MODEL: Revenue model description (as string)
4. PRICING STRATEGY: Pricing strategy description (as string)
5. COST STRUCTURE: Development costs, marketing costs, operational costs, customer acquisition cost (as numbers)
6. UNIT ECONOMICS: Average revenue per user, customer lifetime value, payback period (as numbers)
7. MARGIN ANALYSIS: Gross margin and net revenue retention (as numbers)
8. FUNDING NEEDS: Funding needed (as number)
9. USE OF FUNDS: How funds will be used (as string)
10. INVESTOR TYPES: Types of investors to approach (as string)
11. VALUATION: Valuation projections (as string)
12. RISK FACTORS: Risk factors (as array of strings)
13. MITIGATION STRATEGIES: Risk mitigation strategies (as array of strings)
14. SCENARIO ANALYSIS: Optimistic, realistic, and pessimistic scenarios (as numbers)
15. SENSITIVITY ANALYSIS: Sensitivity analysis description (as string)
16. CONTINGENCY PLANS: Contingency plans (as string)

Be specific, data-driven, and provide actionable financial projections based on the research data. Ensure all numeric values are provided as numbers, not strings.
`;

    const financialProjectionAnalysisText = await aiClient.generateText(
      financialProjectionAnalysisPrompt,
      {
        temperature: 0.7,
        system: `You are a world-class financial projection expert with 15+ years of experience in SaaS financial modeling. Provide detailed, actionable financial projections based on the research data and existing analysis.`,
      }
    );

    // Step 4: Generate structured financial projection data
    console.log(`[Financial Projection] Generating structured projection data`);

    const structuredProjectionPrompt = `
Based on the financial projection analysis below, extract and structure the projection information:

ANALYSIS:
${financialProjectionAnalysisText}

Extract the following information in a structured format:
- Revenue projections (as numbers)
- Break-even analysis (as number)
- Revenue model and pricing strategy (as strings)
- Cost structure (as numbers)
- Unit economics (as numbers)
- Margin analysis (as numbers)
- Funding needs and use of funds (as number and string)
- Investor types and valuation (as strings)
- Risk factors and mitigation strategies (as arrays of strings)
- Scenario analysis (as numbers)
- Sensitivity analysis and contingency plans (as strings)

Provide specific, quantifiable data where possible. Ensure all numeric values are provided as numbers, not strings.
`;

    const projectionData = await aiClient.generateObject(
      FinancialProjectionInputSchema,
      structuredProjectionPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract financial projection information in the exact format specified by the schema. Be precise and accurate with all numeric values.`,
      }
    );

    // Step 5: Save financial projection to database
    console.log(`[Financial Projection] Saving projection to database`);

    const savedProjection = await financialProjectionDB.save(
      projectionData,
      researchId
    );

    // Step 6: Generate funding rounds
    console.log(`[Financial Projection] Generating funding rounds`);

    const fundingRoundsPrompt = `
Based on the financial projection analysis, create funding round projections:

ANALYSIS:
${financialProjectionAnalysisText}

Create funding round projections including:
- Round name (as string)
- Amount needed (as number)
- Equity percentage (as number)
- Valuation (as number)
- Timeline in months (as number)
- Investor type (ANGEL, VENTURE_CAPITAL, PRIVATE_EQUITY, CORPORATE, CROWDFUNDING)
- Investor name (as string)
- Use of funds breakdown (as numbers)

Provide specific, actionable funding round projections.
`;

    const fundingRoundsData = await aiClient.generateObject(
      z.array(FundingRoundInputSchema),
      fundingRoundsPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract funding round information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing specified.`,
      }
    );

    // Step 7: Save funding rounds to database
    console.log(`[Financial Projection] Saving funding rounds to database`);

    const savedFundingRounds = [];
    for (const roundData of fundingRoundsData) {
      const savedRound = await financialProjectionDB.saveFundingRound(
        roundData,
        savedProjection.id
      );
      savedFundingRounds.push(savedRound);
    }

    console.log(
      `[Financial Projection] Analysis completed successfully for idea: ${ideaId}`
    );

    return {
      success: true,
      financialProjection: savedProjection,
      fundingRounds: savedFundingRounds,
      researchData: financialMetricsResearch,
    };
  } catch (error) {
    console.error(`[Financial Projection] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
