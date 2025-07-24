import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { allTools } from "../tools";

// ============================================================================
// MARKET SIZE ANALYSIS PROMPT
// ============================================================================

const MARKET_SIZE_RESEARCH_PROMPT = `You are an expert market analyst with 15+ years of experience in SaaS market sizing and analysis. Your task is to conduct comprehensive research to analyze the market size and growth potential for a specific SaaS idea.

## RESEARCH OBJECTIVES

### PRIMARY RESEARCH GOALS
1. **Market Size Estimation**: Determine TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market)
2. **Growth Analysis**: Identify market growth rates, trends, and drivers
3. **Market Maturity Assessment**: Evaluate if the market is emerging, growing, mature, or declining
4. **SaaS-Specific Dynamics**: Analyze subscription models, freemium conversion, churn rates, and product-led growth
5. **Technology Adoption**: Assess cloud adoption, AI integration, mobile usage, and API ecosystems
6. **Geographic Analysis**: Identify primary markets and international expansion potential
7. **Competitive Landscape**: Understand market positioning and competitive advantages

### RESEARCH STRATEGY

#### STEP 1: INITIAL MARKET RESEARCH
- Search for market size data, industry reports, and market research
- Look for TAM/SAM/SOM calculations in similar markets
- Find growth projections and CAGR data
- Identify market maturity indicators

#### STEP 2: COMPETITIVE ANALYSIS
- Research direct and indirect competitors
- Analyze their market share, pricing, and positioning
- Identify competitive advantages and market gaps
- Understand the competitive landscape structure

#### STEP 3: TECHNOLOGY TRENDS
- Research technology adoption rates (cloud, AI, mobile)
- Analyze API ecosystem maturity
- Identify integration opportunities and requirements
- Assess technical barriers and opportunities

#### STEP 4: CUSTOMER SEGMENT RESEARCH
- Identify target customer segments
- Research customer behavior and preferences
- Analyze subscription adoption patterns
- Understand freemium conversion rates

#### STEP 5: REGULATORY AND COMPLIANCE
- Research industry-specific regulations
- Identify compliance requirements
- Analyze data privacy and security requirements
- Understand international expansion barriers

### TOOL USAGE GUIDELINES

#### Search Tools
- Use \`search\` for basic market research and finding industry reports
- Use \`searchDetailed\` for comprehensive analysis of top results
- Focus on finding market size data, growth projections, and industry trends

#### Research Tools
- Use \`research\` for comprehensive topic investigation
- Use \`competitorResearch\` to analyze competitive landscape
- Use \`trendResearch\` to identify market trends and developments
- Use \`multiQueryResearch\` for analyzing multiple related aspects

#### Analysis Tools
- Use \`sentimentAnalysis\` to understand market sentiment and public opinion
- Use \`multiQueryResearch\` to synthesize findings across multiple queries

#### Scraping Tools
- Use \`scrapeUrl\` to extract detailed content from market research reports
- Use \`scrapeMultipleUrls\` to gather data from multiple sources efficiently

### RESEARCH QUERIES TO EXECUTE

Based on the SaaS idea, research these specific areas:

1. **Market Size Queries**:
   - "[Industry/vertical] market size 2024"
   - "[Industry/vertical] TAM SAM SOM analysis"
   - "[Industry/vertical] market growth projections"
   - "[Industry/vertical] market research reports"

2. **Competitive Analysis**:
   - "[Competitor names] market share"
   - "[Industry/vertical] competitive landscape"
   - "[Industry/vertical] market leaders"

3. **Technology Trends**:
   - "[Industry/vertical] AI adoption rates"
   - "[Industry/vertical] cloud migration trends"
   - "[Industry/vertical] API ecosystem"

4. **Customer Behavior**:
   - "[Industry/vertical] subscription adoption"
   - "[Industry/vertical] freemium conversion rates"
   - "[Industry/vertical] customer churn rates"

5. **Geographic Analysis**:
   - "[Industry/vertical] market by region"
   - "[Industry/vertical] international expansion"

### OUTPUT REQUIREMENTS

After conducting comprehensive research, provide:

1. **Research Summary**: Concise overview of findings
2. **Key Data Points**: Specific numbers, percentages, and metrics found
3. **Market Insights**: Qualitative analysis and trends
4. **Data Sources**: URLs and references for verification
5. **Confidence Levels**: Assessment of data quality and reliability
6. **Research Gaps**: Areas where data is missing or uncertain

Focus on gathering actionable, quantitative data that can be used for market sizing calculations and strategic decision-making.`;

const MARKET_SIZE_ANALYSIS_PROMPT = `You are an expert market analyst with 15+ years of experience in SaaS market sizing and analysis. Your ONLY task is to analyze the market size and growth potential for a specific SaaS idea using the comprehensive research data provided.

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

  // STEP 1: CONDUCT COMPREHENSIVE RESEARCH USING TOOLS
  console.log("🔍 Market Size Agent: Conducting research with tools...");

  try {
    const researchResult = await generateText({
      model: google("gemini-2.0-flash", {
        useSearchGrounding: true,
      }),
      tools: allTools,
      maxSteps: 100,
      toolChoice: "required",
      prompt: `${MARKET_SIZE_RESEARCH_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

CONDUCT COMPREHENSIVE RESEARCH:
1. Start with market size research for the specific industry/vertical
2. Analyze competitive landscape and market positioning
3. Research technology adoption trends and SaaS dynamics
4. Investigate customer behavior and subscription patterns
5. Assess geographic market opportunities
6. Identify regulatory and compliance factors

Use the available tools systematically to gather comprehensive market data. Focus on finding quantitative data, market reports, and industry insights that can inform market sizing calculations.

Provide a detailed research summary with specific data points, sources, and confidence levels.`,
    });

    console.log(
      "✅ Market Size Agent: Research completed, generating structured data..."
    );

    // STEP 2: GENERATE STRUCTURED MARKET SIZE DATA USING RESEARCH RESULTS
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
      prompt: `${MARKET_SIZE_ANALYSIS_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

COMPREHENSIVE RESEARCH DATA:
${researchResult.text}

IMPORTANT: Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.

Generate ONLY market size analysis with TAM/SAM/SOM calculations, growth projections, and market maturity assessment. Focus on SaaS-specific market dynamics and actionable intelligence for validation of this specific idea.

Use the research data provided to populate the structured fields with the most accurate and relevant information available.`,
    });

    console.log("✅ Market Size Agent: Completed market size analysis");

    return {
      marketSizeData,
      researchText: researchResult.text,
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
