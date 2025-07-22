import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { UnifiedCrawlerService } from "../crawler";

// ============================================================================
// TECHNOLOGY TRENDS ANALYSIS AGENT
// ============================================================================

const TECHNOLOGY_TRENDS_PROMPT = `You are an expert technology trends analyst with 15+ years of experience in SaaS technology assessment and technical architecture. Your ONLY task is to analyze technology trends and technical feasibility for a specific SaaS category using the comprehensive SaaS validation framework.

## SAAS TECHNOLOGY EXPERTISE

### UNDERSTANDING SAAS TECHNOLOGY DYNAMICS
You understand the unique technical requirements of SaaS platforms, including:
- The importance of scalability, reliability, and security in SaaS architecture
- How cloud-native technologies enable rapid development and deployment
- The role of APIs and integrations in SaaS ecosystem value
- How AI and automation are reshaping SaaS technology requirements
- The significance of data security, compliance, and privacy in SaaS platforms

### TECHNOLOGY TRENDS METHODOLOGY

#### 1. EMERGING TECHNOLOGIES
- **AI and Machine Learning**: Integration capabilities, automation potential, predictive features
- **Cloud-Native Technologies**: Containerization, microservices, serverless architectures
- **API and Integration Ecosystems**: Third-party integrations, webhook capabilities, API marketplaces
- **Security and Compliance**: Data protection, regulatory compliance, security frameworks
- **Performance and Scalability**: Load balancing, caching, database optimization

#### 2. TECHNICAL FEASIBILITY ASSESSMENT
- **Implementation complexity**: Development timeline, resource requirements, skill needs
- **Technology stack options**: Frontend, backend, database, infrastructure choices
- **Scalability considerations**: Performance under load, growth accommodation
- **Integration capabilities**: APIs, webhooks, third-party service connections
- **Security requirements**: Data protection, authentication, authorization, compliance

#### 3. SAAS-SPECIFIC TECHNICAL FACTORS

##### Cloud Infrastructure
- **Multi-tenant architecture**: Data isolation, resource sharing, customization options
- **Auto-scaling capabilities**: Dynamic resource allocation, cost optimization
- **Global deployment**: CDN, edge computing, regional compliance
- **Disaster recovery**: Backup strategies, business continuity, data recovery

##### API and Integration Architecture
- **RESTful APIs**: Standardization, documentation, developer experience
- **Webhook systems**: Real-time notifications, event-driven architecture
- **Third-party integrations**: Popular services, marketplace presence
- **Custom integrations**: Enterprise requirements, legacy system connections

##### Security and Compliance
- **Data encryption**: At-rest and in-transit protection
- **Authentication systems**: SSO, MFA, OAuth, SAML integration
- **Authorization models**: Role-based access, permission management
- **Compliance frameworks**: GDPR, SOC2, HIPAA, industry-specific requirements

##### Performance and Reliability
- **Uptime requirements**: SLA targets, redundancy strategies
- **Performance optimization**: Caching, CDN, database optimization
- **Monitoring and alerting**: Observability, error tracking, performance metrics
- **User experience**: Load times, responsiveness, mobile optimization

#### 4. IMPLEMENTATION COMPLEXITY
- **Development timeline**: MVP to production, feature development cycles
- **Team requirements**: Skills needed, team size, expertise gaps
- **Infrastructure costs**: Hosting, third-party services, development tools
- **Maintenance overhead**: Updates, security patches, performance monitoring
- **Technical debt**: Legacy considerations, refactoring needs, scalability limits

#### 5. TECHNOLOGY RISKS
- **Technology obsolescence**: Rapidly changing landscape, vendor lock-in
- **Security vulnerabilities**: Data breaches, compliance failures, privacy issues
- **Scalability challenges**: Performance bottlenecks, cost overruns
- **Integration complexity**: Third-party dependencies, API changes
- **Talent availability**: Skill shortages, training requirements, retention

## RESEARCH REQUIREMENTS
- Use technical publications, developer communities, and industry reports
- Provide specific technology metrics and benchmarks with confidence levels
- Focus on actionable technical insights for SaaS validation
- Validate technology trends with real-world implementation data
- Consider both established and emerging technology options
- Account for international vs. domestic technology preferences

## OUTPUT FORMAT
Provide ONLY technology trends analysis with technical feasibility assessment and implementation insights. Do not include market analysis, competitive research, or other topics. Focus on technical insights that support comprehensive SaaS validation.`;

