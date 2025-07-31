import { z } from "zod";
import { PhaseAnalyzer } from "./baseAnalyzer";
import type {
  ResearchPhase,
  AnalysisResult,
  ResearchContext,
} from "@/types/research";

const RiskSchema = z.object({
  category: z.enum([
    "market",
    "competitive",
    "technical",
    "financial",
    "operational",
    "regulatory",
    "team",
    "strategic",
  ]),
  risk: z.string(),
  description: z.string(),
  probability: z.enum(["very-high", "high", "medium", "low", "very-low"]),
  impact: z.enum(["critical", "high", "medium", "low", "minimal"]),
  riskScore: z.number().min(1).max(25),
  timeframe: z.enum(["immediate", "short-term", "medium-term", "long-term"]),
  indicators: z.array(z.string()),
  mitigation: z.object({
    strategy: z.string(),
    actions: z.array(z.string()),
    cost: z.string(),
    timeline: z.string(),
    effectiveness: z.enum(["high", "medium", "low"]),
  }),
  contingency: z.object({
    plan: z.string(),
    triggers: z.array(z.string()),
    resources: z.string(),
  }),
});

const RiskAnalysisSchema = z.object({
  riskAssessment: z.array(RiskSchema),
  riskMatrix: z.object({
    criticalRisks: z.array(z.string()),
    highRisks: z.array(z.string()),
    mediumRisks: z.array(z.string()),
    lowRisks: z.array(z.string()),
  }),
  riskCategories: z.object({
    marketRisks: z.array(z.string()),
    competitiveRisks: z.array(z.string()),
    technicalRisks: z.array(z.string()),
    financialRisks: z.array(z.string()),
    operationalRisks: z.array(z.string()),
    regulatoryRisks: z.array(z.string()),
    teamRisks: z.array(z.string()),
    strategicRisks: z.array(z.string()),
  }),
  riskManagementFramework: z.object({
    governance: z.string(),
    monitoringProcess: z.string(),
    reportingStructure: z.string(),
    reviewFrequency: z.string(),
    escalationProcedure: z.string(),
  }),
  scenarioPlanning: z.object({
    worstCaseScenario: z.object({
      description: z.string(),
      triggerEvents: z.array(z.string()),
      impact: z.string(),
      responseStrategy: z.string(),
    }),
    stressTestScenarios: z.array(
      z.object({
        scenario: z.string(),
        assumptions: z.array(z.string()),
        impact: z.string(),
        preparedness: z.string(),
      })
    ),
  }),
  riskAppetite: z.object({
    overall: z.enum(["conservative", "moderate", "aggressive"]),
    byCategory: z.object({
      market: z.enum(["low", "medium", "high"]),
      financial: z.enum(["low", "medium", "high"]),
      operational: z.enum(["low", "medium", "high"]),
      strategic: z.enum(["low", "medium", "high"]),
    }),
    rationale: z.string(),
  }),
  keyRiskIndicators: z.array(
    z.object({
      indicator: z.string(),
      metric: z.string(),
      threshold: z.string(),
      frequency: z.string(),
      owner: z.string(),
    })
  ),
  riskBudget: z.object({
    totalBudget: z.string(),
    allocation: z.array(
      z.object({
        category: z.string(),
        amount: z.string(),
        justification: z.string(),
      })
    ),
  }),
  sources: z.array(z.string()),
});

export class RiskAnalysisAnalyzer extends PhaseAnalyzer {
  async analyze(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext
  ): Promise<AnalysisResult> {
    const researchTopic = `Risk analysis and mitigation strategies for ${context.ideaName} SaaS in ${context.industry}`;
    const searchQueries = this.getSearchQueries(context);

    // Use research-based analysis for better risk insights
    return this.conductResearchAnalysis(
      sessionId,
      phase,
      context,
      researchTopic,
      searchQueries,
      RiskAnalysisSchema
    );
  }

  protected generateFollowUpPrompt(
    currentFindings: any,
    context: ResearchContext,
    iteration: number
  ): string {
    const gaps = this.identifyGaps(currentFindings);

    return `
Based on the previous risk analysis, please provide more detailed information on:

${gaps.map((gap) => `- ${gap}`).join("\n")}

Current risk analysis status:
- Risks identified: ${currentFindings.riskAssessment?.length || 0}
- Risk categories covered: ${Object.keys(currentFindings.riskCategories || {}).length}
- Risk matrix: ${currentFindings.riskMatrix ? "Available" : "Missing"}
- Management framework: ${currentFindings.riskManagementFramework ? "Available" : "Missing"}
- Scenario planning: ${currentFindings.scenarioPlanning ? "Available" : "Missing"}

Iteration ${iteration} - focus on specific, actionable mitigation strategies and realistic risk scenarios.
Ensure comprehensive coverage of all risk categories with detailed contingency plans.
`;
  }

