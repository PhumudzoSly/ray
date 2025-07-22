import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { UnifiedCrawlerService } from "../crawler";

// ============================================================================
// MARKET SIZE ANALYSIS AGENT
// ============================================================================

const MARKET_SIZE_PROMPT = `You are an expert SaaS market size analyst with 15+ years of experience in market sizing, competitive intelligence, and SaaS business strategy. Your ONLY task is to determine the market size for a specific SaaS category using the comprehensive SaaS validation framework.

## SAAS MARKET SIZING EXPERTISE

### UNDERSTANDING THE SAAS LANDSCAPE
You understand the SaaS revolution, including:
- The fundamental shift from traditional licensing to subscription-based cloud delivery
- Why SaaS works: lower barriers, scalability, automatic updates, accessibility, predictable revenue
- The SaaS flywheel: product-led growth, viral adoption, network effects, data moats, switching costs
- Current trends: AI-first SaaS, vertical SaaS dominance, product-led growth acceleration, remote work tools, sustainability focus

### MARKET SIZING METHODOLOGY

#### 1. TOTAL ADDRESSABLE MARKET (TAM)
- Research the total market size for the specific SaaS category
- Use ONLY authoritative sources (Gartner, Forrester, IDC, Statista, government data)
- Calculate in billions USD with specific year references
- Include both current and projected market sizes
- Consider the SaaS model's impact on traditional market sizing

#### 2. SERVICEABLE ADDRESSABLE MARKET (SAM)
- Identify the portion of TAM that your solution can realistically serve
- Consider geographic limitations, target customer segments, and SaaS adoption rates
- Calculate based on addressable customer base and average SaaS spend
- Factor in product-led growth and freemium conversion dynamics
- Provide clear reasoning for SAM calculation

#### 3. SERVICEABLE OBTAINABLE MARKET (SOM)
- Estimate realistic market share in first 3-5 years
- Consider competitive landscape and market penetration
- Factor in go-to-market challenges and SaaS adoption rates
- Account for product-led growth vs. sales-led approaches
- Provide conservative and optimistic scenarios

#### 4. MARKET GROWTH ANALYSIS
- Research historical growth rates (CAGR) for SaaS vs. traditional software
- Identify growth drivers: AI integration, vertical specialization, remote work
- Project future growth based on SaaS adoption trends and market maturity
- Assess market saturation and growth potential
- Consider the impact of economic cycles on SaaS spending

### SAAS-SPECIFIC CONSIDERATIONS

#### Market Maturity Assessment
- **EMERGING**: New SaaS category with limited adoption
- **GROWING**: Rapid adoption and market expansion
- **MATURE**: Established market with stable growth
- **DECLINING**: Market saturation or technology disruption

#### Growth Drivers Analysis
- AI and automation adoption rates
- Remote work and collaboration needs
- Industry-specific digital transformation
- Regulatory and compliance requirements
- Economic factors affecting SaaS spending

#### Market Barriers
- Legacy system integration challenges
- Data security and compliance concerns
- Budget constraints and approval processes
- Technology adoption resistance
- Competitive lock-in and switching costs

## RESEARCH REQUIREMENTS
- Use ONLY authoritative sources (Gartner, Forrester, IDC, Statista, government data)
- Provide specific data points with source attribution and confidence levels
- Cross-reference multiple sources for validation
- Focus on the specific SaaS category, not broad industry
- Consider both B2B and B2C SaaS dynamics
- Account for international vs. domestic market variations

## OUTPUT FORMAT
Provide ONLY market size data with clear calculations, sources, and confidence levels. Do not include competitive analysis, customer research, or other topics. Focus on actionable market sizing insights that support SaaS validation.`;