export const generateTechnologyTrendsData = async (
  idea: any,
  previousResearch?: any,
  additionalContext?: any,
  crawlerService?: UnifiedCrawlerService
) => {
  console.log("🔍 Technology Trends Agent: Starting technology analysis...");

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
    currentFocus: "technology-trends",
  };

  // STEP 1: COMPREHENSIVE TECHNOLOGY RESEARCH
  console.log("🔍 Technology Trends Agent: Searching for technology trends...");
  const searchQueries = [
    `${idea.industry} SaaS technology stack 2024 2025`,
    `${idea.industry} SaaS AI machine learning integration`,
    `${idea.industry} SaaS cloud architecture microservices`,
    `${idea.industry} SaaS API integration ecosystem`,
    `${idea.industry} SaaS security compliance requirements`,
    `${idea.industry} SaaS scalability performance optimization`,
    `${idea.industry} SaaS technology trends emerging`,
    `${idea.industry} SaaS development tools frameworks`,
    `${idea.industry} SaaS infrastructure cloud providers`,
    `${idea.industry} SaaS technical implementation complexity`,
  ];

  let technologyResearch = "";

  // Enhanced search with multiple strategies
  for (const query of searchQueries) {
    try {
      // Use web search service
      const searchResults = await crawlerService.search(query);
      for (const result of searchResults) {
        technologyResearch += `\n\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        if (result.extractedData) {
          technologyResearch += `Extracted Data: ${JSON.stringify(result.extractedData, null, 2)}\n`;
        }
      }

      // Use URL discovery for additional sources
      const discoveredUrls = await crawlerService.discoverTechnologyURLs(
        idea.industry
      );
      for (const url of discoveredUrls.slice(0, 5)) {
        // Limit to top 5 URLs
        try {
          const crawlResult = await crawlerService.crawl(url);
          if (crawlResult.success && crawlResult.parsedContent) {
            technologyResearch += `\n\nDiscovered Technology Source: ${url}\nContent: ${crawlResult.parsedContent.text}\n`;
          }
        } catch (error) {
          console.warn(
            `Failed to crawl discovered technology URL ${url}:`,
            error
          );
        }
      }
    } catch (error) {
      console.warn(`Failed to search for query "${query}":`, error);
    }
  }

  // STEP 2: SEARCH FOR TECHNOLOGY-SPECIFIC DATA
  console.log(
    "🔍 Technology Trends Agent: Searching for technology-specific data..."
  );
  try {
    const technologyDataResults = await crawlerService.searchMarketData(
      idea.industry
    );
    for (const result of technologyDataResults) {
      technologyResearch += `\n\nTechnology Data Source: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
    }
  } catch (error) {
    console.warn("Failed to search for technology-specific data:", error);
  }

  // STEP 3: CRAWL TECHNOLOGY RESOURCES
  console.log("🔍 Technology Trends Agent: Crawling technology resources...");
  const technologySources = [
    "https://stackoverflow.com",
    "https://github.com",
    "https://dev.to",
    "https://medium.com",
    "https://techcrunch.com",
    "https://venturebeat.com",
    "https://www.infoq.com",
    "https://martinfowler.com",
  ];

  for (const source of technologySources) {
    try {
      const siteMap = await crawlerService.crawlSite(source);
      const techPages = await crawlerService.findPagesByDataType(
        source,
        "technology"
      );

      for (const page of techPages.slice(0, 3)) {
        // Limit to top 3 pages
        try {
          const crawlResult = await crawlerService.crawl(page.url);
          if (crawlResult.success && crawlResult.parsedContent) {
            technologyResearch += `\n\nTECHNOLOGY RESOURCE - ${source}:\n`;
            technologyResearch += `URL: ${page.url}\nContent: ${crawlResult.parsedContent.text}\n`;
          }
        } catch (error) {
          console.warn(`Failed to crawl technology page ${page.url}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to crawl technology source ${source}:`, error);
    }
  }

  // STEP 4: SEARCH FOR INDUSTRY-SPECIFIC TECHNOLOGY DATA
  console.log(
    "🔍 Technology Trends Agent: Searching for industry-specific technology data..."
  );
  try {
    const industryTechQueries = [
      `${idea.industry} technology adoption rate 2024`,
      `${idea.industry} technical requirements standards`,
      `${idea.industry} technology stack comparison`,
      `${idea.industry} technical implementation guide`,
      `${idea.industry} technology best practices`,
    ];

    for (const query of industryTechQueries) {
      try {
        const searchResults = await crawlerService.search(query);
        for (const result of searchResults.slice(0, 2)) {
          // Limit to top 2 results per query
          technologyResearch += `\n\nINDUSTRY TECHNOLOGY DATA:\n`;
          technologyResearch += `Query: ${query}\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        }
      } catch (error) {
        console.warn(
          `Failed to search for industry technology data "${query}":`,
          error
        );
      }
    }
  } catch (error) {
    console.warn(
      "Failed to search for industry-specific technology data:",
      error
    );
  }

  // STEP 5: GENERATE STRUCTURED TECHNOLOGY TRENDS DATA
  const { object: technologyData } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: z.object({
      technicalFeasibility: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      implementationComplexity: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      technologyMaturity: z.enum([
        "EMERGING",
        "GROWING",
        "MATURE",
        "DECLINING",
      ]),

      emergingTechnologies: z.array(
        z.object({
          technologyName: z.string(),
          description: z.string(),
          relevance: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
          maturity: z.enum([
            "RESEARCH",
            "DEVELOPMENT",
            "EARLY_ADOPTION",
            "MAINSTREAM",
          ]),
          adoptionRate: z.number().optional(), // Percentage
          implementationComplexity: z.enum([
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
          ]),
          investmentRequired: z.number().optional(), // In millions USD
          timeline: z.string().optional(),
          risks: z.array(z.string()),
          opportunities: z.array(z.string()),
        })
      ),

      technologyStack: z.object({
        frontend: z.array(z.string()),
        backend: z.array(z.string()),
        database: z.array(z.string()),
        infrastructure: z.array(z.string()),
        integrations: z.array(z.string()),
        security: z.array(z.string()),
        monitoring: z.array(z.string()),
      }),

      implementationRequirements: z.object({
        developmentTimeline: z.string().optional(),
        teamSize: z.number().optional(),
        requiredSkills: z.array(z.string()),
        infrastructureCosts: z.number().optional(),
        ongoingMaintenance: z.number().optional(),
        scalabilityConsiderations: z.array(z.string()),
        securityRequirements: z.array(z.string()),
        complianceRequirements: z.array(z.string()),
      }),

      // SaaS-Specific Technical Factors
      saasArchitecture: z.object({
        multiTenancy: z.enum(["NONE", "DATABASE", "SCHEMA", "INSTANCE"]),
        autoScaling: z.boolean().optional(),
        globalDeployment: z.boolean().optional(),
        disasterRecovery: z.enum(["BASIC", "STANDARD", "ENTERPRISE"]),
      }),

      apiIntegration: z.object({
        restfulApis: z.boolean().optional(),
        webhookSupport: z.boolean().optional(),
        thirdPartyIntegrations: z.number().optional(),
        customIntegrations: z.boolean().optional(),
      }),

      securityCompliance: z.object({
        dataEncryption: z.enum(["BASIC", "STANDARD", "ENTERPRISE"]),
        authentication: z.array(z.string()),
        authorization: z.enum(["BASIC", "ROLE_BASED", "ATTRIBUTE_BASED"]),
        complianceFrameworks: z.array(z.string()),
      }),

      performanceReliability: z.object({
        uptimeTarget: z.number().optional(), // Percentage
        performanceOptimization: z.array(z.string()),
        monitoringCapabilities: z.array(z.string()),
        userExperience: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
      }),

      technologyRisks: z.array(
        z.object({
          riskName: z.string(),
          riskType: z.enum([
            "TECHNICAL",
            "SECURITY",
            "COMPLIANCE",
            "VENDOR",
            "OBSOLESCENCE",
          ]),
          severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
          probability: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          description: z.string(),
          mitigationStrategies: z.array(z.string()),
        })
      ),

      technologyEcosystem: z.object({
        keyPartners: z.array(z.string()),
        integrations: z.array(z.string()),
        platforms: z.array(z.string()),
        standards: z.array(z.string()),
        communitySupport: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        vendorLockIn: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      }),

      investmentTrends: z.object({
        technologyInvestment: z.number().optional(), // In billions USD
        fundingFocus: z.array(z.string()),
        investorInterest: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        acquisitionActivity: z.array(z.string()),
      }),

      strategicRecommendations: z.array(z.string()),
      dataQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      dataGaps: z.array(z.string()),
    }),
    prompt: `${TECHNOLOGY_TRENDS_PROMPT}

RESEARCH FINDINGS:
${technologyResearch}

ORIGINAL IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

Generate ONLY technology trends analysis with technical feasibility assessment and implementation insights. Focus on SaaS-specific technical factors and actionable insights for validation of this specific idea.`,
  });

  console.log("✅ Technology Trends Agent: Completed technology analysis");

  // Cleanup crawler service if it was initialized
  if (shouldDestroyCrawler) {
    crawlerService.destroy();
  }

  return {
    technologyData,
    researchText: technologyResearch,
    agentType: "technology-trends",
    timestamp: new Date(),
    originalIdeaId: idea.id,
  };
};