  protected calculateConfidence(findings: any, iteration: number): number {
    let confidence = this.getBaseConfidence(findings, iteration);

    const requiredFields = [
      "riskAssessment",
      "riskMatrix",
      "riskCategories",
      "riskManagementFramework",
    ];

    if (this.hasRequiredFields(findings, requiredFields)) {
      confidence += 20;
    }

    // Risk assessment completeness
    const riskCount = findings.riskAssessment?.length || 0;
    if (riskCount >= 10) confidence += 10;
    if (riskCount >= 15) confidence += 5;

    // Risk categorization
    const categoryCount = Object.keys(findings.riskCategories || {}).length;
    if (categoryCount >= 6) confidence += 8;

    // Detailed risk analysis
    const hasDetailedRisks = findings.riskAssessment?.some(
      (r: any) => r.mitigation?.strategy && r.contingency?.plan
    );
    if (hasDetailedRisks) confidence += 10;

    // Risk matrix completeness
    if (findings.riskMatrix?.criticalRisks?.length > 0) confidence += 5;

    // Management framework
    if (
      findings.riskManagementFramework?.governance &&
      findings.riskManagementFramework?.monitoringProcess
    ) {
      confidence += 8;
    }

    // Scenario planning
    if (
      findings.scenarioPlanning?.worstCaseScenario &&
      findings.scenarioPlanning?.stressTestScenarios?.length >= 2
    ) {
      confidence += 8;
    }

    // Risk appetite definition
    if (findings.riskAppetite?.overall && findings.riskAppetite?.rationale) {
      confidence += 5;
    }

    // Key risk indicators
    if (findings.keyRiskIndicators?.length >= 5) confidence += 5;

    // Risk budget
    if (findings.riskBudget?.totalBudget) confidence += 3;

    return Math.min(confidence, 100);
  }

  protected mergeFindings(existing: any, newFindings: any): any {
    return {
      riskAssessment: this.mergeRisks(
        existing.riskAssessment,
        newFindings.riskAssessment
      ),
      riskMatrix: this.mergeRiskMatrix(
        existing.riskMatrix,
        newFindings.riskMatrix
      ),
      riskCategories: this.mergeRiskCategories(
        existing.riskCategories,
        newFindings.riskCategories
      ),
      riskManagementFramework: this.mergeObjects(
        existing.riskManagementFramework,
        newFindings.riskManagementFramework
      ),
      scenarioPlanning: this.mergeScenarioPlanning(
        existing.scenarioPlanning,
        newFindings.scenarioPlanning
      ),
      riskAppetite: this.mergeObjects(
        existing.riskAppetite,
        newFindings.riskAppetite
      ),
      keyRiskIndicators: this.mergeArrays(
        existing.keyRiskIndicators,
        newFindings.keyRiskIndicators,
        "indicator"
      ),
      riskBudget: this.mergeRiskBudget(
        existing.riskBudget,
        newFindings.riskBudget
      ),
      sources: this.mergeArrays(existing.sources, newFindings.sources),
    };
  }

  private identifyGaps(findings: any): string[] {
    const gaps: string[] = [];

    const riskCount = findings.riskAssessment?.length || 0;
    if (riskCount < 10) {
      gaps.push("More comprehensive risk identification (need 15-20 risks)");
    }

    // Check risk category coverage
    const expectedCategories = [
      "marketRisks",
      "competitiveRisks",
      "technicalRisks",
      "financialRisks",
      "operationalRisks",
      "regulatoryRisks",
      "teamRisks",
      "strategicRisks",
    ];
    const missingCategories = expectedCategories.filter(
      (cat) =>
        !findings.riskCategories?.[cat] ||
        findings.riskCategories[cat].length === 0
    );
    if (missingCategories.length > 0) {
      gaps.push(`Risk categories analysis: ${missingCategories.join(", ")}`);
    }

    // Check for detailed mitigation strategies
    const hasDetailedMitigation = findings.riskAssessment?.some(
      (r: any) => r.mitigation?.strategy && r.mitigation?.actions?.length > 0
    );
    if (!hasDetailedMitigation) {
      gaps.push("Detailed mitigation strategies with specific actions");
    }

    // Check for contingency plans
    const hasContingencyPlans = findings.riskAssessment?.some(
      (r: any) => r.contingency?.plan && r.contingency?.triggers?.length > 0
    );
    if (!hasContingencyPlans) {
      gaps.push("Contingency plans with specific triggers");
    }

    // Risk matrix
    if (
      !findings.riskMatrix?.criticalRisks ||
      findings.riskMatrix.criticalRisks.length === 0
    ) {
      gaps.push(
        "Risk prioritization matrix with critical risks identification"
      );
    }

    // Management framework
    if (!findings.riskManagementFramework?.governance) {
      gaps.push("Risk management governance structure");
    }

    // Scenario planning
    if (!findings.scenarioPlanning?.worstCaseScenario) {
      gaps.push("Worst-case scenario analysis");
    }
    if (
      !findings.scenarioPlanning?.stressTestScenarios ||
      findings.scenarioPlanning.stressTestScenarios.length < 2
    ) {
      gaps.push("Multiple stress test scenarios");
    }

    // Risk appetite
    if (!findings.riskAppetite?.overall) {
      gaps.push("Risk appetite and tolerance definition");
    }

    // Key risk indicators
    if (!findings.keyRiskIndicators || findings.keyRiskIndicators.length < 5) {
      gaps.push("Key risk indicators with measurable metrics");
    }

    // Risk budget
    if (!findings.riskBudget?.totalBudget) {
      gaps.push("Risk mitigation budget allocation");
    }

    return gaps;
  }

