import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { allTools } from "../tools";

// ============================================================================
// TECHNOLOGY TRENDS RESEARCH PROMPT (for generateText with tools)
// ============================================================================

const TECHNOLOGY_TRENDS_RESEARCH_PROMPT = `You are an expert technology analyst with 15+ years of experience in SaaS technology trends and technical feasibility analysis. Your task is to conduct comprehensive research on technology trends and technical feasibility for a specific SaaS idea.

## RESEARCH OBJECTIVES

### PRIMARY RESEARCH AREAS
1. **Technology Stack Analysis**: Research current and emerging technologies relevant to the SaaS idea
2. **Technical Complexity Assessment**: Understand the technical requirements and complexity
3. **Cost Analysis**: Research development, infrastructure, and operational costs
4. **Competitive Technology Landscape**: Analyze what technologies competitors are using
5. **Trend Analysis**: Identify emerging technology trends in the relevant domain

### RESEARCH METHODOLOGY

#### STEP 1: TECHNOLOGY STACK RESEARCH
- Search for current technology stacks used in similar SaaS products
- Research emerging technologies that could be relevant
- Look for case studies and technical implementations
- Analyze technology choices and their trade-offs

#### STEP 2: COMPETITIVE TECHNOLOGY ANALYSIS
- Research competitors' technology stacks and approaches
- Analyze their technical architecture and choices
- Identify technology gaps and opportunities
- Research their development timelines and costs

#### STEP 3: TREND RESEARCH
- Research current technology trends in the domain
- Look for emerging technologies and frameworks
- Analyze adoption rates and community sentiment
- Research future technology predictions

#### STEP 4: COST AND COMPLEXITY RESEARCH
- Research development costs for similar projects
- Analyze infrastructure and operational costs
- Research team requirements and skill sets
- Look for case studies on project timelines

### TOOL USAGE STRATEGY

#### SEARCH TOOLS
- Use `search` for broad technology research queries
- Use `searchDetailed` for comprehensive analysis of specific topics
- Use `research` for in-depth investigation of technology trends

#### SCRAPING TOOLS
- Use `scrapeUrl` to extract detailed information from technical blogs, documentation, and case studies
- Use `scrapeMultipleUrls` to gather information from multiple sources efficiently

#### RESEARCH TOOLS
- Use `competitorResearch` to analyze competitors' technology approaches
- Use `trendResearch` to understand current and emerging technology trends
- Use `sentimentAnalysis` to gauge community sentiment about specific technologies
- Use `multiQueryResearch` to investigate multiple related technology aspects

### RESEARCH QUERIES TO EXECUTE

Based on the SaaS idea, you should research:

1. **Technology Stack Queries**:
   - "technology stack for [similar SaaS product]"
   - "best technologies for [specific feature]"
   - "[technology] vs [alternative] comparison"

2. **Competitive Analysis Queries**:
   - "competitors of [similar product] technology stack"
   - "[competitor name] technology architecture"
   - "how [competitor] built their platform"

3. **Trend Research Queries**:
   - "emerging technologies in [domain] 2024"
   - "technology trends for [specific feature]"
   - "future of [technology] in SaaS"

4. **Cost and Complexity Queries**:
   - "development costs for [similar project]"
   - "infrastructure costs for [technology stack]"
   - "team requirements for [technology]"

### OUTPUT REQUIREMENTS

After conducting comprehensive research, provide:

1. **Research Summary**: A detailed summary of all findings
2. **Technology Insights**: Key insights about relevant technologies
3. **Cost Analysis**: Research findings on costs and complexity
4. **Trend Analysis**: Current and emerging technology trends
5. **Competitive Intelligence**: Technology insights from competitors
6. **Recommendations**: Technology recommendations based on research

Focus on gathering factual, up-to-date information that will inform the technical feasibility assessment. Use multiple sources and cross-reference information for accuracy.`;

// ============================================================================
// TECHNOLOGY TRENDS ANALYSIS PROMPT (for generateObject)
// ============================================================================

