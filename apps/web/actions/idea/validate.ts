"use server";

import { inngestClient } from "@/lib/inngest";
import {
  CompetitorOptionalDefaults,
  prisma,
  ResearchDepthType,
  ResearchPhaseTypeType,
} from "@workspace/backend";
import { getSession } from "../account/user";

export const prepValidation = async ({
  ideaId,
  name,
  type,
  prompt,
  depth,
}: {
  ideaId: string;
  type: ResearchPhaseTypeType;
  prompt?: string;
  name: string;
  depth: ResearchDepthType;
}) => {
  //
  const { org } = await getSession();

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      Competitor: true,
    },
  });

  if (!idea) {
    throw new Error("Idea not found");
  }

  const research = await prisma.researchSession.create({
    data: {
      depth,
      ideaId,
      organizationId: idea.organizationId,
      status: "INITIALIZING",
      overallConfidence: 0,
      name,
      prompt,
    },
  });

  await inngestClient.send({
    name: "deep-research/start",
    data: {
      ideaId,
      researchId: research.id,
      prompt,
      depth,
      type,
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

///////////////// GET DATA ///////////////////

export const createCompetitor = async ({
  competitor,
}: {
  competitor: CompetitorOptionalDefaults;
}) => {
  const { org } = await getSession();
  return await prisma.competitor.create({
    data: {
      ...competitor,
    },
  });
};

export const editCompetitor = async ({
  id,
  data,
}: {
  id: string;
  data: CompetitorOptionalDefaults;
}) => {
  const { org } = await getSession();
  return await prisma.competitor.update({ where: { id }, data });
};

export const deleteCompetitor = async ({ id }: { id: string }) => {
  const { org } = await getSession();
  return await prisma.competitor.delete({ where: { id } });
};

export const getValidations = async ({ ideaId }: { ideaId: string }) => {
  const { org } = await getSession();

  return await prisma.researchSession.findMany({
    where: {
      ideaId,
      organizationId: org,
    },
    select: {
      _count: {
        select: {
          findings: true,
          phases: true,
        },
      },
      id: true,
      name: true,
      overallConfidence: true,
      depth: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getValidationResults = async ({
  researchId,
}: {
  researchId: string;
}) => {
  const { org } = await getSession();

  return await prisma.researchSession.findUnique({
    where: { id: researchId, organizationId: org },
    include: {
      findings: true,
      phases: true,
    },
  });
};

export const deleteValidation = async ({ id }: { id: string }) => {
  await getSession();
  return await prisma.researchSession.delete({
    where: { id },
  });
};
