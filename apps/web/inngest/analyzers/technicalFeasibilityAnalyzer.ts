import { z } from "zod";
import { PhaseAnalyzer } from "./baseAnalyzer";
import type {
  ResearchPhase,
  AnalysisResult,
  ResearchContext,
} from "@/types/research";

const TechnicalFeasibilitySchema = z.object({
  architectureAssessment: z.object({
    recommendedArchitecture: z.string(),
    scalabilityApproach: z.string(),
    performanceRequirements: z.array(z.string()),
    securityConsiderations: z.array(z.string()),
    dataArchitecture: z.string(),
    integrationRequirements: z.array(z.string()),
  }),
  technologyStack: z.object({
    frontend: z.object({
      framework: z.string(),
      justification: z.string(),
      alternatives: z.array(z.string()),
      complexity: z.enum(["low", "medium", "high"]),
    }),
    backend: z.object({
      framework: z.string(),
      database: z.string(),
      justification: z.string(),
      alternatives: z.array(z.string()),
      complexity: z.enum(["low", "medium", "high"]),
    }),
    infrastructure: z.object({
      cloudProvider: z.string(),
      deploymentStrategy: z.string(),
      scalingApproach: z.string(),
      estimatedCosts: z.string(),
    }),
    thirdPartyServices: z.array(
      z.object({
        service: z.string(),
        purpose: z.string(),
        cost: z.string(),
        alternatives: z.array(z.string()),
      })
    ),
  }),
  developmentComplexity: z.object({
    overallComplexity: z.enum(["low", "medium", "high", "very-high"]),
    complexityFactors: z.array(z.string()),
    technicalChallenges: z.array(
      z.object({
        challenge: z.string(),
        difficulty: z.enum(["low", "medium", "high"]),
        solution: z.string(),
        timeImpact: z.string(),
      })
    ),
    riskMitigation: z.array(z.string()),
  }),
  resourceRequirements: z.object({
    teamComposition: z.array(
      z.object({
        role: z.string(),
        seniority: z.enum(["junior", "mid", "senior", "lead"]),
        quantity: z.number(),
        timeCommitment: z.string(),
        skillsRequired: z.array(z.string()),
      })
    ),
    developmentTimeline: z.object({
      mvpTimeline: z.string(),
      fullProductTimeline: z.string(),
      majorMilestones: z.array(
        z.object({
          milestone: z.string(),
          timeline: z.string(),
          dependencies: z.array(z.string()),
        })
      ),
    }),
    budgetEstimate: z.object({
      developmentCosts: z.string(),
      infrastructureCosts: z.string(),
      thirdPartyCosts: z.string(),
      totalFirstYear: z.string(),
      ongoingAnnualCosts: z.string(),
    }),
  }),
  scalabilityAnalysis: z.object({
    userScalability: z.object({
      currentCapacity: z.string(),
      scalingTriggers: z.array(z.string()),
      scalingStrategy: z.string(),
      bottlenecks: z.array(z.string()),
    }),
    dataScalability: z.object({
      dataGrowthProjection: z.string(),
      storageStrategy: z.string(),
      performanceOptimization: z.array(z.string()),
    }),
    geographicalScaling: z.object({
      multiRegionStrategy: z.string(),
      localizationRequirements: z.array(z.string()),
      complianceConsiderations: z.array(z.string()),
    }),
  }),
  securityAssessment: z.object({
    securityRequirements: z.array(z.string()),
    complianceNeeds: z.array(z.string()),
    securityMeasures: z.array(
      z.object({
        measure: z.string(),
        implementation: z.string(),
        cost: z.string(),
        priority: z.enum(["critical", "high", "medium", "low"]),
      })
    ),
    vulnerabilityAssessment: z.array(z.string()),
  }),
  integrationFeasibility: z.object({
    requiredIntegrations: z.array(
      z.object({
        integration: z.string(),
        complexity: z.enum(["low", "medium", "high"]),
        timeEstimate: z.string(),
        dependencies: z.array(z.string()),
      })
    ),
    apiStrategy: z.string(),
    dataExchangeFormats: z.array(z.string()),
    integrationChallenges: z.array(z.string()),
  }),
  performanceRequirements: z.object({
    responseTimeTargets: z.array(z.string()),
    throughputRequirements: z.array(z.string()),
    availabilityTargets: z.string(),
    performanceOptimizations: z.array(z.string()),
    monitoringStrategy: z.string(),
  }),
  riskAssessment: z.object({
    technicalRisks: z.array(
      z.object({
        risk: z.string(),
        probability: z.enum(["high", "medium", "low"]),
        impact: z.enum(["high", "medium", "low"]),
        mitigation: z.string(),
      })
    ),
    dependencyRisks: z.array(z.string()),
    skillGapRisks: z.array(z.string()),
    technologyObsolescenceRisks: z.array(z.string()),
  }),
  implementationStrategy: z.object({
    developmentMethodology: z.string(),
    phasedApproach: z.array(
      z.object({
        phase: z.string(),
        duration: z.string(),
        deliverables: z.array(z.string()),
        resources: z.array(z.string()),
      })
    ),
    qualityAssurance: z.string(),
    deploymentStrategy: z.string(),
    maintenanceApproach: z.string(),
  }),
  sources: z.array(z.string()),
});

