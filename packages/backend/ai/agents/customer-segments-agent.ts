import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { UnifiedCrawlerService } from "../crawler";

// ============================================================================
// CUSTOMER SEGMENTS ANALYSIS AGENT
// ============================================================================

const CUSTOMER_SEGMENTS_PROMPT = `You are an expert customer segmentation analyst with 15+ years of experience in SaaS target audience analysis and customer success. Your ONLY task is to identify and analyze customer segments for a specific SaaS category using the comprehensive SaaS validation framework.

## SAAS CUSTOMER SEGMENTATION EXPERTISE

### UNDERSTANDING SAAS CUSTOMER DYNAMICS
You understand the unique characteristics of SaaS customers, including:
- The importance of product-market fit and customer success in SaaS
- How customer acquisition costs (CAC) and lifetime value (LTV) drive SaaS economics
- The role of product-led growth and self-service onboarding in customer acquisition
- How customer retention and expansion revenue impact SaaS unit economics
- The significance of customer feedback loops and iterative product development

### CUSTOMER SEGMENTATION METHODOLOGY

#### 1. SEGMENT IDENTIFICATION
- **Primary target segments**: Immediate focus with highest potential
- **Secondary segments**: Expansion opportunities after primary validation
- **Adjacent segments**: Future growth potential in related markets
- **Excluded segments**: Not suitable due to budget, needs, or competitive factors
- **Segment overlap**: Potential cannibalization and cross-selling opportunities

#### 2. SEGMENT PROFILING
- **Demographics**: Age, location, company size, industry vertical
- **Psychographics**: Values, attitudes, work styles, technology preferences
- **Technographics**: Tech adoption, platform preferences, integration needs
- **Firmographics**: Company size, industry, role, budget authority, decision-making power
- **Behavioral patterns**: Usage patterns, decision-making processes, adoption barriers

#### 3. PAIN POINT ANALYSIS
- **Primary pain points**: Core problems that drive immediate need
- **Secondary pain points**: Related frustrations and workflow issues
- **Latent needs**: Problems customers don't yet realize they have
- **Future pain points**: Emerging challenges due to market changes
- **Pain point intensity**: Frequency, severity, and willingness to pay

#### 4. DECISION-MAKING ANALYSIS
- **Decision-making process**: How customers evaluate and purchase SaaS solutions
- **Key decision makers**: Roles, responsibilities, and influence levels
- **Evaluation criteria**: Technical requirements, business value, security, compliance
- **Budget constraints**: Approval processes, spending authority, ROI requirements
- **Risk tolerance**: Adoption barriers, switching costs, implementation concerns

#### 5. SAAS-SPECIFIC SEGMENT FACTORS

##### Product-Led Growth Readiness
- **Self-service capability**: Ability to try and adopt without sales intervention
- **Viral potential**: Likelihood to share and recommend to others
- **Freemium conversion**: Potential to upgrade from free to paid tiers
- **Expansion revenue**: Opportunities for upsells and cross-sells

##### Customer Success Factors
- **Onboarding complexity**: Time and effort to achieve first value
- **Feature adoption**: Likelihood to use advanced features
- **Support needs**: Preferred support channels and response expectations
- **Success metrics**: How customers measure value and ROI

##### Retention and Churn Factors
- **Switching costs**: Barriers to leaving the platform
- **Integration depth**: How embedded the solution becomes in workflows
- **Network effects**: Value derived from other users on the platform
- **Expansion opportunities**: Potential for account growth over time

## RESEARCH REQUIREMENTS
- Use multiple research methods (surveys, interviews, market data, competitor analysis)
- Provide specific demographics and firmographics with confidence levels
- Focus on actionable segment insights for SaaS validation
- Validate segments with real market data and customer feedback
- Consider both B2B and B2C SaaS customer dynamics
- Account for international vs. domestic customer preferences

## OUTPUT FORMAT
Provide ONLY customer segmentation analysis with detailed profiles, pain points, and decision-making insights. Do not include market size analysis, competitive research, or other topics. Focus on customer insights that support comprehensive SaaS validation.`;