const TECHNOLOGY_TRENDS_ANALYSIS_PROMPT = `You are an expert technology analyst with 15+ years of experience in SaaS technology trends and technical feasibility analysis. Your task is to analyze the research data and provide structured technology trends analysis for a specific SaaS idea.

## ANALYSIS FRAMEWORK

### TECHNICAL COMPLEXITY ASSESSMENT
- **Core Technology Stack**: Required technologies and frameworks based on research
- **Integration Requirements**: Third-party services and APIs identified
- **Scalability Needs**: Performance and growth requirements
- **Security Considerations**: Data protection and compliance requirements
- **Development Timeline**: Realistic timeframes based on research

### TECHNOLOGY TRENDS EVALUATION
- **Emerging Technologies**: AI, ML, blockchain, edge computing trends
- **Platform Evolution**: Cloud platforms, serverless, containers
- **Integration Trends**: API ecosystems, webhooks, real-time data
- **Security Trends**: Zero-trust, encryption, compliance frameworks
- **Performance Trends**: Optimization, caching, CDN strategies

### TECHNICAL FEASIBILITY ANALYSIS
- **Team Requirements**: Skills, experience, and size needed
- **Infrastructure Costs**: Cloud services, hosting, and maintenance
- **Development Costs**: Tools, licenses, and third-party services
- **Operational Costs**: Monitoring, support, and maintenance
- **Technical Risks**: Complexity, dependencies, and failure points

### COMPETITIVE TECHNICAL ADVANTAGES
- **Technology Differentiation**: Unique technical capabilities
- **Performance Advantages**: Speed, reliability, scalability
- **Integration Advantages**: Ecosystem and API capabilities
- **Security Advantages**: Data protection and compliance
- **Innovation Potential**: Future technology opportunities

## ANALYSIS REQUIREMENTS
- Use the research data provided to inform all assessments
- Focus on SaaS-specific technology patterns and best practices
- Consider cloud-native architecture and scalability requirements
- Analyze AI/ML integration opportunities and challenges
- Evaluate security and compliance requirements
- Assess development complexity and resource requirements
- Consider integration ecosystem and API capabilities

## OUTPUT FORMAT
Provide ONLY technology trends analysis with technical feasibility assessment, cost analysis, and strategic recommendations. Structure the data according to the specified schema.`;

