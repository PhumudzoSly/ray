import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";

// ============================================================================
// MARKET SIZE ANALYSIS PROMPT
// ============================================================================

const MARKET_SIZE_PROMPT = `You are an expert market analyst with 15+ years of experience in SaaS market sizing and analysis. Your ONLY task is to analyze the market size and growth potential for a specific SaaS idea using the comprehensive SaaS validation framework.

## SAAS MARKET SIZING EXPERTISE

### UNDERSTANDING SAAS MARKET DYNAMICS
You understand the unique characteristics of SaaS markets, including:
- The SaaS flywheel and recurring revenue models
- Product-led growth vs. sales-led growth market dynamics
- Network effects and platform economics in SaaS
- The importance of customer lifetime value (CLV) and churn rates
- How AI integration is reshaping SaaS market opportunities
- The role of freemium models and conversion rates in market sizing

### MARKET SIZING METHODOLOGY

#### 1. TOTAL ADDRESSABLE MARKET (TAM)
- **Definition**: Total market demand for the product/service
- **Calculation**: Number of potential customers × Average revenue per customer
- **Considerations**: Global vs. regional markets, market maturity, adoption rates
- **SaaS Factors**: Subscription models, freemium conversion, expansion revenue

#### 2. SERVICEABLE ADDRESSABLE MARKET (SAM)
- **Definition**: Portion of TAM that can be realistically reached
- **Factors**: Geographic limitations, regulatory constraints, technical capabilities
- **SaaS Considerations**: Platform compatibility, integration requirements, language support
- **Go-to-market**: Sales channels, marketing reach, partnership limitations

#### 3. SERVICEABLE OBTAINABLE MARKET (SOM)
- **Definition**: Market share that can be captured in 3-5 years
- **Competitive Analysis**: Market share of existing players, competitive advantages
- **Resource Constraints**: Team size, funding, technical capabilities
- **SaaS Metrics**: Customer acquisition costs, conversion rates, retention rates

#### 4. MARKET GROWTH ANALYSIS
- **Growth Rate**: CAGR and year-over-year growth projections
- **Growth Drivers**: Technology adoption, regulatory changes, market trends
- **Growth Barriers**: Switching costs, regulatory hurdles, technical complexity
- **SaaS Growth**: Product-led growth, viral mechanics, network effects

#### 5. MARKET MATURITY ASSESSMENT
- **Emerging Markets**: High growth, low competition, undefined standards
- **Growing Markets**: Established players, clear value propositions, expanding adoption
- **Mature Markets**: Saturated competition, price pressure, consolidation
- **Declining Markets**: Decreasing demand, technology obsolescence, market shifts

### SAAS-SPECIFIC MARKET FACTORS

#### Subscription Economics
- **Recurring Revenue**: Predictable cash flow and valuation multiples
- **Expansion Revenue**: Upsell and cross-sell opportunities
- **Churn Impact**: Customer retention effects on market size
- **Freemium Models**: Free-to-paid conversion rates and market penetration

#### Product-Led Growth
- **Self-Service Onboarding**: Reduced customer acquisition costs
- **Viral Mechanics**: Built-in sharing and collaboration features
- **Network Effects**: Value increases with user base size
- **Data Moats**: Competitive advantages from user data

#### Technology Adoption
- **Cloud Migration**: Enterprise adoption of cloud-based solutions
- **AI Integration**: Market demand for AI-powered features
- **API Ecosystems**: Integration requirements and market opportunities
- **Mobile-First**: Mobile adoption rates and market implications

## ANALYSIS REQUIREMENTS
- Focus on SaaS-specific market dynamics and metrics
- Consider product-led growth vs. sales-led growth implications
- Analyze network effects and platform economics
- Evaluate freemium models and conversion rates
- Assess AI integration opportunities and market demand
- Consider international expansion and localization requirements

## OUTPUT FORMAT
Provide ONLY market size analysis with TAM/SAM/SOM calculations, growth projections, and market maturity assessment. Do not include competitor analysis, customer research, or other topics. Focus on market sizing that supports comprehensive SaaS validation.`;

