import { aiClient } from '../client';
import { RegulatoryComplianceSchema } from '../schemas';
import { regulatoryComplianceDB } from '../database';
import { researchUtils } from '../research';

export interface AnalyzeRegulatoryComplianceParams {
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

export interface AnalyzeRegulatoryComplianceResult {
  success: boolean;
  regulatoryCompliance?: any;
  error?: string;
  researchData?: any;
}

export async function analyzeRegulatoryCompliance({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  existingData,
}: AnalyzeRegulatoryComplianceParams): Promise<AnalyzeRegulatoryComplianceResult> {
  try {
    console.log(`[Regulatory Compliance] Starting analysis for idea: ${ideaId}`);

    // Step 1: Check if regulatory compliance already exists
    const existingCompliance = await regulatoryComplianceDB.get(researchId);
    if (existingCompliance) {
      console.log(`[Regulatory Compliance] Found existing regulatory compliance for research: ${researchId}`);
      return {
        success: true,
        regulatoryCompliance: existingCompliance,
      };
    }

    // Step 2: Research regulatory compliance requirements
    console.log(`[Regulatory Compliance] Researching regulatory compliance for: ${targetMarket}`);
    
    const regulatoryComplianceQueries = [
      `${targetMarket} regulatory requirements`,
      `${targetMarket} compliance standards`,
      `${targetMarket} industry regulations`,
      `${targetMarket} legal requirements`,
      `${targetMarket} certification needs`,
      `${targetMarket} data privacy regulations`,
      `${targetMarket} security compliance`,
      `${targetMarket} industry standards`,
      `${targetMarket} audit requirements`,
      `${targetMarket} compliance costs`,
    ];

    const regulatoryComplianceResearch = await researchUtils.multiQueryResearch(regulatoryComplianceQueries, {
      maxResultsPerQuery: 3,
      includeContent: true,
    });

    // Step 3: Generate comprehensive regulatory compliance analysis
    console.log(`[Regulatory Compliance] Generating regulatory compliance analysis`);
    
    const regulatoryComplianceAnalysisPrompt = `
You are a specialized regulatory compliance expert for SaaS validation. Analyze the regulatory compliance requirements for the following SaaS idea:

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
${regulatoryComplianceResearch.results.map((result, index) => `
Query ${index + 1}: ${result.query}
Summary: ${result.summary}
Sources: ${result.searchResults.map(s => s.url).join(', ')}
`).join('\n')}

Create comprehensive regulatory compliance assessment covering:

1. APPLICABLE REGULATIONS: Specific regulations that apply to the SaaS idea
2. COMPLIANCE LEVEL: Current compliance level assessment (low, medium, high, full)
3. INDUSTRY STANDARDS: Industry-specific standards and best practices
4. CERTIFICATION REQUIREMENTS: Required certifications and compliance frameworks
5. TARGET MARKETS: Compliance requirements for different target markets
6. LOCAL REGULATIONS: Country-specific and regional compliance requirements
7. IMPLEMENTATION COSTS: Costs associated with achieving compliance
8. IMPLEMENTATION TIMELINE: Timeline for achieving full compliance
9. RISK ASSESSMENT: Compliance risks and potential penalties
10. COMPLIANCE STRATEGY: Strategy for achieving and maintaining compliance
11. MONITORING REQUIREMENTS: Ongoing monitoring and reporting requirements
12. AUDIT REQUIREMENTS: Audit processes and requirements

For each component, provide:
- Detailed analysis and requirements
- Risk factors and compliance gaps
- Cost implications and timeline estimates
- Implementation strategies and recommendations
- Ongoing compliance requirements

Be specific, data-driven, and provide actionable compliance recommendations.
`;

    const regulatoryComplianceAnalysisText = await aiClient.generateText(regulatoryComplianceAnalysisPrompt, {
      temperature: 0.7,
      system: `You are a world-class regulatory compliance expert with 15+ years of experience in SaaS compliance and regulatory requirements. Provide detailed, actionable compliance analysis based on the research data and industry standards.`,
    });

    // Step 4: Generate structured regulatory compliance data
    console.log(`[Regulatory Compliance] Generating structured regulatory compliance data`);
    
    const structuredRegulatoryCompliancePrompt = `
Based on the regulatory compliance analysis below, extract and structure the regulatory compliance information:

ANALYSIS:
${regulatoryComplianceAnalysisText}

Extract detailed regulatory compliance data including:
- Applicable regulations and requirements
- Compliance level assessment
- Industry standards and best practices
- Certification requirements and frameworks
- Target market compliance needs
- Local and regional regulations
- Implementation costs and timeline
- Risk assessment and mitigation strategies
- Compliance strategy and approach
- Monitoring and audit requirements

Provide specific, actionable compliance recommendations and realistic assessments.
`;

    const regulatoryComplianceData = await aiClient.generateObject(
      RegulatoryComplianceSchema,
      structuredRegulatoryCompliancePrompt,
      {
        temperature: 0.3,
        system: `You are a data extraction specialist. Extract regulatory compliance information in the exact format specified by the schema. Be precise and accurate with compliance requirements.`,
      }
    );

    // Step 5: Save regulatory compliance to database
    console.log(`[Regulatory Compliance] Saving regulatory compliance to database`);
    
    const savedCompliance = await regulatoryComplianceDB.save(regulatoryComplianceData, researchId);

    // Step 6: Additional compliance research
    console.log(`[Regulatory Compliance] Performing additional compliance research`);
    
    const additionalComplianceQueries = [
      `${targetMarket} compliance best practices`,
      `${targetMarket} regulatory trends`,
      `${targetMarket} compliance automation`,
    ];

    const additionalCompliance = await researchUtils.multiQueryResearch(additionalComplianceQueries, {
      maxResultsPerQuery: 2,
      includeContent: true,
    });

    console.log(`[Regulatory Compliance] Analysis completed successfully for idea: ${ideaId}`);

    return {
      success: true,
      regulatoryCompliance: savedCompliance,
      researchData: {
        regulatoryComplianceResearch,
        additionalCompliance,
      },
    };

  } catch (error) {
    console.error(`[Regulatory Compliance] Analysis failed for idea: ${ideaId}`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 