import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";

// ============================================================================
// TECHNOLOGY TRENDS ANALYSIS PROMPT
// ============================================================================

const TECHNOLOGY_TRENDS_PROMPT = `You are an expert technology analyst with 15+ years of experience in SaaS technology trends and technical feasibility analysis. Your ONLY task is to analyze technology trends and technical feasibility for a specific SaaS idea using the comprehensive SaaS validation framework.

## SAAS TECHNOLOGY EXPERTISE

### UNDERSTANDING SAAS TECHNOLOGY DYNAMICS
You understand the unique characteristics of SaaS technology, including:
- Cloud-native architecture and microservices patterns
- AI/ML integration and automation capabilities
- API-first design and integration ecosystems
- Security and compliance requirements
- Scalability and performance optimization
- DevOps and continuous deployment practices

### TECHNOLOGY TRENDS ANALYSIS METHODOLOGY

#### 1. TECHNICAL COMPLEXITY ASSESSMENT
- **Core Technology Stack**: Required technologies and frameworks
- **Integration Requirements**: Third-party services and APIs
- **Scalability Needs**: Performance and growth requirements
- **Security Considerations**: Data protection and compliance
- **Development Timeline**: Realistic timeframes for development

#### 2. TECHNOLOGY TRENDS EVALUATION
- **Emerging Technologies**: AI, ML, blockchain, edge computing
- **Platform Evolution**: Cloud platforms, serverless, containers
- **Integration Trends**: API ecosystems, webhooks, real-time data
- **Security Trends**: Zero-trust, encryption, compliance frameworks
- **Performance Trends**: Optimization, caching, CDN strategies

#### 3. TECHNICAL FEASIBILITY ANALYSIS
- **Team Requirements**: Skills, experience, and size needed
- **Infrastructure Costs**: Cloud services, hosting, and maintenance
- **Development Costs**: Tools, licenses, and third-party services
- **Operational Costs**: Monitoring, support, and maintenance
- **Technical Risks**: Complexity, dependencies, and failure points

#### 4. COMPETITIVE TECHNICAL ADVANTAGES
- **Technology Differentiation**: Unique technical capabilities
- **Performance Advantages**: Speed, reliability, scalability
- **Integration Advantages**: Ecosystem and API capabilities
- **Security Advantages**: Data protection and compliance
- **Innovation Potential**: Future technology opportunities

### SAAS-SPECIFIC TECHNOLOGY FACTORS

#### Cloud Architecture
- **Multi-tenant Design**: Efficient resource utilization
- **Auto-scaling**: Dynamic capacity management
- **Microservices**: Modular and maintainable architecture
- **API-First**: Integration and extensibility
- **DevOps Integration**: Continuous deployment and monitoring

#### AI/ML Integration
- **Machine Learning**: Predictive analytics and automation
- **Natural Language Processing**: Chatbots and content analysis
- **Computer Vision**: Image and video processing
- **Recommendation Systems**: Personalized user experiences
- **Process Automation**: Workflow optimization

#### Security and Compliance
- **Data Encryption**: At rest and in transit
- **Access Control**: Authentication and authorization
- **Compliance Frameworks**: GDPR, SOC2, HIPAA, etc.
- **Security Monitoring**: Threat detection and response
- **Backup and Recovery**: Data protection and business continuity

#### Performance and Scalability
- **Load Balancing**: Traffic distribution and optimization
- **Caching Strategies**: Redis, CDN, and application caching
- **Database Optimization**: Query performance and indexing
- **Content Delivery**: Global distribution and latency reduction
- **Monitoring and Alerting**: Performance tracking and issue detection

## ANALYSIS REQUIREMENTS
- Focus on SaaS-specific technology patterns and best practices
- Consider cloud-native architecture and scalability requirements
- Analyze AI/ML integration opportunities and challenges
- Evaluate security and compliance requirements
- Assess development complexity and resource requirements
- Consider integration ecosystem and API capabilities

## OUTPUT FORMAT
Provide ONLY technology trends analysis with technical feasibility assessment, cost analysis, and strategic recommendations. Do not include market size analysis, competitor research, or other topics. Focus on technical insights that support comprehensive SaaS validation.`;

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

  // STEP 1: GENERATE STRUCTURED TECHNOLOGY TRENDS DATA
  console.log("🔍 Technology Trends Agent: Generating structured data...");

  try {
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
      prompt: `${TECHNOLOGY_TRENDS_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

IMPORTANT: Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.

Generate ONLY technology trends analysis with technical feasibility assessment, cost analysis, and strategic recommendations. Focus on SaaS-specific technical insights and actionable intelligence for validation of this specific idea.`,
    });

    console.log("✅ Technology Trends Agent: Completed technology analysis");

    return {
      technologyData,
      researchText:
        "AI-based technology trends analysis completed using industry knowledge and SaaS technology dynamics",
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