export const generateMarketSizeData = async (
  idea: any,
  previousResearch?: any,
  additionalContext?: any
) => {
  console.log("🔍 Market Size Agent: Starting market size analysis...");

  // Build comprehensive context from previous research and additional data
  const researchContext = {
    originalIdea: idea,
    previousResearch: previousResearch || {},
    additionalContext: additionalContext || {},
    currentFocus: "market-size-analysis",
  };

  // STEP 1: GENERATE STRUCTURED MARKET SIZE DATA
  console.log("🔍 Market Size Agent: Generating structured data...");

  try {
    const { object: marketSizeData } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        totalAddressableMarket: z.number().optional(),
        tamSource: z.string().optional(),
        tamYear: z.number().optional(),
        tamConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

        serviceableAddressableMarket: z.number().optional(),
        samSource: z.string().optional(),
        samYear: z.number().optional(),
        samConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

        serviceableObtainableMarket: z.number().optional(),
        somSource: z.string().optional(),
        somYear: z.number().optional(),
        somConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

        marketGrowthRate: z.number().optional(),
        growthRateSource: z.string().optional(),
        growthRatePeriod: z.string().optional(),
        growthRateConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

        marketMaturity: z.enum(["EMERGING", "GROWING", "MATURE", "DECLINING"]),
        maturityIndicators: z.array(z.string()),
        maturityConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

        // Market Dynamics
        growthDrivers: z.array(z.string()),
        growthBarriers: z.array(z.string()),
        marketTrends: z.array(z.string()),
        regulatoryFactors: z.array(z.string()),

        // SaaS-Specific Metrics
        subscriptionAdoption: z.number().optional(), // Percentage
        freemiumConversion: z.number().optional(), // Percentage
        averageRevenuePerUser: z.number().optional(),
        customerLifetimeValue: z.number().optional(),
        churnRate: z.number().optional(), // Percentage

        // Technology Factors
        cloudAdoption: z.number().optional(), // Percentage
        aiIntegration: z.number().optional(), // Percentage
        mobileAdoption: z.number().optional(), // Percentage
        apiEcosystem: z.enum(["NONE", "WEAK", "MODERATE", "STRONG"]),

        // Geographic Analysis
        primaryMarkets: z.array(z.string()),
        internationalPotential: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        localizationRequirements: z.array(z.string()),

        // Market Opportunities
        underservedSegments: z.array(z.string()),
        emergingUseCases: z.array(z.string()),
        integrationOpportunities: z.array(z.string()),
        partnershipPotential: z.array(z.string()),

        // Risk Assessment
        marketRisks: z.array(z.string()),
        competitiveThreats: z.array(z.string()),
        technologyRisks: z.array(z.string()),
        regulatoryRisks: z.array(z.string()),

        // Strategic Insights
        marketEntryStrategy: z.string().optional(),
        growthStrategy: z.array(z.string()),
        competitiveAdvantage: z.string().optional(),
        marketPositioning: z.string().optional(),

        dataQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        dataGaps: z.array(z.string()),
        confidenceLevel: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      }),
      prompt: `${MARKET_SIZE_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

IMPORTANT: Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.

Generate ONLY market size analysis with TAM/SAM/SOM calculations, growth projections, and market maturity assessment. Focus on SaaS-specific market dynamics and actionable intelligence for validation of this specific idea.`,
    });

    console.log("✅ Market Size Agent: Completed market size analysis");

    return {
      marketSizeData,
      researchText:
        "AI-based market size analysis completed using industry knowledge and SaaS market dynamics",
      agentType: "market-size",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  } catch (error) {
    console.error("❌ Market Size Agent failed:", error);

    // Return fallback market size data
    const fallbackData = {
      totalAddressableMarket: undefined,
      tamSource: "AI analysis",
      tamYear: new Date().getFullYear(),
      tamConfidence: "LOW" as const,
      serviceableAddressableMarket: undefined,
      samSource: "AI analysis",
      samYear: new Date().getFullYear(),
      samConfidence: "LOW" as const,
      serviceableObtainableMarket: undefined,
      somSource: "AI analysis",
      somYear: new Date().getFullYear(),
      somConfidence: "LOW" as const,
      marketGrowthRate: undefined,
      growthRateSource: "AI analysis",
      growthRatePeriod: "2024-2029",
      growthRateConfidence: "LOW" as const,
      marketMaturity: "GROWING" as const,
      maturityIndicators: ["Limited market maturity data available"],
      maturityConfidence: "LOW" as const,
      growthDrivers: [
        "AI integration",
        "Cloud adoption",
        "Digital transformation",
      ],
      growthBarriers: ["Market analysis needed"],
      marketTrends: ["SaaS adoption increasing", "AI integration growing"],
      regulatoryFactors: [
        "Data privacy regulations",
        "Industry-specific compliance",
      ],
      subscriptionAdoption: undefined,
      freemiumConversion: undefined,
      averageRevenuePerUser: undefined,
      customerLifetimeValue: undefined,
      churnRate: undefined,
      cloudAdoption: undefined,
      aiIntegration: undefined,
      mobileAdoption: undefined,
      apiEcosystem: "MODERATE" as const,
      primaryMarkets: ["North America", "Europe"],
      internationalPotential: "MEDIUM" as const,
      localizationRequirements: ["Language support", "Regional compliance"],
      underservedSegments: ["Market analysis needed"],
      emergingUseCases: ["AI-powered features", "Integration capabilities"],
      integrationOpportunities: ["API ecosystem", "Third-party integrations"],
      partnershipPotential: ["Technology partners", "Channel partners"],
      marketRisks: ["Competitive analysis needed"],
      competitiveThreats: ["Market analysis required"],
      technologyRisks: ["Technical feasibility assessment needed"],
      regulatoryRisks: ["Compliance requirements"],
      marketEntryStrategy: "Conduct comprehensive market research",
      growthStrategy: ["Product-led growth", "Strategic partnerships"],
      competitiveAdvantage: "Market analysis required",
      marketPositioning: "Positioning strategy needed",
      dataQuality: "LOW" as const,
      dataGaps: [
        "Market size data",
        "Growth projections",
        "Competitive landscape",
      ],
      confidenceLevel: "LOW" as const,
    };

    return {
      marketSizeData: fallbackData,
      researchText: "Market size analysis failed - fallback data provided",
      agentType: "market-size",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  }
};
