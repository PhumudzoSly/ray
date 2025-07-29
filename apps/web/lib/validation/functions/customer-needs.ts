import { aiClient } from "../client";
import { CustomerNeedOptionalDefaultsSchema } from "@workspace/backend/prisma/generated/zod";
import { customerNeedsDB } from "../database";
import { researchUtils } from "../research";
import { z } from "zod";

// Modified schema for AI client compatibility (excluding UUID and date fields)
const CustomerNeedInputSchema = CustomerNeedOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
});

export interface AnalyzeCustomerNeedsParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
  maxNeeds?: number;
}

export interface AnalyzeCustomerNeedsResult {
  success: boolean;
  needs?: any[];
  error?: string;
  researchData?: any;
}

export async function analyzeCustomerNeeds({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  maxNeeds = 8,
}: AnalyzeCustomerNeedsParams): Promise<AnalyzeCustomerNeedsResult> {
  try {
    console.log(`[Customer Needs] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if customer needs already exist
    const existingNeeds = await customerNeedsDB.get(researchId);
    if (existingNeeds.length > 0) {
      console.log(
        `[Customer Needs] Found ${existingNeeds.length} existing needs for research: ${researchId}`
      );
      return {
        success: true,
        needs: existingNeeds,
      };
    }

    // Step 2: Research customer needs in the target market
    console.log(
      `[Customer Needs] Researching customer needs for: ${targetMarket}`
    );

    const needsResearchQueries = [
      `${targetMarket} customer pain points`,
      `${targetMarket} user needs`,
      `${targetMarket} customer problems`,
      `${targetMarket} user frustrations`,
      `${targetMarket} customer requirements`,
    ];

    const needsResearch = await researchUtils.multiQueryResearch(
      needsResearchQueries,
      {
        maxResultsPerQuery: 3,
        includeContent: true,
      }
    );

    // Step 3: Generate customer needs analysis
    console.log(`[Customer Needs] Generating needs analysis`);

    const needsAnalysisPrompt = `
You are a specialized customer needs analyst for SaaS validation. Analyze the customer needs for the following SaaS idea:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

RESEARCH DATA:
${needsResearch.results
  .map(
    (result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map((s) => s.url).join(", ")}
`
  )
  .join("\n")}

Identify the top ${maxNeeds} most relevant customer needs and provide detailed analysis for each including:

1. NEED IDENTIFICATION: Need type (FUNCTIONAL, EMOTIONAL, SOCIAL, FINANCIAL, TECHNICAL) and description
2. PRIORITY ASSESSMENT: Priority level (LOW, MEDIUM, HIGH, CRITICAL)
3. FREQUENCY: How often this need occurs (as string)
4. IMPACT ANALYSIS: Business impact, user impact, cost impact (as strings)
5. SOLUTION ANALYSIS: Existing solutions, gaps in solutions (as arrays of strings)
6. OPPORTUNITY: Opportunity size for addressing this need (as string)

Be specific, data-driven, and focus on actionable customer insights. Ensure enum values match the exact casing specified.
`;

    const needsAnalysisText = await aiClient.generateText(needsAnalysisPrompt, {
      temperature: 0.7,
      system: `You are a world-class customer needs analyst with 15+ years of experience in SaaS market analysis. Provide detailed, accurate customer needs analysis based on the research data.`,
    });

    // Step 4: Generate structured customer needs data
    console.log(`[Customer Needs] Generating structured needs data`);

    const structuredNeedsPrompt = `
Based on the customer needs analysis below, extract and structure the key information for each need:

ANALYSIS:
${needsAnalysisText}

Extract the following information for each need in a structured format:
- Need type (FUNCTIONAL, EMOTIONAL, SOCIAL, FINANCIAL, TECHNICAL)
- Description
- Priority level (LOW, MEDIUM, HIGH, CRITICAL)
- Frequency (as string)
- Impact analysis (as strings)
- Solution analysis (as arrays of strings)
- Opportunity size (as string)

Provide specific, quantifiable data where possible. Ensure enum values match the exact casing specified.
`;

    const needsData = await aiClient.generateObject(
      z.array(CustomerNeedInputSchema),
      structuredNeedsPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract only the requested information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing specified.`,
      }
    );

    // Step 5: Save customer needs to database
    console.log(`[Customer Needs] Saving needs to database`);

    const savedNeeds = [];
    for (const needData of needsData) {
      const savedNeed = await customerNeedsDB.save(needData, researchId);
      savedNeeds.push(savedNeed);
    }

    console.log(
      `[Customer Needs] Analysis completed successfully for idea: ${ideaId}`
    );

    return {
      success: true,
      needs: savedNeeds,
      researchData: needsResearch,
    };
  } catch (error) {
    console.error(`[Customer Needs] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
