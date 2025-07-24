import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { allTools } from "../tools";

// ============================================================================
// COMPETITOR DISCOVERY RESEARCH PROMPT (FOR TOOL USAGE)
// ============================================================================

const COMPETITOR_DISCOVERY_RESEARCH_PROMPT = `You are an expert competitive intelligence analyst with 15+ years of experience in SaaS competitor discovery and analysis. Your task is to conduct comprehensive research to identify and analyze competitors for a specific SaaS category.

## RESEARCH MISSION
You MUST use the available research tools to gather comprehensive competitive intelligence before providing any analysis. Your goal is to collect real data about competitors, market dynamics, and competitive positioning.

## REQUIRED RESEARCH STEPS (USE TOOLS FOR EACH STEP):

### 1. INITIAL COMPETITOR SEARCH
- Use the search tool to find direct competitors for the SaaS idea
- Search for companies solving the same problem in the same market
- Look for both established players and emerging startups

### 2. COMPETITOR WEBSITE ANALYSIS
- Use scrapeUrl to visit and analyze competitor websites
- Extract product information, features, pricing, and positioning
- Understand their target audience and value proposition

### 3. COMPREHENSIVE COMPETITOR RESEARCH
- Use competitorResearch tool for detailed competitor analysis
- Research funding, growth, market position, and customer sentiment
- Analyze their go-to-market strategy and competitive advantages

### 4. MARKET TREND ANALYSIS
- Use trendResearch to understand industry trends and competitive dynamics
- Research emerging threats and market disruptions
- Analyze competitive moves and strategic shifts

### 5. CUSTOMER SENTIMENT ANALYSIS
- Use sentimentAnalysis to understand customer perception of competitors
- Research reviews, feedback, and market sentiment
- Identify strengths and weaknesses from customer perspective

### 6. MULTI-QUERY RESEARCH
- Use multiQueryResearch to investigate specific competitive aspects
- Research pricing strategies, feature comparisons, and market positioning
- Analyze competitive differentiation and unique value propositions

## RESEARCH TOOLS AVAILABLE:
- search: Basic web search for competitor information
- searchDetailed: Comprehensive search with content scraping
- scrapeUrl: Visit and analyze competitor websites
- scrapeMultipleUrls: Analyze multiple competitor sites efficiently
- research: Comprehensive research combining search and scraping
- competitorResearch: Specialized competitor research
- trendResearch: Research industry trends and competitive dynamics
- sentimentAnalysis: Analyze customer sentiment about competitors
- multiQueryResearch: Research across multiple related queries

## RESEARCH INSTRUCTIONS:
1. Start with broad competitor searches to identify key players
2. Visit competitor websites to understand their products and positioning
3. Conduct detailed competitor research for each major player
4. Research market trends and competitive dynamics
5. Analyze customer sentiment and reviews
6. Use multiple research queries to gather comprehensive intelligence

## OUTPUT REQUIREMENTS:
After conducting comprehensive research using the tools, provide a detailed research summary that includes:
- List of identified competitors with basic information
- Key findings about competitor products, pricing, and positioning
- Market trends and competitive dynamics discovered
- Customer sentiment and perception insights
- Competitive threats and opportunities identified
- Data quality assessment and any gaps in research

IMPORTANT: You MUST use the research tools extensively before providing any analysis. Do not provide analysis without first gathering real competitive intelligence through the tools.`;

// ============================================================================
// COMPETITOR DISCOVERY ANALYSIS PROMPT (FOR STRUCTURED OUTPUT)
// ============================================================================

const COMPETITOR_DISCOVERY_ANALYSIS_PROMPT = `You are an expert competitive intelligence analyst. Based on the comprehensive research data provided, generate a structured competitor analysis following the exact schema requirements.

## ANALYSIS REQUIREMENTS:
- Use the research data to populate the competitor analysis schema
- Focus on SaaS-specific competitive factors and dynamics
- Consider product-led growth vs. sales-led competitive implications
- Analyze network effects and platform economics
- Evaluate switching costs and customer lock-in strategies
- Assess AI integration and competitive advantages
- Consider ecosystem partnerships and integration strategies

## RESEARCH DATA CONTEXT:
The following research data was gathered using comprehensive web research tools and should be used to populate the structured analysis:

`;

