import { aiClient } from "../client";
import { TargetAudienceOptionalDefaultsSchema } from "@workspace/backend/prisma/generated/zod";
import { targetAudienceDB } from "../database";
import { researchUtils } from "../research";
import { z } from "zod";

// Modified schema for AI client compatibility (excluding UUID and date fields)
const TargetAudienceInputSchema = TargetAudienceOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
});

export interface AnalyzeTargetAudienceParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
  maxAudiences?: number;
}

export interface AnalyzeTargetAudienceResult {
  success: boolean;
  audiences?: any[];
  error?: string;
  researchData?: any;
}

export async function analyzeTargetAudience({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  maxAudiences = 3,
}: AnalyzeTargetAudienceParams): Promise<AnalyzeTargetAudienceResult> {
  try {
    console.log(`[Target Audience] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if target audiences already exist
    const existingAudiences = await targetAudienceDB.get(researchId);
    if (existingAudiences.length > 0) {
      console.log(
        `[Target Audience] Found ${existingAudiences.length} existing audiences for research: ${researchId}`
      );
      return {
        success: true,
        audiences: existingAudiences,
      };
    }

    // Step 2: Research target audiences in the target market
    console.log(
      `[Target Audience] Researching target audiences for: ${targetMarket}`
    );

    const audienceResearchQueries = [
      `${targetMarket} target audience`,
      `${targetMarket} customer segments`,
      `${targetMarket} user demographics`,
      `${targetMarket} buyer personas`,
      `${targetMarket} market segments`,
    ];

    const audienceResearch = await researchUtils.multiQueryResearch(
      audienceResearchQueries,
      {
        maxResultsPerQuery: 3,
        includeContent: true,
      }
    );

    // Step 3: Generate target audience analysis
    console.log(`[Target Audience] Generating audience analysis`);

    const audienceAnalysisPrompt = `
You are a specialized target audience analyst for SaaS validation. Analyze the target audiences for the following SaaS idea:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

RESEARCH DATA:
${audienceResearch.results
  .map(
    (result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map((s) => s.url).join(", ")}
`
  )
  .join("\n")}

Identify the top ${maxAudiences} most relevant target audience segments and provide detailed analysis for each including:

1. SEGMENT IDENTIFICATION: Segment name and description
2. DEMOGRAPHICS: Detailed demographic information (as string)
3. PAIN POINTS: Key pain points and challenges (as array of strings)
4. DECISION FACTORS: Factors influencing purchase decisions (as string)
5. BUDGET ANALYSIS: Budget range and financial considerations (as string)
6. TECH SAVVINESS: Technology adoption level (LOW, MEDIUM, HIGH)
7. MARKET METRICS: Market size and growth rate (as strings)
8. ACCESSIBILITY: How accessible this segment is (as string)
9. COMPETITIVE LANDSCAPE: Competitive landscape for this segment (as string)

Be specific, data-driven, and focus on actionable audience insights. Ensure enum values match the exact casing specified.
`;

    const audienceAnalysisText = await aiClient.generateText(
      audienceAnalysisPrompt,
      {
        temperature: 0.7,
        system: `You are a world-class target audience analyst with 15+ years of experience in SaaS market analysis. Provide detailed, accurate audience analysis based on the research data.`,
      }
    );

    // Step 4: Generate structured target audience data
    console.log(`[Target Audience] Generating structured audience data`);

    const structuredAudiencePrompt = `
Based on the target audience analysis below, extract and structure the key information for each audience segment:

ANALYSIS:
${audienceAnalysisText}

Extract the following information for each audience segment in a structured format:
- Segment name and description
- Demographics (as string)
- Pain points (as array of strings)
- Decision factors (as string)
- Budget range (as string)
- Tech savviness (LOW, MEDIUM, HIGH)
- Market metrics (as strings)
- Accessibility (as string)
- Competitive landscape (as string)

Provide specific, quantifiable data where possible. Ensure enum values match the exact casing specified.
`;

    const audiencesData = await aiClient.generateObject(
      z.array(TargetAudienceInputSchema),
      structuredAudiencePrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract only the requested information in the exact format specified by the schema. Be precise and accurate. Ensure enum values match the exact casing specified.`,
      }
    );

    // Step 5: Save target audiences to database
    console.log(`[Target Audience] Saving audiences to database`);

    const savedAudiences = [];
    for (const audienceData of audiencesData) {
      const savedAudience = await targetAudienceDB.save(
        audienceData,
        researchId
      );
      savedAudiences.push(savedAudience);
    }

    console.log(
      `[Target Audience] Analysis completed successfully for idea: ${ideaId}`
    );

    return {
      success: true,
      audiences: savedAudiences,
      researchData: audienceResearch,
    };
  } catch (error) {
    console.error(`[Target Audience] Analysis failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
