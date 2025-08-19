"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getCustomerNeedAnalysis = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.customerNeedAnalysis.findUnique({
    where: { 
      validationId: ideaId
    },
    include: {
      customerNeeds: true,
      painPoints: true,
    },
  });
};