export class TechnicalFeasibilityAnalyzer extends PhaseAnalyzer {
  async analyze(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext
  ): Promise<AnalysisResult> {
    const researchTopic = `Technical feasibility and architecture analysis for ${context.ideaName} SaaS in ${context.industry}`;
    const searchQueries = this.getSearchQueries(context);

    // Use research-based analysis for better technical insights
    return this.conductResearchAnalysis(
      sessionId,
      phase,
      context,
      researchTopic,
      searchQueries,
      TechnicalFeasibilitySchema
    );
  }

  protected generateFollowUpPrompt(
    currentFindings: any,
    context: ResearchContext,
    iteration: number
  ): string {
    const gaps = this.identifyGaps(currentFindings);

    return `
Based on the previous technical feasibility analysis, please provide more detailed information on:

${gaps.map((gap) => `- ${gap}`).join("\n")}

Current technical analysis status:
- Architecture assessment: ${currentFindings.architectureAssessment ? "Available" : "Missing"}
- Technology stack: ${currentFindings.technologyStack ? "Available" : "Missing"}
- Development complexity: ${currentFindings.developmentComplexity ? "Available" : "Missing"}
- Resource requirements: ${currentFindings.resourceRequirements ? "Available" : "Missing"}
- Scalability analysis: ${currentFindings.scalabilityAnalysis ? "Available" : "Missing"}

Iteration ${iteration} - focus on specific technology choices, realistic timelines, and detailed cost estimates.
Provide more granular analysis of technical challenges and implementation strategies.
`;
  }

