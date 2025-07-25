import { getSession } from "@/actions/account/user";
import { prisma } from "@workspace/backend";

export const getMarketResearch = async (ideaId: string) => {
  const { org } = await getSession();

  const marketResearch = await prisma.marketResearch.findFirst({
    where: {
      ideaId,
      organizationId: org,
    },
    include: {
      targetAudiences: true,
      marketTrends: true,
      validationScorecard: true,
      financialProjection: true,
    },
  });

  return marketResearch;
};

export const getTargetAudiences = async (ideaId: string) => {
  const { org } = await getSession();

  const targetAudiences = await prisma.targetAudience.findMany({
    where: {
      marketResearch: {
        ideaId,
        organizationId: org,
      },
    },
    orderBy: { priority: "desc" },
  });

  return targetAudiences;
};

export const getMarketTrends = async (ideaId: string) => {
  const { org } = await getSession();

  const marketTrends = await prisma.marketTrend.findMany({
    where: {
      marketResearch: {
        ideaId,
        organizationId: org,
      },
    },
    orderBy: { impact: "desc" },
  });

  return marketTrends;
};

export const getValidationScorecard = async (ideaId: string) => {
  const { org } = await getSession();

  const scorecard = await prisma.validationScorecard.findFirst({
    where: {
      marketResearch: {
        ideaId,
        organizationId: org,
      },
    },
    include: {
      scoreBreakdown: true,
    },
  });

  return scorecard;
};

export const getFinancialProjection = async (ideaId: string) => {
  const { org } = await getSession();

  const projection = await prisma.financialProjection.findFirst({
    where: {
      marketResearch: {
        ideaId,
        organizationId: org,
      },
    },
    include: {
      fundingRounds: true,
    },
  });

  return projection;
};

export const getMarketSignals = async (ideaId: string) => {
  const { org } = await getSession();

  const marketSignals = await prisma.marketSignal.findMany({
    where: {
      marketResearch: {
        ideaId,
        organizationId: org,
      },
    },
    orderBy: { signalStrength: "desc" },
  });

  return marketSignals;
};
