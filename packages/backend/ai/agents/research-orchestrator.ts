import { prisma } from "../../prisma/prisma";
import { generateMarketSizeData } from "./market-size-agent";
import { generateCompetitorData } from "./competitor-discovery-agent";
import { generateCustomerSegmentsData } from "./customer-segments-agent";
import { generateTechnologyTrendsData } from "./technology-trends-agent";
import { generateValidationScorecard } from "./validation-scorecard-agent";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

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
}

// ============================================================================
// MODULAR RESEARCH ORCHESTRATOR
// ============================================================================

export const runModularResearch = async (
  ideaId: string,
  additionalContext?: any
) => {
  try {
    console.log("🚀 Starting modular research for idea:", ideaId);

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

    // If research exists but idea doesn't have aiOverallValidation, delete the research and run again
    if (existingResearch && !idea.aiOverallValidation) {
      console.log(
        "🗑️ Deleting existing research for idea without aiOverallValidation"
      );
      await prisma.marketResearch.delete({
        where: { ideaId },
      });
      console.log("✅ Existing research deleted, proceeding with new research");
    } else if (existingResearch) {
      throw new Error("Research already exists for this idea");
    }

    const researchResults: ResearchResults = {
      ideaId,
      startTime: new Date(),
      agents: [] as any[],
      totalApiCalls: 0,
      originalIdea: idea,
      additionalContext: additionalContext || {},
    };

    // STEP 1: MARKET SIZE ANALYSIS (1 API call)
    console.log("📊 Step 1/5: Market Size Agent");
    try {
      const marketSizeResult = await generateMarketSizeData(
        idea,
        researchResults.agents, // Pass previous research
        additionalContext
      );
      researchResults.agents.push({
        type: "market-size",
        status: "completed",
        data: marketSizeResult.marketSizeData,
        researchText: marketSizeResult.researchText,
        timestamp: marketSizeResult.timestamp,
      });
      researchResults.totalApiCalls += 1;
      console.log("✅ Market Size Agent completed");
    } catch (error) {
      console.error("❌ Market Size Agent failed:", error);
      researchResults.agents.push({
        type: "market-size",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Wait 90-120 seconds before next agent
    const delayMs = getRandomDelay(90000, 120000);
    console.log(
      `⏳ Waiting ${Math.round(delayMs / 1000)} seconds before next agent...`
    );
    await delay(delayMs);

    // STEP 2: COMPETITOR DISCOVERY (1 API call)
    console.log("🏆 Step 2/5: Competitor Discovery Agent");
    try {
      const competitorResult = await generateCompetitorData(
        idea,
        researchResults.agents, // Pass previous research
        additionalContext
      );
      researchResults.agents.push({
        type: "competitor-discovery",
        status: "completed",
        data: competitorResult.competitorData,
        researchText: competitorResult.researchText,
        timestamp: competitorResult.timestamp,
      });
      researchResults.totalApiCalls += 1;
      console.log("✅ Competitor Discovery Agent completed");
    } catch (error) {
      console.error("❌ Competitor Discovery Agent failed:", error);
      researchResults.agents.push({
        type: "competitor-discovery",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Wait 90-120 seconds before next agent
    const delayMs2 = getRandomDelay(90000, 120000);
    console.log(
      `⏳ Waiting ${Math.round(delayMs2 / 1000)} seconds before next agent...`
    );
    await delay(delayMs2);

    // STEP 3: CUSTOMER SEGMENTS ANALYSIS (1 API call)
    console.log("👥 Step 3/5: Customer Segments Agent");
    try {
      const segmentsResult = await generateCustomerSegmentsData(
        idea,
        researchResults.agents, // Pass previous research
        additionalContext
      );
      researchResults.agents.push({
        type: "customer-segments",
        status: "completed",
        data: segmentsResult.segmentsData,
        researchText: segmentsResult.researchText,
        timestamp: segmentsResult.timestamp,
      });
      researchResults.totalApiCalls += 1;
      console.log("✅ Customer Segments Agent completed");
    } catch (error) {
      console.error("❌ Customer Segments Agent failed:", error);
      researchResults.agents.push({
        type: "customer-segments",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Wait 90-120 seconds before next agent
    const delayMs3 = getRandomDelay(90000, 120000);
    console.log(
      `⏳ Waiting ${Math.round(delayMs3 / 1000)} seconds before next agent...`
    );
    await delay(delayMs3);

    // STEP 4: TECHNOLOGY TRENDS ANALYSIS (1 API call)
    console.log("🔧 Step 4/5: Technology Trends Agent");
    try {
      const technologyResult = await generateTechnologyTrendsData(
        idea,
        researchResults.agents, // Pass previous research
        additionalContext
      );
      researchResults.agents.push({
        type: "technology-trends",
        status: "completed",
        data: technologyResult?.technologyData || {},
        researchText: technologyResult?.researchText || "",
        timestamp: technologyResult?.timestamp || new Date(),
      });
      researchResults.totalApiCalls += 1;
      console.log("✅ Technology Trends Agent completed");
    } catch (error) {
      console.error("❌ Technology Trends Agent failed:", error);
      researchResults.agents.push({
        type: "technology-trends",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Wait 90-120 seconds before next agent
    const delayMs4 = getRandomDelay(90000, 120000);
    console.log(
      `⏳ Waiting ${Math.round(delayMs4 / 1000)} seconds before next agent...`
    );
    await delay(delayMs4);

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
          additionalContext
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
  const technologyAgent = researchResults.agents.find(
    (a: any) => a.type === "technology-trends"
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
      emergingTechnologies:
        technologyAgent?.data?.emergingTechnologies ||
        marketSizeAgent?.data?.emergingTechnologies ||
        [],
      regulatoryFactors: marketSizeAgent?.data?.regulatoryFactors || [],
      validationScore: 0, // Will be updated by scorecard
      confidenceLevel: "MEDIUM",
    },
  });

  // Save competitor data
  const competitorAgent = researchResults.agents.find(
    (a: any) => a.type === "competitor-discovery"
  );
  if (competitorAgent?.status === "completed") {
    const competitiveLandscape = await prisma.competitiveLandscape.create({
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

    // Save individual competitors
    if (
      competitorAgent.data.competitors &&
      Array.isArray(competitorAgent.data.competitors)
    ) {
      for (const competitor of competitorAgent.data.competitors) {
        await prisma.competitor.create({
          data: {
            competitiveLandscapeId: competitiveLandscape.id,
            name: competitor.name,
            website: competitor.website,
            description: competitor.description,
            logoUrl: competitor.logoUrl,
            foundedYear: competitor.foundedYear,
            headquarters: competitor.headquarters,
            employeeCount: competitor.employeeCount,
            fundingRaised: competitor.fundingRaised,
            marketShare: competitor.marketShare,
            annualRevenue: competitor.annualRevenue,
            targetAudience: competitor.targetAudience,
            productFeatures: competitor.productFeatures || [],
            pricingModel: competitor.pricingModel,
            techStack: competitor.techStack || [],
            integrations: competitor.integrations || [],
            strengths: competitor.strengths || [],
            weaknesses: competitor.weaknesses || [],
            opportunities: competitor.opportunities || [],
            threats: competitor.threats || [],
            competitiveAdvantage: competitor.competitiveAdvantage,
            differentiationFactors: competitor.differentiationFactors || [],
            threatLevel: competitor.threatLevel,
            competitivePosition: competitor.competitivePosition,
            userGrowthRate: competitor.userGrowthRate,
            churnRate: competitor.churnRate,
            customerSatisfaction: competitor.customerSatisfaction,
            marketCap: competitor.marketCap,
          },
        });
      }
    }
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
  const technologyAgentData = researchResults.agents.find(
    (a: any) => a.type === "technology-trends"
  );
  if (technologyAgentData?.status === "completed") {
    // Validate and transform technology data to ensure correct types
    const techData = technologyAgentData.data;

    // Convert developmentTimeline to integer if it's a string
    let developmentTimeline: number | undefined = undefined;
    if (
      techData.developmentTimeline !== undefined &&
      techData.developmentTimeline !== null
    ) {
      if (typeof techData.developmentTimeline === "string") {
        // Try to extract number from string like "6-12 months" -> 9 (average)
        const match = techData.developmentTimeline.match(/(\d+)/g);
        if (match && match.length >= 1) {
          const numbers = match.map((n: any) => parseInt(n));
          developmentTimeline = Math.round(
            numbers.reduce((a: any, b: any) => a + b, 0) / numbers.length
          );
        } else {
          developmentTimeline = 6; // Default fallback
        }
      } else if (typeof techData.developmentTimeline === "number") {
        developmentTimeline = Math.round(techData.developmentTimeline);
      }
    }

    await prisma.technologyAssessment.create({
      data: {
        marketResearchId: marketResearch.id,
        technicalComplexity: techData.technicalComplexity,
        developmentTimeline: developmentTimeline,
        teamRequirements: techData.teamRequirements || [],
        recommendedStack: techData.recommendedStack || [],
        alternativeStacks: techData.alternativeStacks || [],
        integrationRequirements: techData.integrationRequirements || [],
        technicalRisks: techData.technicalRisks || [],
        scalabilityChallenges: techData.scalabilityChallenges || [],
        securityConsiderations: techData.securityConsiderations || [],
        developmentCosts: techData.developmentCosts,
        infrastructureCosts: techData.infrastructureCosts,
        maintenanceCosts: techData.maintenanceCosts,
        technicalAdvantages: techData.technicalAdvantages || [],
        innovationPotential: techData.innovationPotential,
      },
    });
  }

  // Save validation scorecard
  const scorecardAgent = researchResults.agents.find(
    (a: any) => a.type === "validation-scorecard"
  );
  if (scorecardAgent?.status === "completed") {
    // Validate and transform scorecard data to ensure correct types
    const scorecardData = scorecardAgent.data;

    // Convert nextReviewDate to proper DateTime if it's a string
    let nextReviewDate: Date | undefined = undefined;
    if (
      scorecardData.nextReviewDate !== undefined &&
      scorecardData.nextReviewDate !== null
    ) {
      if (typeof scorecardData.nextReviewDate === "string") {
        // Try to parse date string or create relative date
        if (
          scorecardData.nextReviewDate.includes("days") ||
          scorecardData.nextReviewDate.includes("months")
        ) {
          // Handle relative dates like "30 days" or "3 months"
          const match =
            scorecardData.nextReviewDate.match(/(\d+)\s*(day|month)/i);
          if (match) {
            const amount = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            const now = new Date();
            if (unit === "day") {
              nextReviewDate = new Date(
                now.getTime() + amount * 24 * 60 * 60 * 1000
              );
            } else if (unit === "month") {
              nextReviewDate = new Date(
                now.getFullYear(),
                now.getMonth() + amount,
                now.getDate()
              );
            }
          }
        } else {
          // Try to parse as ISO date string
          const parsed = new Date(scorecardData.nextReviewDate);
          if (!isNaN(parsed.getTime())) {
            nextReviewDate = parsed;
          }
        }
      } else if (scorecardData.nextReviewDate instanceof Date) {
        nextReviewDate = scorecardData.nextReviewDate;
      }
    }

    await prisma.validationScorecard.create({
      data: {
        marketResearchId: marketResearch.id,
        marketScore: scorecardData.dimensionScores?.marketOpportunity?.score,
        competitiveScore:
          scorecardData.dimensionScores?.competitivePositioning?.score,
        technicalScore:
          scorecardData.dimensionScores?.technicalFeasibility?.score,
        financialScore:
          scorecardData.dimensionScores?.financialViability?.score,
        riskScore: scorecardData.dimensionScores?.riskAssessment?.score,
        weightedScore: scorecardData.overallScore,
        primaryRecommendation: scorecardData.strategicRecommendations?.primary,
        secondaryRecommendations:
          scorecardData.strategicRecommendations?.secondary || [],
        riskMitigationStrategies:
          scorecardData.riskAnalysis?.mitigationStrategies || [],
        validationStatus: scorecardData.validationStatus,
        nextReviewDate: nextReviewDate,
      },
    });

    // Update market research with validation score
    await prisma.marketResearch.update({
      where: { id: marketResearch.id },
      data: {
        validationScore: scorecardData.overallScore,
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
