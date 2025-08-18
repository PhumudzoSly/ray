"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getAudienceValidation = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.targetAudienceSegmentation.findUnique({
    where: { 
      validation: {
        ideaId: ideaId
      }
    },
    include: {
      audienceSegments: true,
    },
  });
};