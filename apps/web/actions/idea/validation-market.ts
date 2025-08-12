"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getMarketValidation = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.marketValidation.findUnique({
    where: { 
      validation: {
        ideaId: ideaId
      }
    },
    include: {
      marketInsights: true,
      regionScores: true,
    },
  });
};