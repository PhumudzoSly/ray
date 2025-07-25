"use server";
import { prisma } from "@workspace/backend";

export async function getValidationInsights(ideaId: string) {
  try {
    const insights = await prisma.validationInsight.findMany({
      where: {
        marketResearch: {
          ideaId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { data: insights };
  } catch (error) {
    console.error("Error fetching validation insights:", error);
    return { error: "Failed to fetch validation insights" };
  }
}

export async function getTechnologyAssessment(ideaId: string) {
  try {
    const assessment = await prisma.technologyAssessment.findFirst({
      where: {
        marketResearch: {
          ideaId,
        },
      },
    });

    return { data: assessment };
  } catch (error) {
    console.error("Error fetching technology assessment:", error);
    return { error: "Failed to fetch technology assessment" };
  }
}

export async function getRegulatoryCompliance(ideaId: string) {
  try {
    const compliance = await prisma.regulatoryCompliance.findFirst({
      where: {
        marketResearch: {
          ideaId,
        },
      },
    });

    return { data: compliance };
  } catch (error) {
    console.error("Error fetching regulatory compliance:", error);
    return { error: "Failed to fetch regulatory compliance" };
  }
}

export async function getDetailedScorecard(ideaId: string) {
  try {
    const scorecard = await prisma.validationScorecard.findFirst({
      where: {
        marketResearch: {
          ideaId,
        },
      },
      include: {
        scoreBreakdown: {
          orderBy: {
            category: "asc",
          },
        },
      },
    });

    return { data: scorecard };
  } catch (error) {
    console.error("Error fetching detailed scorecard:", error);
    return { error: "Failed to fetch detailed scorecard" };
  }
}

export async function updateValidationInsight(data: {
  id: string;
  confidence?: number;
  impactLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations?: string[];
  isVerified?: boolean;
}) {
  try {
    const updated = await prisma.validationInsight.update({
      where: { id: data.id },
      data: {
        confidence: data.confidence,
        impactLevel: data.impactLevel,
        recommendations: data.recommendations,
        isVerified: data.isVerified,
      },
    });

    return { data: updated };
  } catch (error) {
    console.error("Error updating validation insight:", error);
    return { error: "Failed to update validation insight" };
  }
}

export async function updateTechnologyAssessment(data: {
  id: string;
  technicalComplexity?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  developmentTimeline?: number;
  teamRequirements?: string[];
  recommendedStack?: string[];
  alternativeStacks?: string[];
  integrationRequirements?: string[];
  technicalRisks?: string[];
  scalabilityChallenges?: string[];
  securityConsiderations?: string[];
  developmentCosts?: number;
  infrastructureCosts?: number;
  maintenanceCosts?: number;
  technicalAdvantages?: string[];
  innovationPotential?: string;
}) {
  try {
    const updated = await prisma.technologyAssessment.update({
      where: { id: data.id },
      data: {
        technicalComplexity: data.technicalComplexity,
        developmentTimeline: data.developmentTimeline,
        teamRequirements: data.teamRequirements,
        recommendedStack: data.recommendedStack,
        alternativeStacks: data.alternativeStacks,
        integrationRequirements: data.integrationRequirements,
        technicalRisks: data.technicalRisks,
        scalabilityChallenges: data.scalabilityChallenges,
        securityConsiderations: data.securityConsiderations,
        developmentCosts: data.developmentCosts,
        infrastructureCosts: data.infrastructureCosts,
        maintenanceCosts: data.maintenanceCosts,
        technicalAdvantages: data.technicalAdvantages,
        innovationPotential: data.innovationPotential,
      },
    });

    return { data: updated };
  } catch (error) {
    console.error("Error updating technology assessment:", error);
    return { error: "Failed to update technology assessment" };
  }
}

export async function updateRegulatoryCompliance(data: {
  id: string;
  applicableRegulations?: string[];
  complianceLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  industryStandards?: string[];
  certificationRequirements?: string[];
  targetMarkets?: string[];
  localRegulations?: string[];
  complianceCosts?: number;
  timelineToCompliance?: number;
  requiredResources?: string[];
  complianceRisks?: string[];
  mitigationStrategies?: string[];
}) {
  try {
    const updated = await prisma.regulatoryCompliance.update({
      where: { id: data.id },
      data: {
        applicableRegulations: data.applicableRegulations,
        complianceLevel: data.complianceLevel,
        riskLevel: data.riskLevel,
        industryStandards: data.industryStandards,
        certificationRequirements: data.certificationRequirements,
        targetMarkets: data.targetMarkets,
        localRegulations: data.localRegulations,
        complianceCosts: data.complianceCosts,
        timelineToCompliance: data.timelineToCompliance,
        requiredResources: data.requiredResources,
        complianceRisks: data.complianceRisks,
        mitigationStrategies: data.mitigationStrategies,
      },
    });

    return { data: updated };
  } catch (error) {
    console.error("Error updating regulatory compliance:", error);
    return { error: "Failed to update regulatory compliance" };
  }
}