  protected calculateConfidence(findings: any, iteration: number): number {
    let confidence = this.getBaseConfidence(findings, iteration);

    const requiredFields = [
      "architectureAssessment",
      "technologyStack",
      "developmentComplexity",
      "resourceRequirements",
    ];

    if (this.hasRequiredFields(findings, requiredFields)) {
      confidence += 20;
    }

    // Architecture assessment completeness
    if (
      findings.architectureAssessment?.recommendedArchitecture &&
      findings.architectureAssessment?.scalabilityApproach
    ) {
      confidence += 10;
    }

    // Technology stack detail
    if (
      findings.technologyStack?.frontend?.framework &&
      findings.technologyStack?.backend?.framework
    ) {
      confidence += 10;
    }

    // Resource rrements detail
    if (
      findings.resourceRequirements?.teamComposition?.length >= 3 &&
      findings.resourceRequirements?.developmentTimeline?.mvpTimeline
    ) {
      confidence += 10;
    }

    // Budget estimates
    if (findings.resourceRequirements?.budgetEstimate?.totalFirstYear) {
      confidence += 8;
    }

    // Scalability analysis
    if (
      findings.scalabilityAnalysis?.userScalability &&
      findings.scalabilityAnalysis?.dataScalability
    ) {
      confidence += 8;
    }

    // Security assessment
    if (findings.securityAssessment?.securityRequirements?.length >= 3) {
      confidence += 5;
    }

    // Integration feasibility
    if (findings.integrationFeasibility?.requiredIntegrations?.length >= 2) {
      confidence += 5;
    }

    // Performance requirements
    if (findings.performanceRequirements?.responseTimeTargets?.length >= 2) {
      confidence += 5;
    }

    // Risk assessment
    if (findings.riskAssessment?.technicalRisks?.length >= 3) {
      confidence += 5;
    }

    // Implementation strategy
    if (findings.implementationStrategy?.phasedApproach?.length >= 2) {
      confidence += 5;
    }

    return Math.min(confidence, 100);
  }

  protected mergeFindings(existing: any, newFindings: any): any {
    return {
      architectureAssessment: this.mergeObjects(
        existing.architectureAssessment,
        newFindings.architectureAssessment
      ),
      technologyStack: this.mergeTechnologyStack(
        existing.technologyStack,
        newFindings.technologyStack
      ),
      developmentComplexity: this.mergeDevelopmentComplexity(
        existing.developmentComplexity,
        newFindings.developmentComplexity
      ),
      resourceRequirements: this.mergeResourceRequirements(
        existing.resourceRequirements,
        newFindings.resourceRequirements
      ),
      scalabilityAnalysis: this.mergeObjects(
        existing.scalabilityAnalysis,
        newFindings.scalabilityAnalysis
      ),
      securityAssessment: this.mergeSecurityAssessment(
        existing.securityAssessment,
        newFindings.securityAssessment
      ),
      integrationFeasibility: this.mergeIntegrationFeasibility(
        existing.integrationFeasibility,
        newFindings.integrationFeasibility
      ),
      performanceRequirements: this.mergeObjects(
        existing.performanceRequirements,
        newFindings.performanceRequirements
      ),
      riskAssessment: this.mergeRiskAssessment(
        existing.riskAssessment,
        newFindings.riskAssessment
      ),
      implementationStrategy: this.mergeImplementationStrategy(
        existing.implementationStrategy,
        newFindings.implementationStrategy
      ),
      sources: this.mergeArrays(existing.sources, newFindings.sources),
    };
  }