  private mergeRisks(existing: any[] = [], newRisks: any[] = []): any[] {
    if (!newRisks) return existing;
    if (!existing) return newRisks;

    const existingRisks = new Set(existing.map((r) => r.risk.toLowerCase()));
    const uniqueNew = newRisks.filter(
      (r) => !existingRisks.has(r.risk.toLowerCase())
    );

    // Merge existing risks with additional details
    const merged = existing.map((existingRisk) => {
      const newRisk = newRisks.find(
        (r) => r.risk.toLowerCase() === existingRisk.risk.toLowerCase()
      );

      if (newRisk) {
        return {
          ...existingRisk,
          ...newRisk,
          indicators: Array.from(
            new Set([
              ...(existingRisk.indicators || []),
              ...(newRisk.indicators || []),
            ])
          ),
          mitigation: { ...existingRisk.mitigation, ...newRisk.mitigation },
          contingency: { ...existingRisk.contingency, ...newRisk.contingency },
        };
      }

      return existingRisk;
    });

    return [...merged, ...uniqueNew];
  }

  private mergeRiskMatrix(existing: any, newMatrix: any): any {
    if (!existing) return newMatrix;
    if (!newMatrix) return existing;

    return {
      criticalRisks: this.mergeArrays(
        existing.criticalRisks,
        newMatrix.criticalRisks
      ),
      highRisks: this.mergeArrays(existing.highRisks, newMatrix.highRisks),
      mediumRisks: this.mergeArrays(
        existing.mediumRisks,
        newMatrix.mediumRisks
      ),
      lowRisks: this.mergeArrays(existing.lowRisks, newMatrix.lowRisks),
    };
  }

  private mergeRiskCategories(existing: any, newCategories: any): any {
    if (!existing) return newCategories;
    if (!newCategories) return existing;

    const merged: any = {};
    const allKeys = new Set([
      ...Object.keys(existing),
      ...Object.keys(newCategories),
    ]);

    for (const key of Array.from(allKeys)) {
      merged[key] = this.mergeArrays(existing[key], newCategories[key]);
    }

    return merged;
  }

  private mergeScenarioPlanning(existing: any, newScenarios: any): any {
    if (!existing) return newScenarios;
    if (!newScenarios) return existing;

    return {
      ...existing,
      ...newScenarios,
      stressTestScenarios: this.mergeArrays(
        existing.stressTestScenarios,
        newScenarios.stressTestScenarios,
        "scenario"
      ),
    };
  }

  private mergeRiskBudget(existing: any, newBudget: any): any {
    if (!existing) return newBudget;
    if (!newBudget) return existing;

    return {
      ...existing,
      ...newBudget,
      allocation: this.mergeArrays(
        existing.allocation,
        newBudget.allocation,
        "category"
      ),
    };
  }

  private mergeObjects(existing: any, newObj: any): any {
    if (!existing) return newObj;
    if (!newObj) return existing;
    return { ...existing, ...newObj };
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
      `${industry} SaaS business risks challenges 2024`,
      `${industry} software startup failure factors analysis`,
      `SaaS regulatory compliance risks ${industry} GDPR`,
      `${industry} technology risks software development security`,
      `SaaS market risks ${industry} competition threats`,
      `${industry} software security risks data protection breaches`,
      `${ideaName} ${industry} business model risks`,
      `${industry} SaaS operational risks scalability`,
      `${industry} software financial risks funding challenges`,
      `SaaS risk management ${industry} best practices`,
    ];
  }
}
