import { prisma } from "../../prisma/prisma";
import { generateMarketSizeData } from "./market-size-agent";
import { generateCompetitorData } from "./competitor-discovery-agent";
import { generateCustomerSegmentsData } from "./customer-segments-agent";
import { generateTechnologyTrendsData } from "./technology-trends-agent";
import { generateValidationScorecard } from "./validation-scorecard-agent";
import { UnifiedCrawlerService } from "../crawler";

// ============================================================================
// RESEARCH RESULTS INTERFACE
// ============================================================================

export interface ResearchResults {
  ideaId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  agents: any[];
  totalApiCalls: number;
  originalIdea: any;
  additionalContext: any;
  crawlerService?: UnifiedCrawlerService;
}

// ============================================================================
// MODULAR RESEARCH ORCHESTRATOR
// ============================================================================

export const runModularResearch = async (
  ideaId: string,
  additionalContext?: any
) => {
  let crawlerService: UnifiedCrawlerService | undefined;

  try {
    console.log("🚀 Starting modular research for idea:", ideaId);

    // Initialize crawler service for all agents
    crawlerService = new UnifiedCrawlerService();

    // Get the idea data
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: { organization: true },
    });

    if (!idea) throw new Error("Idea not found");

    // Check if research already exists
    const existingResearch = await prisma.marketResearch.findUnique({
      where: { ideaId },
    });

    if (existingResearch) {
      throw new Error("Research already exists for this idea");
    }

    const researchResults: ResearchResults = {
      ideaId,
      startTime: new Date(),
      agents: [] as any[],
      totalApiCalls: 0,
      originalIdea: idea,
      additionalContext: additionalContext || {},
      crawlerService,
    };

    // STEP 1: MARKET SIZE ANALYSIS (2 API calls)
    console.log("📊 Step 1/5: Market Size Agent");
    try {
      const marketSizeResult = await generateMarketSizeData(
        idea,
        researchResults.agents, // Pass previous research
        additionalContext,
        crawlerService
      );
      researchResults.agents.push({
        type: "market-size",
        status: "completed",
        data: marketSizeResult.marketSizeData,
        researchText: marketSizeResult.researchText,
        timestamp: marketSizeResult.timestamp,
      });
      researchResults.totalApiCalls += 2;
      console.log("✅ Market Size Agent completed");
    } catch (error) {
      console.error("❌ Market Size Agent failed:", error);
      researchResults.agents.push({
        type: "market-size",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // STEP 2: COMPETITOR DISCOVERY (2 API calls)
    console.log("🏆 Step 2/5: Competitor Discovery Agent");
    try {
      const competitorResult = await generateCompetitorData(
        idea,
        researchResults.agents, // Pass previous research
        additionalContext,
        crawlerService
      );
      researchResults.agents.push({
        type: "competitor-discovery",
        status: "completed",
        data: competitorResult.competitorData,
        researchText: competitorResult.researchText,
        timestamp: competitorResult.timestamp,
      });
      researchResults.totalApiCalls += 2;
      console.log("✅ Competitor Discovery Agent completed");
    } catch (error) {
      console.error("❌ Competitor Discovery Agent failed:", error);
      researchResults.agents.push({
        type: "competitor-discovery",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // STEP 3: CUSTOMER SEGMENTS ANALYSIS (2 API calls)
    console.log("👥 Step 3/5: Customer Segments Agent");
    try {
      const segmentsResult = await generateCustomerSegmentsData(
        idea,
        researchResults.agents, // Pass previous research
        additionalContext,
        crawlerService
      );
      researchResults.agents.push({
        type: "customer-segments",
        status: "completed",
        data: segmentsResult.segmentsData,
        researchText: segmentsResult.researchText,
        timestamp: segmentsResult.timestamp,
      });
      researchResults.totalApiCalls += 2;
      console.log("✅ Customer Segments Agent completed");
    } catch (error) {
      console.error("❌ Customer Segments Agent failed:", error);
      researchResults.agents.push({
        type: "customer-segments",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // STEP 4: TECHNOLOGY TRENDS ANALYSIS (2 API calls)
    console.log("🔧 Step 4/5: Technology Trends Agent");
    try {
      const technologyResult = await generateTechnologyTrendsData(
        idea,
        researchResults.agents, // Pass previous research
        additionalContext,
        crawlerService
      );
      researchResults.agents.push({
        type: "technology-trends",
        status: "completed",
        data: technologyResult.technologyData,
        researchText: technologyResult.researchText,
        timestamp: technologyResult.timestamp,
      });
      researchResults.totalApiCalls += 2;
      console.log("✅ Technology Trends Agent completed");
    } catch (error) {
      console.error("❌ Technology Trends Agent failed:", error);
      researchResults.agents.push({
        type: "technology-trends",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // STEP 5: VALIDATION SCORECARD (1 API call)
    console.log("📈 Step 5/5: Validation Scorecard Agent");
    try {
      // Get successful agent results
      const marketSizeData = researchResults.agents.find(
        (a) => a.type === "market-size"
      )?.data;
      const competitorData = researchResults.agents.find(
        (a) => a.type === "competitor-discovery"
      )?.data;
      const segmentsData = researchResults.agents.find(
        (a) => a.type === "customer-segments"
      )?.data;
      const technologyData = researchResults.agents.find(
        (a) => a.type === "technology-trends"
      )?.data;

      if (marketSizeData && competitorData && segmentsData && technologyData) {
        const scorecardResult = await generateValidationScorecard(
          idea,
          marketSizeData,
          competitorData,
          segmentsData,
          technologyData,
          additionalContext,
          crawlerService
        );
        researchResults.agents.push({
          type: "validation-scorecard",
          status: "completed",
          data: scorecardResult.scorecardData,
          timestamp: scorecardResult.timestamp,
        });
        researchResults.totalApiCalls += 1;
        console.log("✅ Validation Scorecard Agent completed");
      } else {
        throw new Error(
          "Insufficient data from previous agents for scorecard generation"
        );
      }
    } catch (error) {
      console.error("❌ Validation Scorecard Agent failed:", error);
      researchResults.agents.push({
        type: "validation-scorecard",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // STEP 6: SAVE TO DATABASE
    console.log("💾 Saving research results to database...");
    const savedResearch = await saveModularResearchToDatabase(
      researchResults,
      ideaId
    );
    console.log("✅ Research saved to database");

    // STEP 7: UPDATE IDEA VALIDATION SCORE
    const scorecardAgent = researchResults.agents.find(
      (a) => a.type === "validation-scorecard"
    );
    if (
      scorecardAgent?.status === "completed" &&
      scorecardAgent.data?.overallScore
    ) {
      await prisma.idea.update({
        where: { id: ideaId },
        data: {
          aiOverallValidation: scorecardAgent.data.overallScore,
        },
      });
      console.log(
        "📈 Updated idea validation score:",
        scorecardAgent.data.overallScore
      );
    }

    researchResults.endTime = new Date();
    researchResults.duration =
      researchResults.endTime.getTime() - researchResults.startTime.getTime();

    console.log("🎉 Modular research completed successfully!");
    console.log(`📊 Total API calls: ${researchResults.totalApiCalls}`);
    console.log(
      `⏱️ Total duration: ${Math.round(researchResults.duration / 1000)}s`
    );

    return {
      success: true,
      researchResults,
      savedResearch,
      totalApiCalls: researchResults.totalApiCalls,
      researchType: "modular",
    };
  } catch (error) {
    console.error("❌ Modular research failed:", error);
    throw error;
  } finally {
    // Clean up crawler service
    if (crawlerService) {
      crawlerService.destroy();
    }
  }
};

// ============================================================================
// DATABASE SAVE FUNCTION
// ============================================================================

const saveModularResearchToDatabase = async (
  researchResults: ResearchResults,
  ideaId: string
) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: { organization: true },
  });

  if (!idea) throw new Error("Idea not found");

  // Create market research record
  const marketSizeAgent = researchResults.agents.find(
    (a: any) => a.type === "market-size"
  );
  const marketResearch = await prisma.marketResearch.create({
    data: {
      ideaId,
      organizationId: idea.organizationId,
      marketSize: marketSizeAgent?.data?.totalAddressableMarket,
      marketGrowthRate: marketSizeAgent?.data?.marketGrowthRate,
      marketMaturity: marketSizeAgent?.data?.marketMaturity || "GROWING",
      totalAddressableMarket: marketSizeAgent?.data?.totalAddressableMarket,
      serviceableAddressableMarket:
        marketSizeAgent?.data?.serviceableAddressableMarket,
      serviceableObtainableMarket:
        marketSizeAgent?.data?.serviceableObtainableMarket,
      keyTrends: marketSizeAgent?.data?.growthDrivers || [],
      emergingTechnologies: marketSizeAgent?.data?.emergingTechnologies || [],
      regulatoryFactors: [],
      validationScore: 0, // Will be updated by scorecard
      confidenceLevel: "MEDIUM",
    },
  });

  // Save competitor data
  const competitorAgent = researchResults.agents.find(
    (a: any) => a.type === "competitor-discovery"
  );
  if (competitorAgent?.status === "completed") {
    await prisma.competitiveLandscape.create({
      data: {
        marketResearchId: marketResearch.id,
        competitiveIntensity: competitorAgent.data.competitiveIntensity,
        marketConcentration: competitorAgent.data.marketConcentration,
        entryBarriers: competitorAgent.data.entryBarriers,
        switchingCosts: competitorAgent.data.switchingCosts,
        emergingThreats: competitorAgent.data.emergingThreats,
        marketDisruptions: competitorAgent.data.marketDisruptions,
        differentiationOpportunities:
          competitorAgent.data.differentiationOpportunities,
        competitiveAdvantage: competitorAgent.data.competitiveAdvantage,
      },
    });
  }

  // Save customer segments data
  const segmentsAgent = researchResults.agents.find(
    (a: any) => a.type === "customer-segments"
  );
  if (segmentsAgent?.status === "completed") {
    for (const segment of segmentsAgent.data.segments || []) {
      await prisma.targetAudience.create({
        data: {
          marketResearchId: marketResearch.id,
          segmentName: segment.segmentName,
          ageRange: segment.ageRange,
          location: segment.location,
          companySize: segment.companySize,
          industry: segment.industry,
          painPoints: segment.primaryPainPoints,
          decisionFactors: segment.decisionFactors,
          budgetRange: segment.budgetRange,
          techSavviness: segment.techSavviness,
          estimatedSize: segment.estimatedSize,
          averageSpend: segment.averageSpend,
          segmentValue: segment.segmentValue,
          isPrimary: segment.segmentType === "PRIMARY",
          priority: segment.priority,
        },
      });
    }
  }

  // Save technology data
  const technologyAgent = researchResults.agents.find(
    (a: any) => a.type === "technology-trends"
  );
  if (technologyAgent?.status === "completed") {
    await prisma.technologyAssessment.create({
      data: {
        marketResearchId: marketResearch.id,
        technicalComplexity: technologyAgent.data.technicalComplexity,
        developmentTimeline: technologyAgent.data.developmentTimeline,
        teamRequirements: technologyAgent.data.teamRequirements || [],
        recommendedStack: technologyAgent.data.recommendedStack || [],
        alternativeStacks: technologyAgent.data.alternativeStacks || [],
        integrationRequirements:
          technologyAgent.data.integrationRequirements || [],
        technicalRisks: technologyAgent.data.technicalRisks || [],
        scalabilityChallenges: technologyAgent.data.scalabilityChallenges || [],
        securityConsiderations:
          technologyAgent.data.securityConsiderations || [],
        developmentCosts: technologyAgent.data.developmentCosts,
        infrastructureCosts: technologyAgent.data.infrastructureCosts,
        maintenanceCosts: technologyAgent.data.maintenanceCosts,
        technicalAdvantages: technologyAgent.data.technicalAdvantages || [],
        innovationPotential: technologyAgent.data.innovationPotential,
      },
    });
  }

  // Save validation scorecard
  const scorecardAgent = researchResults.agents.find(
    (a: any) => a.type === "validation-scorecard"
  );
  if (scorecardAgent?.status === "completed") {
    await prisma.validationScorecard.create({
      data: {
        marketResearchId: marketResearch.id,
        marketScore:
          scorecardAgent.data.dimensionScores?.marketOpportunity?.score,
        competitiveScore:
          scorecardAgent.data.dimensionScores?.competitivePositioning?.score,
        technicalScore:
          scorecardAgent.data.dimensionScores?.technicalFeasibility?.score,
        financialScore:
          scorecardAgent.data.dimensionScores?.financialViability?.score,
        riskScore: scorecardAgent.data.dimensionScores?.riskAssessment?.score,
        weightedScore: scorecardAgent.data.overallScore,
        primaryRecommendation:
          scorecardAgent.data.strategicRecommendations?.primary,
        secondaryRecommendations:
          scorecardAgent.data.strategicRecommendations?.secondary || [],
        riskMitigationStrategies:
          scorecardAgent.data.riskAnalysis?.mitigationStrategies || [],
        validationStatus: scorecardAgent.data.validationStatus,
        nextReviewDate: scorecardAgent.data.nextReviewDate,
      },
    });

    // Update market research with validation score
    await prisma.marketResearch.update({
      where: { id: marketResearch.id },
      data: {
        validationScore: scorecardAgent.data.overallScore,
      },
    });
  }

  return {
    marketResearchId: marketResearch.id,
    agentsCompleted: researchResults.agents.filter(
      (a: any) => a.status === "completed"
    ).length,
    totalAgents: researchResults.agents.length,
  };
};
