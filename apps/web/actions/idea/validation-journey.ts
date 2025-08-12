"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getCustomerJourneyMapping = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.customerJourneyMapping.findUnique({
    where: { 
      validation: {
        ideaId: ideaId
      }
    },
    include: {
      journeyStages: true,
      touchpoints: true,
      journeyPainPoints: true,
    },
  });
};