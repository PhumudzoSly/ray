"use server";

import { inngestClient } from "@/lib/inngest";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const prepValidation = async ({ ideaId }: { ideaId: string }) => {
  await getSession();

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      Competitor: true,
    },
  });

  if (!idea) {
    throw new Error("Idea not found");
  }

  await inngestClient.send({
    name: "deep-research/start",
    data: {
      ideaId,
    },
  });
};

export const findCompetitors = async ({ ideaId }: { ideaId: string }) => {
  const { org } = await getSession();

  await inngestClient.send({
    name: "generate-competitors/start",
    data: {
      ideaId,
    },
  });
};

export const findCompetitorMoves = async ({
  ideaId,
  competitorId,
}: {
  ideaId: string;
  competitorId: string;
}) => {
  const { org } = await getSession();

  await inngestClient.send({
    name: "competitor-moves/start",
    data: {
      ideaId,
      competitorId,
    },
  });
};