export const generateTechnologyTrendsData = async (
  idea: any,
  previousResearch?: any,
  additionalContext?: any
) => {
  console.log("🔍 Technology Trends Agent: Starting technology analysis...");

  // Build comprehensive context from previous research and additional data
  const researchContext = {
    originalIdea: idea,
    previousResearch: previousResearch || {},
    additionalContext: additionalContext || {},
    currentFocus: "technology-trends-analysis",
  };

  try {
    // STEP 1: CONDUCT RESEARCH USING generateText WITH TOOLS
    console.log("🔍 Technology Trends Agent: Conducting research with tools...");

    const { text: researchResults } = await generateText({
     model: google("gemini-2.0-flash", {
        useSearchGrounding: true,
      }),
      tools: allTools,
      maxSteps: 100,
      toolChoice: "required",
      prompt: `${TECHNOLOGY_TRENDS_RESEARCH_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

CONDUCT COMPREHENSIVE RESEARCH:
1. Start with technology stack research for similar SaaS products
2. Research competitive technology landscapes
3. Analyze current and emerging technology trends
4. Research development costs and complexity
5. Gather insights on team requirements and timelines

Use the available tools to gather comprehensive, up-to-date information. Focus on factual data and real-world examples. Provide detailed research findings that will inform the technical feasibility assessment.`,
    });

    console.log("✅ Technology Trends Agent: Research completed");

    // STEP 2: GENERATE STRUCTURED DATA USING generateObject
    console.log("🔍 Technology Trends Agent: Generating structured data...");

    const { object: technologyData } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        technicalComplexity: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        developmentTimeline: z.string().optional(),
        teamRequirements: z.array(z.string()),
        recommendedStack: z.array(z.string()),
        alternativeStacks: z.array(z.array(z.string())),

        // Technology Trends
        emergingTechnologies: z.array(z.string()),
        platformTrends: z.array(z.string()),
        integrationTrends: z.array(z.string()),
        securityTrends: z.array(z.string()),
        performanceTrends: z.array(z.string()),

        // Technical Requirements
        integrationRequirements: z.array(z.string()),
        apiRequirements: z.array(z.string()),
        securityRequirements: z.array(z.string()),
        complianceRequirements: z.array(z.string()),
        scalabilityRequirements: z.array(z.string()),

        // Cost Analysis
        developmentCosts: z.number().optional(),
        infrastructureCosts: z.number().optional(),
        maintenanceCosts: z.number().optional(),
        thirdPartyCosts: z.array(z.string()),
        operationalCosts: z.array(z.string()),

        // Technical Risks
        technicalRisks: z.array(z.string()),
        scalabilityChallenges: z.array(z.string()),
        securityConsiderations: z.array(z.string()),
        integrationChallenges: z.array(z.string()),
        performanceChallenges: z.array(z.string()),

        // Competitive Advantages
        technicalAdvantages: z.array(z.string()),
        innovationPotential: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        differentiationFactors: z.array(z.string()),
        moatBuilding: z.array(z.string()),

        // Strategic Recommendations
        technologyStrategy: z.array(z.string()),
        developmentApproach: z.array(z.string()),
        riskMitigation: z.array(z.string()),
        optimizationOpportunities: z.array(z.string()),

        dataQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        dataGaps: z.array(z.string()),
        confidenceLevel: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      }),
      prompt: `${TECHNOLOGY_TRENDS_ANALYSIS_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

RESEARCH RESULTS:
${researchResults}

IMPORTANT: Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.

Generate ONLY technology trends analysis with technical feasibility assessment, cost analysis, and strategic recommendations. Focus on SaaS-specific technical insights and actionable intelligence for validation of this specific idea. Use the research data provided to inform all assessments.`,
    });

    console.log("✅ Technology Trends Agent: Completed technology analysis");

    return {
      technologyData,
      researchText: researchResults,
      agentType: "technology-trends",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  } catch (error) {
    console.error("❌ Technology Trends Agent failed:", error);

    // Return fallback technology trends data
    const fallbackData = {
      technicalComplexity: "MEDIUM" as const,
      developmentTimeline: "6-12 months",
      teamRequirements: [
        "Full-stack developers",
        "DevOps engineer",
        "Security specialist",
      ],
      recommendedStack: ["React", "Node.js", "PostgreSQL", "AWS"],
      alternativeStacks: [["Vue.js", "Python", "MongoDB", "Google Cloud"]],
      emergingTechnologies: [
        "AI/ML integration",
        "Real-time collaboration",
        "API-first design",
      ],
      platformTrends: [
        "Cloud-native architecture",
        "Serverless computing",
        "Microservices",
      ],
      integrationTrends: [
        "API ecosystems",
        "Webhook automation",
        "Real-time sync",
      ],
      securityTrends: [
        "Zero-trust security",
        "Data encryption",
        "Compliance automation",
      ],
      performanceTrends: [
        "Edge computing",
        "CDN optimization",
        "Caching strategies",
      ],
      integrationRequirements: [
        "Third-party APIs",
        "Authentication services",
        "Payment processing",
      ],
      apiRequirements: ["RESTful APIs", "WebSocket support", "Rate limiting"],
      securityRequirements: [
        "Data encryption",
        "Access control",
        "Audit logging",
      ],
      complianceRequirements: [
        "GDPR compliance",
        "Data privacy",
        "Security standards",
      ],
      scalabilityRequirements: [
        "Auto-scaling",
        "Load balancing",
        "Database optimization",
      ],
      developmentCosts: undefined,
      infrastructureCosts: undefined,
      maintenanceCosts: undefined,
      thirdPartyCosts: ["API services", "Cloud hosting", "Security tools"],
      operationalCosts: ["Monitoring", "Support", "Backup services"],
      technicalRisks: [
        "Technical complexity",
        "Integration challenges",
        "Security vulnerabilities",
      ],
      scalabilityChallenges: [
        "Database performance",
        "API rate limits",
        "Cost optimization",
      ],
      securityConsiderations: [
        "Data protection",
        "Access control",
        "Compliance requirements",
      ],
      integrationChallenges: [
        "API dependencies",
        "Data synchronization",
        "Error handling",
      ],
      performanceChallenges: [
        "Response times",
        "Concurrent users",
        "Data processing",
      ],
      technicalAdvantages: [
        "Modern architecture",
        "Scalable design",
        "Security focus",
      ],
      innovationPotential: "MEDIUM" as const,
      differentiationFactors: [
        "AI integration",
        "Real-time features",
        "API ecosystem",
      ],
      moatBuilding: ["Network effects", "Data moats", "Integration lock-in"],
      technologyStrategy: [
        "Cloud-first approach",
        "API-first design",
        "Security by design",
      ],
      developmentApproach: [
        "Agile methodology",
        "Continuous deployment",
        "Test-driven development",
      ],
      riskMitigation: [
        "Technical debt management",
        "Security audits",
        "Performance monitoring",
      ],
      optimizationOpportunities: [
        "Caching strategies",
        "Database optimization",
        "CDN implementation",
      ],
      dataQuality: "LOW" as const,
      dataGaps: [
        "Technical specifications",
        "Cost estimates",
        "Timeline details",
      ],
      confidenceLevel: "LOW" as const,
    };

    return {
      technologyData: fallbackData,
      researchText:
        "Technology trends analysis failed - fallback data provided",
      agentType: "technology-trends",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  }
};