export const generateCustomerSegmentsData = async (
  idea: any,
  previousResearch?: any,
  additionalContext?: any,
  crawlerService?: UnifiedCrawlerService
) => {
  console.log(
    "🔍 Customer Segments Agent: Starting customer segmentation analysis..."
  );

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
    currentFocus: "customer-segmentation",
  };

  // STEP 1: COMPREHENSIVE CUSTOMER RESEARCH
  console.log("🔍 Customer Segments Agent: Searching for customer data...");
  const searchQueries = [
    `${idea.industry} SaaS customer segments target audience 2024`,
    `${idea.industry} SaaS user demographics company size industry`,
    `${idea.industry} SaaS customer pain points challenges needs`,
    `${idea.industry} SaaS customer feedback reviews testimonials`,
    `${idea.industry} SaaS customer success stories case studies`,
    `${idea.industry} SaaS customer acquisition onboarding process`,
    `${idea.industry} SaaS customer retention churn analysis`,
    `${idea.industry} SaaS customer decision making process`,
    `${idea.industry} SaaS customer budget spending patterns`,
    `${idea.industry} SaaS customer technology adoption preferences`,
  ];

  let customerResearch = "";

  // Enhanced search with multiple strategies
  for (const query of searchQueries) {
    try {
      // Use web search service
      const searchResults = await crawlerService.search(query);
      for (const result of searchResults) {
        customerResearch += `\n\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        if (result.extractedData) {
          customerResearch += `Extracted Data: ${JSON.stringify(result.extractedData, null, 2)}\n`;
        }
      }

      // Use URL discovery for additional sources
      const discoveredUrls = await crawlerService.discoverURLs(query);
      for (const url of discoveredUrls.slice(0, 5)) {
        // Limit to top 5 URLs
        try {
          const crawlResult = await crawlerService.crawl(url);
          if (crawlResult.success && crawlResult.parsedContent) {
            customerResearch += `\n\nDiscovered Customer Source: ${url}\nContent: ${crawlResult.parsedContent.text}\n`;
          }
        } catch (error) {
          console.warn(
            `Failed to crawl discovered customer URL ${url}:`,
            error
          );
        }
      }
    } catch (error) {
      console.warn(`Failed to search for query "${query}":`, error);
    }
  }

  // STEP 2: SEARCH FOR CUSTOMER REVIEWS AND FEEDBACK
  console.log("🔍 Customer Segments Agent: Searching for customer reviews...");
  try {
    // Get competitor names from previous research if available
    const competitorAgent = previousResearch?.find(
      (a: any) => a.type === "competitor-discovery"
    );
    const competitorNames =
      competitorAgent?.data?.competitors?.map((c: any) => c.name) || [];

    // Add some common SaaS companies in the industry
    const commonCompetitors = [
      "Slack",
      "Notion",
      "Figma",
      "Linear",
      "Stripe",
      "Shopify",
    ];
    const allCompetitors = [...competitorNames, ...commonCompetitors];

    for (const competitorName of allCompetitors.slice(0, 8)) {
      try {
        const reviewResults =
          await crawlerService.searchCustomerReviews(competitorName);
        for (const result of reviewResults.slice(0, 3)) {
          // Limit to top 3 reviews per competitor
          customerResearch += `\n\nCUSTOMER REVIEW - ${competitorName.toUpperCase()}:\n`;
          customerResearch += `Source: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        }
      } catch (error) {
        console.warn(
          `Failed to search for reviews for ${competitorName}:`,
          error
        );
      }
    }
  } catch (error) {
    console.warn("Failed to search for customer reviews:", error);
  }

  // STEP 3: CRAWL CUSTOMER SUCCESS STORIES
  console.log(
    "🔍 Customer Segments Agent: Crawling customer success stories..."
  );
  const successStorySources = [
    "https://www.g2.com",
    "https://www.capterra.com",
    "https://www.trustradius.com",
    "https://www.producthunt.com",
    "https://www.indiehackers.com",
  ];

  for (const source of successStorySources) {
    try {
      const siteMap = await crawlerService.crawlSite(source);
      const customerPages = await crawlerService.findPagesByDataType(
        source,
        "customer"
      );

      for (const page of customerPages.slice(0, 3)) {
        // Limit to top 3 pages
        try {
          const crawlResult = await crawlerService.crawl(page.url);
          if (crawlResult.success && crawlResult.parsedContent) {
            customerResearch += `\n\nCUSTOMER SUCCESS STORY - ${source}:\n`;
            customerResearch += `URL: ${page.url}\nContent: ${crawlResult.parsedContent.text}\n`;
          }
        } catch (error) {
          console.warn(`Failed to crawl customer page ${page.url}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to crawl customer success source ${source}:`, error);
    }
  }

  // STEP 4: SEARCH FOR INDUSTRY-SPECIFIC CUSTOMER DATA
  console.log(
    "🔍 Customer Segments Agent: Searching for industry-specific customer data..."
  );
  try {
    const industryCustomerQueries = [
      `${idea.industry} customer demographics 2024`,
      `${idea.industry} customer behavior analysis`,
      `${idea.industry} customer satisfaction survey`,
      `${idea.industry} customer needs assessment`,
      `${idea.industry} customer journey mapping`,
    ];

    for (const query of industryCustomerQueries) {
      try {
        const searchResults = await crawlerService.search(query);
        for (const result of searchResults.slice(0, 2)) {
          // Limit to top 2 results per query
          customerResearch += `\n\nINDUSTRY CUSTOMER DATA:\n`;
          customerResearch += `Query: ${query}\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        }
      } catch (error) {
        console.warn(
          `Failed to search for industry customer data "${query}":`,
          error
        );
      }
    }
  } catch (error) {
    console.warn(
      "Failed to search for industry-specific customer data:",
      error
    );
  }

  // STEP 5: GENERATE STRUCTURED CUSTOMER SEGMENTS DATA
  const { object: segmentsData } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: z.object({
      totalAddressableCustomers: z.number().optional(),
      primarySegments: z.number().optional(),

      segments: z.array(
        z.object({
          segmentName: z.string(),
          segmentType: z.enum(["PRIMARY", "SECONDARY", "ADJACENT", "EXCLUDED"]),

          // Demographics
          ageRange: z.string().optional(),
          location: z.string().optional(),
          companySize: z
            .enum([
              "SOLO",
              "SMALL_1_10",
              "MEDIUM_11_50",
              "LARGE_51_200",
              "ENTERPRISE_200_PLUS",
            ])
            .optional(),
          industry: z.string().optional(),
          role: z.string().optional(),

          // Segment Metrics
          estimatedSize: z.number().optional(),
          growthRate: z.number().optional(),
          averageSpend: z.number().optional(),
          customerLifetimeValue: z.number().optional(),
          customerAcquisitionCost: z.number().optional(),

          // Pain Points
          primaryPainPoints: z.array(z.string()),
          secondaryPainPoints: z.array(z.string()),
          latentNeeds: z.array(z.string()),
          painPointIntensity: z.number().optional(), // 1-10 scale

          // Decision Making
          decisionFactors: z.array(z.string()),
          decisionTimeline: z.string().optional(),
          keyDecisionMakers: z.array(z.string()),
          budgetRange: z.string().optional(),
          approvalProcess: z.string().optional(),

          // Behavior & Preferences
          techSavviness: z.enum([
            "BEGINNER",
            "INTERMEDIATE",
            "ADVANCED",
            "EXPERT",
          ]),
          platformPreferences: z.array(z.string()),
          integrationNeeds: z.array(z.string()),
          supportPreferences: z.array(z.string()),

          // SaaS-Specific Factors
          productLedGrowthReady: z.boolean().optional(),
          selfServiceCapability: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          viralPotential: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          freemiumConversion: z.number().optional(), // Percentage
          expansionRevenue: z.number().optional(), // Percentage

          // Customer Success
          onboardingComplexity: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          featureAdoption: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          supportNeeds: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          retentionPotential: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

          // Competitive Analysis
          currentSolutions: z.array(z.string()),
          switchingBarriers: z.array(z.string()),
          competitiveAdvantages: z.array(z.string()),

          // Validation
          segmentValue: z.number().optional(),
          accessibility: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          priority: z.number(), // 1-5 scale
          confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        })
      ),

      // Cross-Segment Analysis
      segmentOverlap: z.array(z.string()),
      cannibalizationRisks: z.array(z.string()),
      expansionOpportunities: z.array(z.string()),

      // Strategic Insights
      goToMarketStrategy: z.array(z.string()),
      messagingRecommendations: z.array(z.string()),
      pricingStrategy: z.array(z.string()),

      dataQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      dataGaps: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    prompt: `Based on the customer segmentation research and SaaS validation framework, generate structured customer segments data.

RESEARCH FINDINGS:
${customerResearch}

ORIGINAL IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

Generate ONLY customer segmentation analysis with detailed profiles, pain points, and decision-making insights. Focus on SaaS-specific customer factors and actionable insights for validation of this specific idea.`,
  });

  console.log(
    "✅ Customer Segments Agent: Completed customer segmentation analysis"
  );

  // Cleanup crawler service if it was initialized
  if (shouldDestroyCrawler) {
    crawlerService.destroy();
  }

  return {
    segmentsData,
    researchText: customerResearch,
    agentType: "customer-segments",
    timestamp: new Date(),
    originalIdeaId: idea.id,
  };
};
