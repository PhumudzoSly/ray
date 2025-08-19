"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getPricingValidation = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.pricingStrategyAnalysis.findUnique({
    where: { 
      validationId: ideaId
    },
    include: {
      pricingTiers: true,
      competitorPricing: true,
    },
  });
};