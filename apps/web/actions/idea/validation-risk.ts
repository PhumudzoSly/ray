"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getRiskValidation = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.riskAnalysis.findUnique({
    where: { 
      validationId: ideaId
    },
    include: {
      riskItems: {
        take: 10,
        orderBy: {
          impact: "desc",
        },
      },
    },
  });
};