import { aiClient } from "../client";
import { MarketTrendOptionalDefaultsSchema } from "@workspace/backend/prisma/generated/zod";
import { marketTrendsDB } from "../database";
import { researchUtils } from "../research";
import { z } from "zod";

// Modified schema for AI client compatibility (excluding UUID and date fields)
const MarketTrendInputSchema = MarketTrendOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
});

export interface AnalyzeMarketTrendsParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
  maxTrends?: number;
}

export interface AnalyzeMarketTrendsResult {
  success: boolean;
  trends?: any[];
  error?: string;
  researchData?: any;
}

export async function analyzeMarketTrends({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  maxTrends = 5,
}: AnalyzeMarketTrendsParams): Promise<AnalyzeMarketTrendsResult> {
  try {
    console.log(`[Market Trends] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if market trends already exist
    const existingTrends = await marketTrendsDB.get(researchId);
    if (existingTrends.length > 0) {
      console.log(
        `[Market Trends] Found ${existingTrends.length} existing trends for research: ${researchId}`
      );
      return {
        success: true,
        trends: existingTrends,
      };
    }

    // Step 2: Research market trends in the target market
    console.log(`[Market Trends] Researching trends for: ${targetMarket}`);

    const trendResearchQueries = [
      `${targetMarket} market trends 2024`,
      `${targetMarket} industry trends`,
      `${targetMarket} technology trends`,
      `${targetMarket} market growth trends`,
      `${targetMarket} emerging trends`,
    ];

    const trendResearch = await researchUtils.multiQueryResearch(
      trendResearchQueries,
      {
        maxResultsPerQuery: 3,
        includeContent: true,
      }
    );

    // Step 3: Generate market trends analysis
    console.log(`[Market Trends] Generating trends analysis`);

    const trendsAnalysisPrompt = `
You are a specialized market trends analyst for SaaS validation. Analyze the market trends for the following SaaS idea:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

RESEARCH DATA:
${trendResearch.results
  .map(
    (result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map((s) => s.url).join(", ")}
`
  )
  .join("\n")}

Identify the top ${maxTrends} most relevant market trends and provide detailed analysis for each including:

1. TREND IDENTIFICATION: Trend name and description
2. IMPACT ASSESSMENT: Impact level (LOW, MEDIUM, HIGH, CRITICAL)
3. GROWTH METRICS: Growth rate, market size, adoption rate (as strings)
4. ANALYSIS: Key drivers, challenges, opportunities (as strings)
5. DATA SOURCES: Sources of trend data
6. CONFIDENCE: Confidence level in the trend analysis (as number 0-100)

Be specific, data-driven, and focus on actionable market intelligence. Ensure enum values match the exact casing specified.
`;

    const trendsAnalysisText = await aiClient.generateText(
      trendsAnalysisPrompt,
      {
        temperature: 0.7,
        system: `You are a world-class market trends analyst with 15+ years of experience in SaaS market analysis. Provide detailed, accurate trend analysis based on the research data.`,
      }
    );

    // Step 4: Generate structured market trends data
    console.log(`[Market Trends] Generating structured trends data`);

    const structuredTrendsPrompt = `
Based on the market trends analysis below, extract and structure the key information for each trend:

ANALYSIS:
${trendsAnalysisText}

Extract the following information for each trend in a structured format:
- Trend name and description
- Impact level (LOW, MEDIUM, HIGH, CRITICAL)
- Growth metrics (as strings)
- Analysis components (as strings)
- Data sources
- Confidence level (as number 0-100)

Provide specific, quantifiable data where possible. Ensure enum values match the exact casing specified.
`;

    const trendsData = await aiClient.generateObject(
      z.array(MarketTrendInputSchema),
      structuredTrendsPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract only the requested information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing specified.`,
      }
    );

    // Step 5: Save market trends to database
    console.log(`[Market Trends] Saving trends to database`);

    const savedTrends = [];
    for (const trendData of trendsData) {
      const savedTrend = await marketTrendsDB.save(trendData, researchId);
      savedTrends.push(savedTrend);
    }

    console.log(
      `[Market Trends] Analysis completed successfully for idea: ${ideaId}`
    );

    return {
      success: true,
      trends: savedTrends,
      researchData: trendResearch,
    };
  } catch (error) {
    console.error(`[Market Trends] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
