import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { UnifiedCrawlerService } from "../crawler";
import CustomerResearchAgent from "./customer-research-agent";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const extractCompetitorNames = (researchText: string): string[] => {
  // Common competitor patterns in SaaS research
  const competitorPatterns = [
    /(?:competitor|alternative|competition|rival)\s+(?:like|such as|including)\s+([A-Z][a-zA-Z\s]+)/gi,
    /(?:companies|platforms|tools)\s+(?:like|such as|including)\s+([A-Z][a-zA-Z\s]+)/gi,
    /(?:similar to|compared to|vs\.?|versus)\s+([A-Z][a-zA-Z\s]+)/gi,
  ];

  const competitors = new Set<string>();

  for (const pattern of competitorPatterns) {
    const matches = researchText.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 50) {
          competitors.add(name);
        }
      }
    }
  }

  // Also look for common SaaS company names
  const commonSaaSCompanies = [
    "Slack",
    "Notion",
    "Figma",
    "Linear",
    "Stripe",
    "Shopify",
    "HubSpot",
    "Salesforce",
    "Zoom",
    "Dropbox",
    "Asana",
    "Trello",
    "Monday.com",
    "Airtable",
    "Miro",
    "Canva",
    "Figma",
    "Webflow",
    "Squarespace",
    "Intercom",
    "Zendesk",
    "Pipedrive",
    "Typeform",
    "Calendly",
  ];

  for (const company of commonSaaSCompanies) {
    if (researchText.toLowerCase().includes(company.toLowerCase())) {
      competitors.add(company);
    }
  }

  return Array.from(competitors);
};

// ============================================================================
// COMPETITOR DISCOVERY AGENT
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

## RESEARCH REQUIREMENTS
- Use multiple sources for each competitor (website, reviews, news, funding data, social media)
- Provide specific metrics and data points with sources and confidence levels
- Focus on actionable competitive intelligence for SaaS validation
- Identify both established and emerging competitors
- Consider international competitors and market expansion
- Track competitive moves and strategic changes over time

