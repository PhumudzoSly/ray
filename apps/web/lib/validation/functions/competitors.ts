import { aiClient } from "../client";
import {
  CompetitorOptionalDefaultsSchema,
  CompetitorPricingOptionalDefaultsSchema,
  CompetitiveMoveOptionalDefaultsSchema,
  FeatureComparisonOptionalDefaultsSchema,
} from "@workspace/backend/prisma/generated/zod";
import { competitorDB } from "../database";
import { researchUtils } from "../research";
import { z } from "zod";

// Modified schemas for AI client compatibility (excluding UUID and date fields)
const CompetitorInputSchema = CompetitorOptionalDefaultsSchema.omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

const CompetitorPricingInputSchema =
  CompetitorPricingOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
  });

const CompetitiveMoveInputSchema = CompetitiveMoveOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
});

const FeatureComparisonInputSchema =
  FeatureComparisonOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
  });

export interface AnalyzeCompetitorsParams {
  ideaId: string;
  researchId: string;
  competitiveLandscapeId: string;
  ideaDescription: string;
  targetMarket: string;
  maxCompetitors?: number;
}

export interface AnalyzeCompetitorsResult {
  success: boolean;
  competitors?: any[];
  competitiveMoves?: any[];
  error?: string;
  researchData?: any;
}

export async function analyzeCompetitors({
  ideaId,
  researchId,
  competitiveLandscapeId,
  ideaDescription,
  targetMarket,
  maxCompetitors = 5,
}: AnalyzeCompetitorsParams): Promise<AnalyzeCompetitorsResult> {
  try {
    console.log(`[Competitors] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if competitors already exist
    const existingCompetitors = await competitorDB.getByLandscape(
      competitiveLandscapeId
    );
    if (existingCompetitors.length > 0) {
      console.log(
        `[Competitors] Found ${existingCompetitors.length} existing competitors for landscape: ${competitiveLandscapeId}`
      );
      return {
        success: true,
        competitors: existingCompetitors,
      };
    }

    // Step 2: Research competitors in the target market
    console.log(`[Competitors] Researching competitors for: ${targetMarket}`);

    const competitorResearchQueries = [
      `${targetMarket} top competitors`,
      `${targetMarket} leading companies`,
      `${targetMarket} SaaS competitors`,
      `${targetMarket} market leaders`,
      `${targetMarket} alternative solutions`,
    ];

    const competitorResearch = await researchUtils.multiQueryResearch(
      competitorResearchQueries,
      {
        maxResultsPerQuery: 3,
        includeContent: true,
      }
    );

    // Step 3: Generate competitor list and analysis
    console.log(`[Competitors] Generating competitor analysis`);

    const competitorAnalysisPrompt = `
You are a specialized competitor research expert for SaaS validation. Analyze the competitive landscape and identify the top competitors for the following SaaS idea:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

RESEARCH DATA:
${competitorResearch.results
  .map(
    (result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map((s) => s.url).join(", ")}
`
  )
  .join("\n")}

Identify the top ${maxCompetitors} most relevant competitors and provide detailed analysis for each including:

1. BASIC INFORMATION: Name, website, description, logo URL
2. MARKET POSITION: Market share (as number), annual revenue (as number), funding raised (as number), employee count (as number), founded year (as number), headquarters
3. PERFORMANCE METRICS: User growth rate (as number), churn rate (as number), customer satisfaction (as number), market cap (as number)
4. PRODUCT ANALYSIS: Product features (as array of strings), pricing model (SUBSCRIPTION, FREEMIUM, ONE_TIME, USAGE_BASED, HYBRID), target audience, tech stack (as array of strings), integrations (as array of strings)
5. SWOT ANALYSIS: Strengths, weaknesses, opportunities, threats (all as arrays of strings)
6. COMPETITIVE POSITION: Competitive advantage, threat level (LOW, MEDIUM, HIGH, CRITICAL), competitive position (MARKET_LEADER, STRONG_CHALLENGER, WEAK_CHALLENGER, NICHE_PLAYER, NEW_ENTRANT)

Be specific, data-driven, and focus on actionable competitive intelligence. Ensure enum values match the exact casing specified.
`;

    const competitorAnalysisText = await aiClient.generateText(
      competitorAnalysisPrompt,
      {
        temperature: 0.7,
        system: `You are a world-class competitor intelligence analyst with 15+ years of experience in SaaS market analysis. Provide detailed, accurate competitor profiles based on the research data.`,
      }
    );

    // Step 4: Generate structured competitor data
    console.log(`[Competitors] Generating structured competitor data`);

    const structuredCompetitorPrompt = `
Based on the competitor analysis below, extract and structure the key information for each competitor:

ANALYSIS:
${competitorAnalysisText}

Extract the following information for each competitor in a structured format:
- Basic information (name, website, description, logo URL)
- Market position metrics (as numbers where applicable)
- Performance metrics (as numbers where applicable)
- Product analysis (with proper enum values for pricing model)
- SWOT analysis (as arrays of strings)
- Competitive position (with proper enum values)

Provide specific, quantifiable data where possible. Ensure enum values match the exact casing specified.
`;

    const competitorsData = await aiClient.generateObject(
      z.array(CompetitorInputSchema),
      structuredCompetitorPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract only the requested information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing specified.`,
      }
    );

    // Step 5: Save competitors to database
    console.log(`[Competitors] Saving competitors to database`);

    const savedCompetitors = [];
    for (const competitorData of competitorsData) {
      const savedCompetitor = await competitorDB.save(
        competitorData,
        competitiveLandscapeId
      );
      savedCompetitors.push(savedCompetitor);
    }

    console.log(
      `[Competitors] Analysis completed successfully for idea: ${ideaId}`
    );

    return {
      success: true,
      competitors: savedCompetitors,
      researchData: competitorResearch,
    };
  } catch (error) {
    console.error(`[Competitors] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