export const generateMarketSizeData = async (
  idea: any,
  previousResearch?: any,
  additionalContext?: any,
  crawlerService?: UnifiedCrawlerService
) => {
  console.log("🔍 Market Size Agent: Starting market size analysis...");

  // Initialize crawler service if not provided
  const shouldDestroyCrawler = !crawlerService;
  if (!crawlerService) {
    crawlerService = new UnifiedCrawlerService();
  }

  // Build comprehensive context from previous research and additional data
  const researchContext = {
    originalIdea: idea,
    previousResearch: previousResearch || {},
    additionalContext: additionalContext || {},
    currentFocus: "market-size-analysis",
  };

  // STEP 1: COMPREHENSIVE WEB SEARCH FOR MARKET DATA
  console.log("🔍 Market Size Agent: Searching for market data...");

  const searchQueries = [
    `${idea.industry} SaaS market size TAM SAM SOM 2024 2025`,
    `${idea.industry} SaaS industry report market analysis Gartner Forrester IDC`,
    `${idea.industry} SaaS market growth rate CAGR analysis 2024`,
    `${idea.industry} SaaS market maturity growth drivers adoption trends`,
    `${idea.industry} SaaS market barriers challenges adoption rate`,
    `${idea.industry} SaaS subscription model market penetration`,
    `${idea.industry} SaaS product-led growth market analysis`,
    `${idea.industry} SaaS market share competitive landscape`,
  ];

  let marketSizeResearch = "";

  // Enhanced search with multiple strategies
  for (const query of searchQueries) {
    try {
      // Use web search service
      const searchResults = await crawlerService.search(query);
      for (const result of searchResults) {
        marketSizeResearch += `\n\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        if (result.extractedData) {
          marketSizeResearch += `Extracted Data: ${JSON.stringify(result.extractedData, null, 2)}\n`;
        }
      }

      // Use URL discovery for additional sources
      const discoveredUrls = await crawlerService.discoverURLs(query);
      for (const url of discoveredUrls.slice(0, 5)) {
        // Limit to top 5 URLs
        try {
          const crawlResult = await crawlerService.crawl(url);
          if (crawlResult.success && crawlResult.parsedContent) {
            marketSizeResearch += `\n\nDiscovered Source: ${url}\nContent: ${crawlResult.parsedContent.text}\n`;
          }
        } catch (error) {
          console.warn(`Failed to crawl discovered URL ${url}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to search for query "${query}":`, error);
    }
  }

  // STEP 2: SEARCH FOR SPECIFIC MARKET DATA
  console.log("🔍 Market Size Agent: Searching for specific market data...");
  try {
    const marketDataResults = await crawlerService.searchMarketData(
      idea.industry
    );
    for (const result of marketDataResults) {
      marketSizeResearch += `\n\nMarket Data Source: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
    }
  } catch (error) {
    console.warn("Failed to search for specific market data:", error);
  }

  // STEP 3: CRAWL AUTHORITATIVE SOURCES
  console.log("🔍 Market Size Agent: Crawling authoritative sources...");
  const authoritativeSources = [
    "https://www.gartner.com",
    "https://www.forrester.com",
    "https://www.idc.com",
    "https://www.statista.com",
    "https://www.mckinsey.com",
    "https://www.bain.com",
    "https://www.bcg.com",
  ];

  for (const source of authoritativeSources) {
    try {
      const siteMap = await crawlerService.crawlSite(source);
      const marketPages = await crawlerService.findPagesByDataType(
        source,
        "market"
      );

      for (const page of marketPages.slice(0, 3)) {
        // Limit to top 3 pages
        try {
          const crawlResult = await crawlerService.crawl(page.url);
          if (crawlResult.success && crawlResult.parsedContent) {
            marketSizeResearch += `\n\nAuthoritative Source: ${page.url}\nContent: ${crawlResult.parsedContent.text}\n`;
          }
        } catch (error) {
          console.warn(
            `Failed to crawl authoritative page ${page.url}:`,
            error
          );
        }
      }
    } catch (error) {
      console.warn(`Failed to crawl authoritative source ${source}:`, error);
    }
  }

  // STEP 4: EXTRACT SAAS-SPECIFIC DATA
  console.log("🔍 Market Size Agent: Extracting SaaS-specific data...");
  try {
    const saasDataResults = await crawlerService.extractSaaSDataBatch([
      `https://www.gartner.com/en/search?q=${encodeURIComponent(idea.industry + " SaaS")}`,
      `https://www.forrester.com/search?q=${encodeURIComponent(idea.industry + " SaaS")}`,
      `https://www.statista.com/search/?q=${encodeURIComponent(idea.industry + " SaaS market")}`,
    ]);

    for (const result of saasDataResults) {
      if (result.data) {
        marketSizeResearch += `\n\nSaaS Data Source: ${result.url}\nExtracted Data: ${JSON.stringify(result.data, null, 2)}\n`;
      }
    }
  } catch (error) {
    console.warn("Failed to extract SaaS-specific data:", error);
  }

  // STEP 5: GENERATE STRUCTURED MARKET SIZE DATA
  console.log("🔍 Market Size Agent: Generating structured data...");
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

      growthDrivers: z.array(z.string()),
      growthBarriers: z.array(z.string()),

      // SaaS-specific metrics
      saasAdoptionRate: z.number().optional(),
      subscriptionModelPrevalence: z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        "VERY_HIGH",
      ]),
      productLedGrowthPotential: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

      dataQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      dataGaps: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    prompt: `${MARKET_SIZE_PROMPT}

RESEARCH FINDINGS:
${marketSizeResearch}

ORIGINAL IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

PREVIOUS RESEARCH CONTEXT:
${JSON.stringify(previousResearch, null, 2)}

Generate ONLY market size metrics with clear sources, confidence levels, and SaaS-specific considerations. Focus on actionable insights that support comprehensive SaaS validation for this specific idea.`,
  });

  console.log("✅ Market Size Agent: Completed market size analysis");

  // Cleanup crawler service only if we created it
  if (shouldDestroyCrawler && crawlerService) {
    crawlerService.destroy();
  }

  return {
    marketSizeData,
    researchText: marketSizeResearch,
    agentType: "market-size",
    timestamp: new Date(),
    originalIdeaId: idea.id,
  };
};
