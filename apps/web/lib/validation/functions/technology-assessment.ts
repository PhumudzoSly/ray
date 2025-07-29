import { aiClient } from '../client';
import { TechnologyAssessmentSchema } from '../schemas';
import { technologyAssessmentDB } from '../database';
import { researchUtils } from '../research';

export interface AnalyzeTechnologyAssessmentParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
  existingData?: {
    competitiveLandscape?: any;
    competitors?: any[];
    customerNeeds?: any[];
    marketTrends?: any[];
  };
}

export interface AnalyzeTechnologyAssessmentResult {
  success: boolean;
  technologyAssessment?: any;
  error?: string;
  researchData?: any;
}

export async function analyzeTechnologyAssessment({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  existingData,
}: AnalyzeTechnologyAssessmentParams): Promise<AnalyzeTechnologyAssessmentResult> {
  try {
    console.log(`[Technology Assessment] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if technology assessment already exists
    const existingAssessment = await technologyAssessmentDB.get(researchId);
    if (existingAssessment) {
      console.log(`[Technology Assessment] Found existing technology assessment for research: ${researchId}`);
      return {
        success: true,
        technologyAssessment: existingAssessment,
      };
    }

    // Step 2: Research technology requirements and feasibility
    console.log(`[Technology Assessment] Researching technology requirements for: ${targetMarket}`);
    
    const technologyAssessmentQueries = [
      `${targetMarket} technology stack`,
      `${targetMarket} technical requirements`,
      `${targetMarket} implementation complexity`,
      `${targetMarket} scalability requirements`,
      `${targetMarket} security requirements`,
      `${targetMarket} integration needs`,
      `${targetMarket} development timeline`,
      `${targetMarket} technical challenges`,
      `${targetMarket} infrastructure requirements`,
      `${targetMarket} compliance needs`,
    ];

    const technologyAssessmentResearch = await researchUtils.multiQueryResearch(technologyAssessmentQueries, {
      maxResultsPerQuery: 3,
      includeContent: true,
    });

    // Step 3: Generate comprehensive technology assessment analysis
    console.log(`[Technology Assessment] Generating technology assessment analysis`);
    
    const technologyAssessmentAnalysisPrompt = `
You are a specialized technology assessment expert for SaaS validation. Analyze the technical feasibility and requirements for the following SaaS idea:

IDEA DESCRIPTION: ${ideaDescription}
TARGET MARKET: ${targetMarket}

EXISTING DATA:
${existingData ? `
Competitive Landscape: ${existingData.competitiveLandscape ? 'Available' : 'Not available'}
Competitors: ${existingData.competitors ? existingData.competitors.length : 0} found
Customer Needs: ${existingData.customerNeeds ? existingData.customerNeeds.length : 0} identified
Market Trends: ${existingData.marketTrends ? existingData.marketTrends.length : 0} analyzed
` : 'No existing data available'}

RESEARCH DATA:
${technologyAssessmentResearch.results.map((result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map(s => s.url).join(', ')}
`).join('\n')}

Create comprehensive technology assessment covering:

1. TECHNICAL COMPLEXITY: Overall complexity level (low, medium, high, very high)
2. DEVELOPMENT TIMELINE: Estimated development time and phases
3. RECOMMENDED TECH STACK: Technology stack recommendations and rationale
4. INTEGRATION REQUIREMENTS: Third-party integrations and API requirements
5. RISK ASSESSMENT: Technical risks and mitigation strategies
6. SCALABILITY CHALLENGES: Scalability requirements and challenges
7. COST ANALYSIS: Development costs, infrastructure costs, maintenance costs
8. COMPETITIVE ADVANTAGES: Technical competitive advantages and differentiators
9. SECURITY REQUIREMENTS: Security needs and compliance requirements
10. COMPLIANCE NEEDS: Regulatory compliance and industry standards
11. MAINTENANCE REQUIREMENTS: Ongoing maintenance and support needs
12. PERFORMANCE REQUIREMENTS: Performance benchmarks and requirements
13. RELIABILITY REQUIREMENTS: Uptime, availability, and reliability needs

For each component, provide:
- Detailed analysis and recommendations
- Risk factors and mitigation strategies
- Cost implications and timeline estimates
- Technical specifications and requirements
- Competitive positioning and advantages

Be specific, data-driven, and provide actionable technical recommendations.
`;

    const technologyAssessmentAnalysisText = await aiClient.generateText(technologyAssessmentAnalysisPrompt, {
      temperature: 0.7,
      system: `You are a world-class technology architect with 15+ years of experience in SaaS technology assessment and implementation. Provide detailed, actionable technical analysis based on the research data and market requirements.`,
    });

    // Step 4: Generate structured technology assessment data
    console.log(`[Technology Assessment] Generating structured technology assessment data`);
    
    const structuredTechnologyAssessmentPrompt = `
Based on the technology assessment analysis below, extract and structure the technology assessment information:

ANALYSIS:
${technologyAssessmentAnalysisText}

Extract detailed technology assessment data including:
- Technical complexity assessment
- Development timeline and phases
- Recommended technology stack
- Integration requirements and specifications
- Risk assessment and mitigation strategies
- Scalability challenges and solutions
- Cost analysis and breakdown
- Competitive advantages and differentiators
- Security and compliance requirements
- Maintenance and support needs
- Performance and reliability requirements

Provide specific, actionable technical recommendations and realistic assessments.
`;

    const technologyAssessmentData = await aiClient.generateObject(
      TechnologyAssessmentSchema,
      structuredTechnologyAssessmentPrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract technology assessment information in the exact format specified by the schema. Be precise and accurate with technical specifications.`,
      }
    );

    // Step 5: Save technology assessment to database
    console.log(`[Technology Assessment] Saving technology assessment to database`);
    
    const savedAssessment = await technologyAssessmentDB.save(technologyAssessmentData, researchId);

    // Step 6: Additional technology research
    console.log(`[Technology Assessment] Performing additional technology research`);
    
    const additionalTechnologyQueries = [
      `${targetMarket} technology trends`,
      `${targetMarket} implementation best practices`,
      `${targetMarket} technical architecture`,
    ];

    const additionalTechnology = await researchUtils.multiQueryResearch(additionalTechnologyQueries, {
      maxResultsPerQuery: 2,
      includeContent: true,
    });

    console.log(`[Technology Assessment] Analysis completed successfully for idea: ${ideaId}`);

    return {
      success: true,
      technologyAssessment: savedAssessment,
      researchData: {
        technologyAssessmentResearch,
        additionalTechnology,
      },
    };

  } catch (error) {
    console.error(`[Technology Assessment] Analysis failed for idea: ${ideaId}`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 