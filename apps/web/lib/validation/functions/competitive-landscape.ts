import { aiClient } from "../client";
import { CompetitiveLandscapeOptionalDefaultsSchema } from "@workspace/backend/prisma/generated/zod";
import { competitiveLandscapeDB } from "../database";
import { researchUtils } from "../research";

// Modified schema for AI client compatibility (excluding UUID and date fields)
const CompetitiveLandscapeInputSchema =
  CompetitiveLandscapeOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
  });

export interface AnalyzeCompetitiveLandscapeParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
}

export interface AnalyzeCompetitiveLandscapeResult {
  success: boolean;
  landscape?: any;
  error?: string;
}

export async function analyzeCompetitiveLandscape({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
}: AnalyzeCompetitiveLandscapeParams): Promise<AnalyzeCompetitiveLandscapeResult> {
  try {
    console.log(
      `[Competitive Landscape] Starting analysis for idea: ${ideaId}`
    );

    // Step 1: Check if competitive landscape already exists
    const existing = await competitiveLandscapeDB.exists(researchId);
    if (existing.exists) {
      console.log(`[Competitive Landscape] Already exists, skipping analysis`);
      return {
        success: true,
        landscape: existing.landscape,
      };
    }

    // Step 2: Get market research data
    console.log(`[Competitive Landscape] Fetching market research data`);
    const researchData = await researchUtils.getMarketResearch(researchId);
    if (!researchData) {
      throw new Error("Market research data not found");
    }

    // Step 3: Generate competitive landscape analysis
    console.log(`[Competitive Landscape] Generating analysis`);

    const analysisPrompt = `
Based on the following SaaS idea and market research, provide a comprehensive competitive landscape analysis:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

MARKET RESEARCH DATA:
- Market Size: ${researchData.marketSize}
- Market Growth Rate: ${researchData.marketGrowthRate}
- Key Trends: ${researchData.keyTrends}
- Emerging Technologies: ${researchData.emergingTechnologies}
- Regulatory Factors: ${researchData.regulatoryFactors}

Provide a comprehensive competitive landscape analysis covering:

1. COMPETITIVE INTENSITY: Assess the level of competition (LOW, MEDIUM, HIGH, VERY_HIGH)
2. MARKET POSITIONING: How companies position themselves in the market
3. DIFFERENTIATION OPPORTUNITIES: Areas where unique value can be created (as array of strings)
4. COMPETITIVE ADVANTAGE: Potential sources of competitive advantage
5. MARKET SHARE ANALYSIS: Total market share controlled by major players (as number), number of top competitors (as number)
6. MARKET CONCENTRATION: Market concentration measures (as number)
7. BARRIERS: Entry barriers, exit barriers (as arrays of strings), switching costs (as number)
8. THREATS: Emerging threats and potential market disruptions (as arrays of strings)

Be specific, data-driven, and provide actionable insights for competitive strategy.
`;

    const analysisText = await aiClient.generateText(analysisPrompt, {
      temperature: 0.7,
      system: `You are a world-class competitive landscape analyst with 15+ years of experience in SaaS market analysis. Provide detailed, actionable insights based on the research data provided.`,
    });

    // Step 4: Generate structured competitive landscape data
    console.log(`[Competitive Landscape] Generating structured data`);

    const structuredPrompt = `
Based on the competitive landscape analysis below, extract and structure the key information:

ANALYSIS:
${analysisText}

Extract the following information in a structured format:
- Competitive intensity level (LOW, MEDIUM, HIGH, VERY_HIGH)
- Market positioning strategies
- Differentiation opportunities (as array of strings)
- Competitive advantage sources
- Market share metrics (as numbers)
- Market concentration details (as number)
- Entry and exit barriers (as arrays of strings)
- Switching costs (as number)
- Emerging threats (as array of strings)
- Market disruptions (as array of strings)

Provide specific, quantifiable data where possible. Ensure all enum values match the exact casing specified.
`;

    const competitiveLandscapeData = await aiClient.generateObject(
      CompetitiveLandscapeInputSchema,
      structuredPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract only the requested information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing (LOW, MEDIUM, HIGH, VERY_HIGH).`,
      }
    );

    // Step 5: Save to database
    console.log(`[Competitive Landscape] Saving to database`);

    const savedLandscape = await competitiveLandscapeDB.save(
      competitiveLandscapeData,
      researchId
    );

    console.log(
      `[Competitive Landscape] Analysis completed successfully for idea: ${ideaId}`
    );

    return {
      success: true,
      landscape: savedLandscape,
    };
  } catch (error) {
    console.error(`[Competitive Landscape] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
