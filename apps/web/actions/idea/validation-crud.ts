"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

// IdeaValidation
export const getIdeaValidation = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      marketValidation: {
        include: { marketInsights: true, regionScores: true },
      },
      businessValidation: {
        include: {
          businessInsights: true,
          monthlyProjections: true,
          acquisitionChannels: true,
        },
      },
      validationMetrics: true,
      CustomerJourneyMapping: {
        include: {
          journeyStages: true,
          touchpoints: true,
          journeyPainPoints: true,
        },
      },
      TargetAudienceSegmentation: { include: { audienceSegments: true } },
      MarketTrendAnalysis: { include: { marketTrends: true } },
      CustomerNeedAnalysis: true,
      PricingStrategyAnalysis: {
        include: { pricingTiers: true, competitorPricing: true },
      },
      riskAnalysis: {
        include: {
          riskItems: true,
        },
      },
      productMarketFitAnalysis: {
        include: {
          metrics: true,
          feedback: true,
        },
      },
    },
  });
};
