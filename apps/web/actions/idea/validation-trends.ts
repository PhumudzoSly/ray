"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getMarketTrendAnalysis = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.marketTrendAnalysis.findUnique({
    where: { 
      validation: {
        ideaId: ideaId
      }
    },
    include: {
      marketTrends: {
        take: 10,
        orderBy: {
          impactScore: "desc",
        },
      },
    },
  });
};