## OUTPUT FORMAT
Provide ONLY competitor analysis with detailed profiles, competitive positioning, and strategic insights. Do not include market size analysis, customer research, or other topics. Focus on competitive intelligence that supports comprehensive SaaS validation.`;

export const generateCompetitorData = async (
  idea: any,
  previousResearch?: any,
  additionalContext?: any,
  crawlerService?: UnifiedCrawlerService
) => {
  console.log("🔍 Competitor Discovery Agent: Starting competitor analysis...");

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
    currentFocus: "competitor-analysis",
  };

  // STEP 1: COMPREHENSIVE COMPETITOR RESEARCH
  console.log("🔍 Competitor Discovery Agent: Searching for competitors...");
  const searchQueries = [
    `competitors ${idea.industry} SaaS alternatives comparison 2024 2025`,
    `${idea.industry} SaaS pricing models features comparison`,
    `${idea.industry} SaaS market share competitive landscape`,
    `${idea.industry} SaaS funding acquisitions recent news 2024`,
    `${idea.industry} SaaS product reviews customer feedback NPS`,
    `${idea.industry} SaaS competitive advantages differentiation network effects`,
    `${idea.industry} SaaS product-led growth vs sales-led competition`,
    `${idea.industry} SaaS competitors list top companies`,
    `${idea.industry} SaaS market leaders challengers`,
    `${idea.industry} SaaS competitive intelligence analysis`,
  ];

  let competitorResearch = "";

  // Enhanced search with multiple strategies
  for (const query of searchQueries) {
    try {
      // Use web search service
      const searchResults = await crawlerService.search(query);
      for (const result of searchResults) {
        competitorResearch += `\n\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        if (result.extractedData) {
          competitorResearch += `Extracted Data: ${JSON.stringify(result.extractedData, null, 2)}\n`;
        }
      }

      // Use URL discovery for additional sources
      const discoveredUrls = await crawlerService.discoverCompetitorURLs(
        idea.name || idea.industry,
        idea.industry
      );
      for (const url of discoveredUrls.slice(0, 5)) {
        // Limit to top 5 URLs
        try {
          const crawlResult = await crawlerService.crawl(url);
          if (crawlResult.success && crawlResult.parsedContent) {
            competitorResearch += `\n\nDiscovered Competitor Source: ${url}\nContent: ${crawlResult.parsedContent.text}\n`;
          }
        } catch (error) {
          console.warn(
            `Failed to crawl discovered competitor URL ${url}:`,
            error
          );
        }
      }
    } catch (error) {
      console.warn(`Failed to search for query "${query}":`, error);
    }
  }

  // STEP 2: SEARCH FOR SPECIFIC COMPETITOR DATA
  console.log(
    "🔍 Competitor Discovery Agent: Searching for specific competitor data..."
  );
  try {
    const competitorSearchResults = await crawlerService.searchCompetitors(
      idea.name || idea.industry,
      idea.industry
    );
    for (const result of competitorSearchResults) {
      competitorResearch += `\n\nCompetitor Analysis Source: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
    }
  } catch (error) {
    console.warn("Failed to search for specific competitor data:", error);
  }

  // STEP 3: CRAWL COMPETITOR WEBSITES
  console.log("🔍 Competitor Discovery Agent: Crawling competitor websites...");
  const competitorNames = extractCompetitorNames(competitorResearch);

  for (const competitorName of competitorNames.slice(0, 8)) {
    // Limit to top 8 competitors
    try {
      // Search for competitor website
      const websiteSearchResults = await crawlerService.search(
        `${competitorName} official website`
      );
      const websiteUrl = websiteSearchResults[0]?.url;

      if (websiteUrl) {
        try {
          // Crawl competitor website
          const siteMap = await crawlerService.crawlSite(websiteUrl);
          const saasDataArray =
            await crawlerService.extractSaaSDataFromSite(websiteUrl);

          if (
            saasDataArray &&
            Array.isArray(saasDataArray) &&
            saasDataArray.length > 0
          ) {
            competitorResearch += `\n\nCOMPETITOR WEBSITE ANALYSIS - ${competitorName.toUpperCase()}:\n`;
            competitorResearch += `Website: ${websiteUrl}\n`;

            // Process all extracted data entries
            for (const dataEntry of saasDataArray) {
              if (dataEntry.extractedData) {
                const saasData = dataEntry.extractedData;
                if (saasData.company) {
                  competitorResearch += `Company Data: ${JSON.stringify(saasData.company, null, 2)}\n`;
                }
                if (saasData.pricing) {
                  competitorResearch += `Pricing Data: ${JSON.stringify(saasData.pricing, null, 2)}\n`;
                }
                if (saasData.features) {
                  competitorResearch += `Feature Data: ${JSON.stringify(saasData.features, null, 2)}\n`;
                }
                if (saasData.market) {
                  competitorResearch += `Market Data: ${JSON.stringify(saasData.market, null, 2)}\n`;
                }
              }
            }
          }
        } catch (error) {
          console.warn(
            `Failed to crawl competitor website ${websiteUrl}:`,
            error
          );
        }
      }
    } catch (error) {
      console.warn(`Failed to research competitor ${competitorName}:`, error);
    }
  }

  // STEP 4: SEARCH FOR CUSTOMER REVIEWS
  console.log(
    "🔍 Competitor Discovery Agent: Searching for customer reviews..."
  );
  for (const competitorName of competitorNames.slice(0, 5)) {
    // Limit to top 5 competitors
    try {
      const reviewResults =
        await crawlerService.searchCustomerReviews(competitorName);
      for (const result of reviewResults) {
        competitorResearch += `\n\nCUSTOMER REVIEWS - ${competitorName.toUpperCase()}:\n`;
        competitorResearch += `Source: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
      }
    } catch (error) {
      console.warn(
        `Failed to search for reviews for ${competitorName}:`,
        error
      );
    }
  }

  // STEP 5: CONDUCT DETAILED CUSTOMER RESEARCH FOR EACH COMPETITOR
  console.log(
    "🔍 Competitor Discovery Agent: Conducting customer research for competitors..."
  );

  const customerResearchAgent = new CustomerResearchAgent();
  const competitorCustomerResearch: any[] = [];

  for (const competitorName of competitorNames.slice(0, 5)) {
    // Limit to top 5 competitors
    try {
      console.log(`🔍 Researching customers for ${competitorName}...`);

      const customerData = await customerResearchAgent.researchCustomer(
        competitorName,
        idea.industry
      );

      competitorCustomerResearch.push({
        competitorName,
        customerData,
      });

      // Add customer research to competitor research
      competitorResearch += `\n\nCUSTOMER RESEARCH FOR ${competitorName.toUpperCase()}:\n`;
      competitorResearch += `Average Rating: ${customerData.averageRating?.toFixed(1) || "N/A"}\n`;
      competitorResearch += `Total Reviews: ${customerData.totalReviews || "N/A"}\n`;
      competitorResearch += `Feedback Summary: ${JSON.stringify(customerData.feedbackSummary || {})}\n`;
      competitorResearch += `Top Missing Features: ${customerData.topMissingFeatures?.map((f) => f.feature).join(", ") || "N/A"}\n`;
      competitorResearch += `Key Strengths: ${customerData.keyStrengths?.join(", ") || "N/A"}\n`;
      competitorResearch += `Key Weaknesses: ${customerData.keyWeaknesses?.join(", ") || "N/A"}\n`;
      competitorResearch += `Opportunities: ${customerData.opportunities?.join(", ") || "N/A"}\n`;
      competitorResearch += `Threats: ${customerData.threats?.join(", ") || "N/A"}\n`;
    } catch (error) {
      console.warn(
        `Failed to research customers for ${competitorName}:`,
        error
      );
    }
  }

  // STEP 2: GENERATE STRUCTURED COMPETITOR DATA
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

            // Customer Research Data
            customerResearch: z
              .object({
                averageRating: z.number().optional(),
                totalReviews: z.number().optional(),
                feedbackSummary: z
                  .object({
                    positive: z.number().optional(),
                    negative: z.number().optional(),
                    neutral: z.number().optional(),
                  })
                  .optional(),
                topMissingFeatures: z.array(z.string()).optional(),
                keyStrengths: z.array(z.string()).optional(),
                keyWeaknesses: z.array(z.string()).optional(),
                opportunities: z.array(z.string()).optional(),
                threats: z.array(z.string()).optional(),
                researchQuality: z
                  .object({
                    confidence: z.number().optional(),
                    coverage: z.number().optional(),
                  })
                  .optional(),
              })
              .optional(),
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

