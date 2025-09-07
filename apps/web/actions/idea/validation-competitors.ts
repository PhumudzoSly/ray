"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export async function getCompetitorValidation({ ideaId }: { ideaId: string }) {
  await getSession();
  const competitors = await prisma.competitor.findMany({
    where: { ideaId },
    include: {
      CompetitorSwot: true,
      competitiveMoves: true,
    },
  });

  const competitorPricing = await prisma.competitorPricing.findMany({
    where: {
      pricingStrategyAnalysis: {
        validation: {
          ideaId,
        },
      },
    },
  });

  return {
    competitors,
    competitorPricing,
  };
}
