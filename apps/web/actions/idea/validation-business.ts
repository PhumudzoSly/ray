"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getBusinessValidation = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.businessValidation.findUnique({
    where: { 
      validation: {
        ideaId: ideaId
      }
    },
    include: {
      businessInsights: true,
      monthlyProjections: {
        orderBy: {
          month: "asc",
        },
      },
      acquisitionChannels: {
        orderBy: {
          effectiveness: "desc",
        },
      },
    },
  });
};