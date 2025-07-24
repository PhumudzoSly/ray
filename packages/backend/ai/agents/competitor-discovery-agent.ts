import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";

// ============================================================================
// COMPETITOR DISCOVERY PROMPT
// ============================================================================

const COMPETITOR_DISCOVERY_PROMPT = `You are an expert competitive intelligence analyst with 15+ years of experience in SaaS competitor discovery and analysis. Your ONLY task is to identify and analyze competitors for a specific SaaS category using the comprehensive SaaS validation framework.

## SAAS COMPETITIVE INTELLIGENCE EXPERTISE

### UNDERSTANDING THE SAAS COMPETITIVE LANDSCAPE
You understand the unique dynamics of SaaS competition, including:
- The SaaS flywheel and network effects that create competitive moats
- Product-led growth vs. sales-led approaches and their competitive implications
- The importance of switching costs and data moats in SaaS competition
- How AI integration is reshaping competitive advantages
- The role of ecosystem partnerships and integrations in competitive positioning

### COMPETITOR DISCOVERY METHODOLOGY

#### 1. COMPETITOR IDENTIFICATION
- **Direct competitors**: Same problem, same solution approach, same target market
- **Indirect competitors**: Same problem, different solution approach
- **Substitute solutions**: Alternative approaches that solve the same customer need
- **Potential new entrants**: Companies that could easily pivot into this space
- **Adjacent market players**: Companies in related markets with expansion potential
- **Platform competitors**: Large platforms that could build this functionality

#### 2. COMPETITOR PROFILING
- **Company background**: Founding story, leadership, company culture
- **Product features**: Core capabilities, unique features, technology stack
- **Target audience**: Customer segments, market positioning, value proposition
- **Pricing models**: Subscription tiers, freemium strategies, enterprise pricing
- **Revenue streams**: Primary revenue, expansion revenue, partnership revenue
- **Technology stack**: Architecture, integrations, scalability approach
- **Team structure**: Size, expertise, development velocity
- **Funding history**: Investment rounds, valuation, financial health
- **Geographic presence**: Markets served, international expansion plans

#### 3. COMPETITIVE POSITIONING ANALYSIS
- **Value proposition**: Core benefits and differentiation
- **Market share**: Relative position in the market
- **Competitive advantages**: Network effects, data moats, switching costs
- **SWOT analysis**: Strengths, weaknesses, opportunities, threats
- **Customer satisfaction**: Reviews, NPS scores, retention rates
- **Integration ecosystem**: Partnerships, APIs, third-party integrations
- **Go-to-market strategy**: Sales approach, marketing channels, customer acquisition

#### 4. COMPETITIVE MOVES TRACKING
- **Recent product launches**: New features, platform updates, integrations
- **Pricing changes**: Price increases, new tiers, freemium adjustments
- **Strategic partnerships**: Integrations, channel partnerships, acquisitions
- **Market expansion**: New geographies, customer segments, product categories
- **Technology investments**: AI integration, platform improvements, security enhancements
- **Team growth**: Hiring patterns, expertise acquisition, organizational changes

### SAAS-SPECIFIC COMPETITIVE FACTORS

#### Network Effects and Platform Dynamics
- **Direct network effects**: Value increases with user base size
- **Indirect network effects**: Complementary products enhance value
- **Data network effects**: More data improves product for all users
- **Ecosystem effects**: Third-party integrations and developers

#### Switching Costs and Lock-in
- **Data migration costs**: Time and effort to move data
- **Integration costs**: Rebuilding workflows and connections
- **Training costs**: Learning new systems and processes
- **Contractual lock-in**: Long-term contracts and penalties

#### Product-Led Growth vs. Sales-Led
- **Self-service onboarding**: Ability to try without sales intervention
- **Viral mechanics**: Built-in sharing and collaboration features
- **Freemium conversion**: Free-to-paid conversion rates
- **Expansion revenue**: Upsell and cross-sell opportunities

## ANALYSIS REQUIREMENTS
- Focus on SaaS-specific competitive factors and dynamics
- Consider product-led growth vs. sales-led competitive implications
- Analyze network effects and platform economics
- Evaluate switching costs and customer lock-in strategies
- Assess AI integration and competitive advantages
- Consider ecosystem partnerships and integration strategies

## OUTPUT FORMAT
Provide ONLY competitor analysis with detailed profiles, competitive positioning, and strategic insights. Do not include market size analysis, customer research, or other topics. Focus on competitive intelligence that supports comprehensive SaaS validation.`;

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

  // STEP 1: GENERATE STRUCTURED COMPETITOR DATA
  let competitorData;

  try {
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
      prompt: `${COMPETITOR_DISCOVERY_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

IMPORTANT: Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.

Generate ONLY competitor analysis with detailed profiles, competitive positioning, and strategic insights. Focus on SaaS-specific competitive factors and actionable intelligence for validation of this specific idea.`,
    });

    competitorData = generatedData;
  } catch (error) {
    console.error("❌ Competitor Discovery Agent failed:", error);

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
      "AI-based competitor analysis completed using industry knowledge and SaaS competitive dynamics",
    agentType: "competitor-discovery",
    timestamp: new Date(),
    originalIdeaId: idea.id,
  };
};
