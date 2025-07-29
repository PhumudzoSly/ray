import { aiClient } from '../client';
import { ValidationInsightOptionalDefaultsSchema } from '@workspace/backend/prisma/generated/zod';
import { validationInsightsDB } from '../database';
import { researchUtils } from '../research';
import { z } from 'zod';

// Modified schema for AI client compatibility (excluding UUID and date fields)
const ValidationInsightInputSchema = ValidationInsightOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
});

export interface AnalyzeValidationInsightsParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
  maxInsights?: number;
}

export interface AnalyzeValidationInsightsResult {
  success: boolean;
  insights?: any[];
  error?: string;
  researchData?: any;
}

export async function analyzeValidationInsights({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  maxInsights = 5,
}: AnalyzeValidationInsightsParams): Promise<AnalyzeValidationInsightsResult> {
  try {
    console.log(`[Validation Insights] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if validation insights already exist
    const existingInsights = await validationInsightsDB.get(researchId);
    if (existingInsights.length > 0) {
      console.log(`[Validation Insights] Found ${existingInsights.length} existing insights for research: ${researchId}`);
      return {
        success: true,
        insights: existingInsights,
      };
    }

    // Step 2: Research validation insights in the target market
    console.log(`[Validation Insights] Researching validation insights for: ${targetMarket}`);
    
    const insightResearchQueries = [
      `${targetMarket} market validation`,
      `${targetMarket} idea validation`,
      `${targetMarket} market opportunity`,
      `${targetMarket} competitive threats`,
      `${targetMarket} technical challenges`,
    ];

    const insightResearch = await researchUtils.multiQueryResearch(insightResearchQueries, {
      maxResultsPerQuery: 3,
      includeContent: true,
    });

    // Step 3: Generate validation insights analysis
    console.log(`[Validation Insights] Generating insights analysis`);
    
    const insightsAnalysisPrompt = `
You are a specialized validation insights analyst for SaaS validation. Analyze the validation insights for the following SaaS idea:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

RESEARCH DATA:
${insightResearch.results.map((result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map(s => s.url).join(', ')}
`).join('\n')}

Identify the top ${maxInsights} most relevant validation insights and provide detailed analysis for each including:

1. INSIGHT IDENTIFICATION: Insight type (MARKET_OPPORTUNITY, COMPETITIVE_THREAT, CUSTOMER_INSIGHT, TECHNICAL_CHALLENGE, FINANCIAL_RISK, REGULATORY_IMPACT, TIMING_OPPORTUNITY) and title
2. DESCRIPTION: Detailed description of the insight
3. CONFIDENCE: Confidence level in the insight analysis (as number 0-100)
4. DATA SOURCES: Sources of data for this insight (as array of strings)
5. ANALYSIS METHOD: Method used for analysis
6. IMPACT LEVEL: Impact level (LOW, MEDIUM, HIGH, CRITICAL)
7. AFFECTED AREAS: Areas affected by this insight (as array of strings)
8. RECOMMENDATIONS: Recommendations based on this insight (as array of strings)
9. VERIFICATION: Verification status and method

Be specific, data-driven, and focus on actionable validation insights. Ensure enum values match the exact casing specified.
`;

    const insightsAnalysisText = await aiClient.generateText(insightsAnalysisPrompt, {
      temperature: 0.7,
      system: `You are a world-class validation insights analyst with 15+ years of experience in SaaS market analysis. Provide detailed, accurate insight analysis based on the research data.`,
    });

    // Step 4: Generate structured validation insights data
    console.log(`[Validation Insights] Generating structured insights data`);
    
    const structuredInsightsPrompt = `
Based on the validation insights analysis below, extract and structure the key information for each insight:

ANALYSIS:
${insightsAnalysisText}

Extract the following information for each insight in a structured format:
- Insight type (MARKET_OPPORTUNITY, COMPETITIVE_THREAT, CUSTOMER_INSIGHT, TECHNICAL_CHALLENGE, FINANCIAL_RISK, REGULATORY_IMPACT, TIMING_OPPORTUNITY)
- Title and description
- Confidence level (as number 0-100)
- Data sources (as array of strings)
- Analysis method
- Impact level (LOW, MEDIUM, HIGH, CRITICAL)
- Affected areas (as array of strings)
- Recommendations (as array of strings)
- Verification status and method

Provide specific, quantifiable data where possible. Ensure enum values match the exact casing specified.
`;

    const insightsData = await aiClient.generateObject(
      z.array(ValidationInsightInputSchema),
      structuredInsightsPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract only the requested information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing specified.`,
      }
    );

    // Step 5: Save validation insights to database
    console.log(`[Validation Insights] Saving insights to database`);
    
    const savedInsights = [];
    for (const insightData of insightsData) {
      const savedInsight = await validationInsightsDB.save(insightData, researchId);
      savedInsights.push(savedInsight);
    }

    console.log(`[Validation Insights] Analysis completed successfully for idea: ${ideaId}`);

    return {
      success: true,
      insights: savedInsights,
      researchData: insightResearch,
    };
  } catch (error) {
    console.error(`[Validation Insights] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 