export const generateCompetitorData = async (
  idea: any,
  previousResearch?: any,
  additionalContext?: any
) => {
  console.log("🔍 Competitor Discovery Agent: Starting competitor analysis...");

  // Build comprehensive context from previous research and additional data
  const researchContext = {
    originalIdea: idea,
    previousResearch: previousResearch || {},
    additionalContext: additionalContext || {},
    currentFocus: "competitor-analysis",
  };

  // STEP 1: CONDUCT RESEARCH USING generateText WITH TOOLS
  let researchData;

  try {
    console.log("🔍 Step 1: Conducting comprehensive research with tools...");

    const { text: researchText } = await generateText({
      model: google("gemini-2.0-flash", {
        useSearchGrounding: true,
      }),
      tools: allTools,
      maxSteps: 100,
      toolChoice: "required",
      prompt: `${COMPETITOR_DISCOVERY_RESEARCH_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

RESEARCH INSTRUCTIONS:
1. Start by searching for direct competitors using the search tools
2. Research competitor websites to understand their products and positioning
3. Analyze market trends and competitive dynamics
4. Investigate customer sentiment about competitors
5. Research funding and growth information for key competitors
6. Use the research tools to gather comprehensive competitive intelligence

IMPORTANT: Use the available research tools extensively to gather real competitive intelligence before providing any analysis. Do not provide analysis without first conducting thorough research using the tools.`,
    });

    researchData = researchText;
    console.log("✅ Step 1: Research completed successfully");
  } catch (error) {
    console.error("❌ Step 1: Research failed:", error);
    researchData =
      "Research failed due to technical issues. Limited competitive data available.";
  }

  // STEP 2: GENERATE STRUCTURED COMPETITOR DATA USING generateObject
  let competitorData;

  try {
    console.log("🔍 Step 2: Generating structured competitor analysis...");

    const { object: generatedData } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        competitiveIntensity: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        marketConcentration: z.number().optional(), // Percentage controlled by top players
        entryBarriers: z.array(z.string()),
        switchingCosts: z.number().optional(), // 1-10 scale

        competitors: z.array(
          z.object({
            name: z.string(),
            website: z.string().optional(),
            description: z.string().optional(),
            logoUrl: z.string().optional(),

            // Company Information
            foundedYear: z.number().optional(),
            headquarters: z.string().optional(),
            employeeCount: z.number().optional(),
            fundingRaised: z.number().optional(),
            lastFundingRound: z.string().optional(),

            // Market Position
            marketShare: z.number().optional(),
            annualRevenue: z.number().optional(),
            customerCount: z.number().optional(),
            targetAudience: z.string().optional(),

            // Product Information
            productFeatures: z.array(z.string()),
            pricingModel: z.enum([
              "SUBSCRIPTION",
              "FREEMIUM",
              "ONE_TIME",
              "USAGE_BASED",
              "HYBRID",
            ]),
            pricingRange: z.string().optional(),
            techStack: z.array(z.string()),
            integrations: z.array(z.string()),

            // SaaS-Specific Metrics
            productLedGrowth: z.boolean().optional(),
            freemiumConversion: z.number().optional(), // Percentage
            customerRetention: z.number().optional(), // Percentage
            networkEffects: z.enum(["NONE", "WEAK", "MODERATE", "STRONG"]),
            switchingCosts: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

            // Competitive Analysis
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            opportunities: z.array(z.string()),
            threats: z.array(z.string()),
            competitiveAdvantage: z.string().optional(),
            differentiationFactors: z.array(z.string()),

            // Threat Assessment
            threatLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            competitiveMoves: z.array(z.string()),

            // Data Quality
            dataConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
            dataSources: z.array(z.string()),
          })
        ),

        // Market Dynamics
        emergingThreats: z.array(z.string()),
        marketDisruptions: z.array(z.string()),
        competitiveTrends: z.array(z.string()),

        // Strategic Insights
        differentiationOpportunities: z.array(z.string()),
        competitiveAdvantage: z.string().optional(),
        strategicRecommendations: z.array(z.string()),

        dataQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        dataGaps: z.array(z.string()),
      }),
      prompt: `${COMPETITOR_DISCOVERY_ANALYSIS_PROMPT}

RESEARCH DATA:
${researchData}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

ANALYSIS INSTRUCTIONS:
Based on the comprehensive research data above, generate a structured competitor analysis that follows the exact schema requirements. Use the research findings to populate all fields with accurate, data-driven insights.

IMPORTANT: 
- Use the research data to inform your analysis
- Focus on SaaS-specific competitive factors and dynamics
- Consider product-led growth vs. sales-led competitive implications
- Analyze network effects and platform economics
- Evaluate switching costs and customer lock-in strategies
- Assess AI integration and competitive advantages
- Consider ecosystem partnerships and integration strategies

Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.`,
    });

    competitorData = generatedData;
    console.log("✅ Step 2: Structured analysis completed successfully");
  } catch (error) {
    console.error("❌ Step 2: Structured analysis failed:", error);

    // Return fallback competitor data
    competitorData = {
      competitiveIntensity: "MEDIUM" as const,
      marketConcentration: undefined,
      entryBarriers: ["Limited competitive data available"],
      switchingCosts: undefined,
      competitors: [],
      emergingThreats: ["Limited competitive analysis data"],
      marketDisruptions: ["Insufficient market disruption data"],
      competitiveTrends: ["Limited trend analysis data"],
      differentiationOpportunities: [
        "Conduct comprehensive competitive analysis",
      ],
      competitiveAdvantage: "Competitive analysis needed",
      strategicRecommendations: [
        "Complete competitive research",
        "Analyze market positioning",
      ],
      dataQuality: "LOW" as const,
      dataGaps: [
        "Competitor profiles",
        "Market positioning data",
        "Competitive intelligence",
      ],
    };
  }

  console.log("✅ Competitor Discovery Agent: Completed competitor analysis");

  return {
    competitorData,
    researchText:
      "AI-based competitor analysis completed using comprehensive research tools and SaaS competitive dynamics",
    agentType: "competitor-discovery",
    timestamp: new Date(),
    originalIdeaId: idea.id,
  };
};