RESEARCH FINDINGS:
${competitorResearch}

ORIGINAL IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

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
      differentiationOpportunities: ["Conduct comprehensive competitive analysis"],
      competitiveAdvantage: "Competitive analysis needed",
      strategicRecommendations: ["Complete competitive research", "Analyze market positioning"],
      dataQuality: "LOW" as const,
      dataGaps: ["Competitor profiles", "Market positioning data", "Competitive intelligence"],
    };
  }

  console.log("✅ Competitor Discovery Agent: Completed competitor analysis");

  // STEP 4: ENHANCE COMPETITOR DATA WITH CUSTOMER RESEARCH
  if (competitorData.competitors && competitorCustomerResearch.length > 0) {
    console.log("🔍 Enhancing competitor data with customer research...");

    for (const competitor of competitorData.competitors) {
      const customerResearch = competitorCustomerResearch.find(
        (cr) =>
          cr.competitorName.toLowerCase() === competitor.name.toLowerCase()
      );

      if (customerResearch) {
        const customerData = customerResearch.customerData;
        competitor.customerResearch = {
          averageRating: customerData.averageRating,
          totalReviews: customerData.totalReviews,
          feedbackSummary: customerData.feedbackSummary,
          topMissingFeatures:
            customerData.topMissingFeatures?.map((f: any) => f.feature) || [],
          keyStrengths: customerData.keyStrengths || [],
          keyWeaknesses: customerData.keyWeaknesses || [],
          opportunities: customerData.opportunities || [],
          threats: customerData.threats || [],
          researchQuality: {
            confidence: customerData.researchQuality?.confidence,
            coverage: customerData.researchQuality?.coverage,
          },
        };
      }
    }
  }

  // Cleanup services
  if (shouldDestroyCrawler) {
    crawlerService.destroy();
  }

  return {
    competitorData,
    researchText: competitorResearch,
    customerResearchData: competitorCustomerResearch,
    agentType: "competitor-discovery",
    timestamp: new Date(),
    originalIdeaId: idea.id,
  };
};