  private identifyGaps(findings: any): string[] {
    const gaps: string[] = [];

    // Architecture assessment
    if (!findings.architectureAssessment?.recommendedArchitecture) {
      gaps.push("System architecture recommendation with justification");
    }
    if (!findings.architectureAssessment?.scalabilityApproach) {
      gaps.push("Scalability approach and patterns");
    }

    // Technology stack
    if (!findings.technologyStack?.frontend?.framework) {
      gaps.push("Frontend technology stack with justification");
    }
    if (!findings.technologyStack?.backend?.framework) {
      gaps.push("Backend technology stack and database selection");
    }
    if (!findings.technologyStack?.infrastructure?.cloudProvider) {
      gaps.push("Infrastructure and cloud deployment strategy");
    }

    // Development complexity
    if (!findings.developmentComplexity?.overallComplexity) {
      gaps.push("Overall development complexity assessment");
    }
    if (
      !findings.developmentComplexity?.technicalChallenges ||
      findings.developmentComplexity.technicalChallenges.length < 3
    ) {
      gaps.push("Technical challenges identification and solutions");
    }

    // Resource requirements
    if (
      !findings.resourceRequirements?.teamComposition ||
      findings.resourceRequirements.teamComposition.length < 3
    ) {
      gaps.push("Detailed team composition and skill requirements");
    }
    if (!findings.resourceRequirements?.developmentTimeline?.mvpTimeline) {
      gaps.push("Development timeline with MVP and full product estimates");
    }
    if (!findings.resourceRequirements?.budgetEstimate?.totalFirstYear) {
      gaps.push(
        "Comprehensive budget estimates for development and operations"
      );
    }

    // Scalability analysis
    if (!findings.scalabilityAnalysis?.userScalability) {
      gaps.push("User scalability analysis with capacity planning");
    }
    if (!findings.scalabilityAnalysis?.dataScalability) {
      gaps.push("Data scalability and storage strategy");
    }

    // Security assessment
    if (
      !findings.securityAssessment?.securityRequirements ||
      findings.securityAssessment.securityRequirements.length < 3
    ) {
      gaps.push("Security requirements and compliance needs");
    }

    // Integration feasibility
    if (
      !findings.integrationFeasibility?.requiredIntegrations ||
      findings.integrationFeasibility.requiredIntegrations.length < 2
    ) {
      gaps.push("Required integrations with complexity assessment");
    }

    // Performance requirements
    if (!findings.performanceRequirements?.responseTimeTargets) {
      gaps.push("Performance requirements and optimization strategies");
    }

    // Risk assessment
    if (
      !findings.riskAssessment?.technicalRisks ||
      findings.riskAssessment.technicalRisks.length < 3
    ) {
      gaps.push("Technical risk assessment with mitigation strategies");
    }

    // Implementation strategy
    if (
      !findings.implementationStrategy?.phasedApproach ||
      findings.implementationStrategy.phasedApproach.length < 2
    ) {
      gaps.push("Phased implementation strategy with milestones");
    }

    return gaps;
  }

  private mergeTechnologyStack(existing: any, newStack: any): any {
    if (!existing) return newStack;
    if (!newStack) return existing;

    return {
      frontend: this.mergeObjects(existing.frontend, newStack.frontend),
      backend: this.mergeObjects(existing.backend, newStack.backend),
      infrastructure: this.mergeObjects(
        existing.infrastructure,
        newStack.infrastructure
      ),
      thirdPartyServices: this.mergeArrays(
        existing.thirdPartyServices,
        newStack.thirdPartyServices,
        "service"
      ),
    };
  }

  private mergeDevelopmentComplexity(existing: any, newComplexity: any): any {
    if (!existing) return newComplexity;
    if (!newComplexity) return existing;

    return {
      ...existing,
      ...newComplexity,
      complexityFactors: this.mergeArrays(
        existing.complexityFactors,
        newComplexity.complexityFactors
      ),
      technicalChallenges: this.mergeArrays(
        existing.technicalChallenges,
        newComplexity.technicalChallenges,
        "challenge"
      ),
      riskMitigation: this.mergeArrays(
        existing.riskMitigation,
        newComplexity.riskMitigation
      ),
    };
  }

  private mergeResourceRequirements(existing: any, newRequirements: any): any {
    if (!existing) return newRequirements;
    if (!newRequirements) return existing;

    return {
      teamComposition: this.mergeArrays(
        existing.teamComposition,
        newRequirements.teamComposition,
        "role"
      ),
      developmentTimeline: this.mergeObjects(
        existing.developmentTimeline,
        newRequirements.developmentTimeline
      ),
      budgetEstimate: this.mergeObjects(
        existing.budgetEstimate,
        newRequirements.budgetEstimate
      ),
    };
  }

  private mergeSecurityAssessment(existing: any, newSecurity: any): any {
    if (!existing) return newSecurity;
    if (!newSecurity) return existing;

    return {
      securityRequirements: this.mergeArrays(
        existing.securityRequirements,
        newSecurity.securityRequirements
      ),
      complianceNeeds: this.mergeArrays(
        existing.complianceNeeds,
        newSecurity.complianceNeeds
      ),
      securityMeasures: this.mergeArrays(
        existing.securityMeasures,
        newSecurity.securityMeasures,
        "measure"
      ),
      vulnerabilityAssessment: this.mergeArrays(
        existing.vulnerabilityAssessment,
        newSecurity.vulnerabilityAssessment
      ),
    };
  }

