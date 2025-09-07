"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

// Base validation data with overall metrics
export async function getIdeaValidation(ideaId: string) {
  await getSession();
  return await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      idea: true,
      validationMetrics: true,
    },
  });
}

// Legacy function for backward compatibility
export async function getValidation({ id }: { id: string }) {
  return await getIdeaValidation(id);
}

// Individual module queries for component-level fetching
export async function getMarketValidation(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      marketValidation: {
        include: {
          marketInsights: true,
          regionScores: true,
        },
      },
    },
  });
  return validation?.marketValidation;
}

export async function getBusinessValidation(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      businessValidation: {
        include: {
          businessInsights: true,
          monthlyProjections: true,
          acquisitionChannels: true,
        },
      },
    },
  });
  return validation?.businessValidation;
}

export async function getRiskAnalysis(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      riskAnalysis: {
        include: {
          riskItems: true,
        },
      },
    },
  });
  return validation?.riskAnalysis;
}

export async function getProductMarketFitAnalysis(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      productMarketFitAnalysis: {
        include: {
          metrics: true,
          feedback: true,
        },
      },
    },
  });
  return validation?.productMarketFitAnalysis;
}

export async function getCustomerJourney(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      CustomerJourneyMapping: {
        include: {
          journeyStages: true,
          touchpoints: true,
          journeyPainPoints: true,
        },
      },
    },
  });
  return validation?.CustomerJourneyMapping;
}

export async function getAudienceSegmentation(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      TargetAudienceSegmentation: {
        include: {
          audienceSegments: true,
        },
      },
    },
  });
  return validation?.TargetAudienceSegmentation;
}

export async function getMarketTrends(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      MarketTrendAnalysis: {
        include: {
          marketTrends: true,
        },
      },
    },
  });
  return validation?.MarketTrendAnalysis;
}

export async function getCustomerNeeds(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      CustomerNeedAnalysis: {
        include: {
          customerNeeds: true,
          painPoints: true,
        },
      },
    },
  });
  return validation?.CustomerNeedAnalysis;
}

export async function getPricingStrategy(ideaId: string) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: { ideaId },
    include: {
      PricingStrategyAnalysis: {
        include: {
          pricingTiers: true,
          competitorPricing: true,
        },
      },
    },
  });
  return validation?.PricingStrategyAnalysis;
}
