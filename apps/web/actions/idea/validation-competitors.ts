"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getCompetitorValidation = async ({ ideaId }: { ideaId: string }) => {
  await getSession();
  return await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      Competitor: {
        where: {
          isActive: true
        }
      }
    }
  });
};