  private mergeIntegrationFeasibility(existing: any, newIntegration: any): any {
    if (!existing) return newIntegration;
    if (!newIntegration) return existing;

    return {
      ...existing,
      ...newIntegration,
      requiredIntegrations: this.mergeArrays(
        existing.requiredIntegrations,
        newIntegration.requiredIntegrations,
        "integration"
      ),
      dataExchangeFormats: this.mergeArrays(
        existing.dataExchangeFormats,
        newIntegration.dataExchangeFormats
      ),
      integrationChallenges: this.mergeArrays(
        existing.integrationChallenges,
        newIntegration.integrationChallenges
      ),
    };
  }

  private mergeRiskAssessment(existing: any, newRisk: any): any {
    if (!existing) return newRisk;
    if (!newRisk) return existing;

    return {
      technicalRisks: this.mergeArrays(
        existing.technicalRisks,
        newRisk.technicalRisks,
        "risk"
      ),
      dependencyRisks: this.mergeArrays(
        existing.dependencyRisks,
        newRisk.dependencyRisks
      ),
      skillGapRisks: this.mergeArrays(
        existing.skillGapRisks,
        newRisk.skillGapRisks
      ),
      technologyObsolescenceRisks: this.mergeArrays(
        existing.technologyObsolescenceRisks,
        newRisk.technologyObsolescenceRisks
      ),
    };
  }

  private mergeImplementationStrategy(existing: any, newStrategy: any): any {
    if (!existing) return newStrategy;
    if (!newStrategy) return existing;

    return {
      ...existing,
      ...newStrategy,
      phasedApproach: this.mergeArrays(
        existing.phasedApproach,
        newStrategy.phasedApproach,
        "phase"
      ),
    };
  }

  private mergeObjects(existing: any, newObj: any): any {
    if (!existing) return newObj;
    if (!newObj) return existing;

    // Deep merge for nested objects
    const merged = { ...existing };
    for (const key in newObj) {
      if (
        typeof newObj[key] === "object" &&
        !Array.isArray(newObj[key]) &&
        newObj[key] !== null
      ) {
        merged[key] = this.mergeObjects(existing[key], newObj[key]);
      } else {
        merged[key] = newObj[key];
      }
    }
    return merged;
  }

  private mergeArrays(
    existing: any[] = [],
    newItems: any[] = [],
    uniqueKey?: string
  ): any[] {
    if (!newItems) return existing;
    if (!existing) return newItems;

    if (uniqueKey) {
      const existingKeys = new Set(
        existing.map((item) => item[uniqueKey]?.toLowerCase())
      );
      const uniqueNewItems = newItems.filter(
        (item) => !existingKeys.has(item[uniqueKey]?.toLowerCase())
      );
      return [...existing, ...uniqueNewItems];
    }

    const combined = [...existing, ...newItems];
    return Array.from(new Set(combined));
  }

  protected getSearchQueries(context: ResearchContext): string[] {
    const industry = context.industry.toLowerCase();
    const ideaName = context.ideaName.toLowerCase();

    return [
      `${industry} SaaS technical architecture best practices 2024`,
      `${industry} software development stack recommendations`,
      `${ideaName} ${industry} technical implementation challenges`,
      `SaaS scalability patterns ${industry} enterprise`,
      `${industry} software security compliance requirements`,
      `${industry} SaaS development timeline cost estimation`,
      `${industry} cloud infrastructure requirements SaaS`,
      `${industry} software integration APIs third party`,
      `SaaS performance requirements ${industry} benchmarks`,
      `${industry} software development team composition`,
    ];
  }
}
