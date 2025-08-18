"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getValidationOverview = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      validationMetrics: true,
      productMarketFitAnalysis: {
        include: {
          metrics: true,
        },
      },
      marketValidation: {
        include: {
          marketInsights: true,
        },
      },
      businessValidation: {
        include: {
          businessInsights: true,
          monthlyProjections: {
            orderBy: {
              month: "asc",
            },
          },
          acquisitionChannels: true,
        },
      },
      riskAnalysis: {
        include: {
          riskItems: {
            take: 5,
            orderBy: {
              impact: "desc",
            },
          },
        },
      },
      TargetAudienceSegmentation: true,
      MarketTrendAnalysis: {
        include: {
          marketTrends: {
            take: 5,
            orderBy: {
              impactScore: "desc",
            },
          },
        },
      },
      PricingStrategyAnalysis: {
        include: {
          pricingTiers: true,
          competitorPricing: true,
        },
      },
    },
  });
};