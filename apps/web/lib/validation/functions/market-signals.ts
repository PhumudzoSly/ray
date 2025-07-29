import { aiClient } from "../client";
import { MarketSignalOptionalDefaultsSchema } from "@workspace/backend/prisma/generated/zod";
import { marketSignalsDB } from "../database";
import { researchUtils } from "../research";
import { z } from "zod";

// Modified schema for AI client compatibility (excluding UUID and date fields)
const MarketSignalInputSchema = MarketSignalOptionalDefaultsSchema.omit({
  id: true,
  lastChecked: true,
  createdAt: true,
});

export interface AnalyzeMarketSignalsParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
  maxSignals?: number;
}

export interface AnalyzeMarketSignalsResult {
  success: boolean;
  signals?: any[];
  error?: string;
  researchData?: any;
}

export async function analyzeMarketSignals({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  maxSignals = 5,
}: AnalyzeMarketSignalsParams): Promise<AnalyzeMarketSignalsResult> {
  try {
    console.log(`[Market Signals] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if market signals already exist
    const existingSignals = await marketSignalsDB.get(researchId);
    if (existingSignals.length > 0) {
      console.log(
        `[Market Signals] Found ${existingSignals.length} existing signals for research: ${researchId}`
      );
      return {
        success: true,
        signals: existingSignals,
      };
    }

    // Step 2: Research market signals in the target market
    console.log(
      `[Market Signals] Researching market signals for: ${targetMarket}`
    );

    const signalResearchQueries = [
      `${targetMarket} market signals`,
      `${targetMarket} industry news`,
      `${targetMarket} market changes`,
      `${targetMarket} competitive moves`,
      `${targetMarket} market trends`,
    ];

    const signalResearch = await researchUtils.multiQueryResearch(
      signalResearchQueries,
      {
        maxResultsPerQuery: 3,
        includeContent: true,
      }
    );

    // Step 3: Generate market signals analysis
    console.log(`[Market Signals] Generating signals analysis`);

    const signalsAnalysisPrompt = `
You are a specialized market signals analyst for SaaS validation. Analyze the market signals for the following SaaS idea:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

RESEARCH DATA:
${signalResearch.results
  .map(
    (result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map((s) => s.url).join(", ")}
`
  )
  .join("\n")}

Identify the top ${maxSignals} most relevant market signals and provide detailed analysis for each including:

1. SIGNAL IDENTIFICATION: Signal type (FUNDING_ANNOUNCEMENT, PRODUCT_LAUNCH, PARTNERSHIP, ACQUISITION, REGULATORY_CHANGE, TECHNOLOGY_BREAKTHROUGH, MARKET_TREND, COMPETITIVE_MOVE) and title
2. DESCRIPTION: Detailed description of the signal
3. SOURCE: Source of the signal information
4. STRENGTH ASSESSMENT: Signal strength (WEAK, MODERATE, STRONG, CRITICAL)
5. CONFIDENCE: Confidence level in the signal analysis (as number 0-100)
6. TREND DIRECTION: Trend direction (INCREASING, DECREASING, STABLE, VOLATILE)
7. IMPACT ANALYSIS: Market impact and competitive impact (as strings)
8. TIMING: Immediate, medium-term, and long-term impact timing (as strings)
9. URGENCY: Urgency level (LOW, MEDIUM, HIGH, CRITICAL)
10. MONITORING: Monitoring status (ACTIVE, PASSIVE, NONE)
11. RESPONSE: Whether response is required (as boolean)

Be specific, data-driven, and focus on actionable market intelligence. Ensure enum values match the exact casing specified.
`;

    const signalsAnalysisText = await aiClient.generateText(
      signalsAnalysisPrompt,
      {
        temperature: 0.7,
        system: `You are a world-class market signals analyst with 15+ years of experience in SaaS market analysis. Provide detailed, accurate signal analysis based on the research data.`,
      }
    );

    // Step 4: Generate structured market signals data
    console.log(`[Market Signals] Generating structured signals data`);

    const structuredSignalsPrompt = `
Based on the market signals analysis below, extract and structure the key information for each signal:

ANALYSIS:
${signalsAnalysisText}

Extract the following information for each signal in a structured format:
- Signal type (FUNDING_ANNOUNCEMENT, PRODUCT_LAUNCH, PARTNERSHIP, ACQUISITION, REGULATORY_CHANGE, TECHNOLOGY_BREAKTHROUGH, MARKET_TREND, COMPETITIVE_MOVE)
- Title and description
- Source
- Signal strength (WEAK, MODERATE, STRONG, CRITICAL)
- Confidence level (as number 0-100)
- Trend direction (INCREASING, DECREASING, STABLE, VOLATILE)
- Impact analysis (as strings)
- Timing analysis (as strings)
- Urgency level (LOW, MEDIUM, HIGH, CRITICAL)
- Monitoring status (ACTIVE, PASSIVE, NONE)
- Response required (as boolean)

Provide specific, quantifiable data where possible. Ensure enum values match the exact casing specified.
`;

    const signalsData = await aiClient.generateObject(
      z.array(MarketSignalInputSchema),
      structuredSignalsPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract only the requested information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing specified.`,
      }
    );

    // Step 5: Save market signals to database
    console.log(`[Market Signals] Saving signals to database`);

    const savedSignals = [];
    for (const signalData of signalsData) {
      const savedSignal = await marketSignalsDB.save(signalData, researchId);
      savedSignals.push(savedSignal);
    }

    console.log(
      `[Market Signals] Analysis completed successfully for idea: ${ideaId}`
    );

    return {
      success: true,
      signals: savedSignals,
      researchData: signalResearch,
    };
  } catch (error) {
    console.error(`[Market Signals] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
