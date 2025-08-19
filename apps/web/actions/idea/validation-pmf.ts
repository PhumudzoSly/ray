"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getProductMarketFitAnalysis = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.productMarketFitAnalysis.findUnique({
    where: { 
      validationId: ideaId
    },
    include: {
      metrics: true,
      feedback: true,
    },
  });
};