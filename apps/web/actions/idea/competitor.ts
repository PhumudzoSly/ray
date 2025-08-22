"use server";

import {
  CompetitorOptionalDefaults,
  CompetitiveMoveOptionalDefaults,
  CompetitorSwotOptionalDefaults,
  prisma,
} from "@workspace/backend";
import { getSession } from "../account/user";

export const getAllCompetitors = async (ideaId: string) => {
  await getSession();
  return await prisma.competitor.findMany({
    where: {
      ideaId,
    },
  });
};

export const createCompetitor = async ({
  competitor,
}: {
  competitor: CompetitorOptionalDefaults;
}) => {
  await getSession();
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
  await getSession();
  return await prisma.competitor.update({ where: { id }, data });
};

export const deleteCompetitor = async ({ id }: { id: string }) => {
  await getSession();
  return await prisma.competitor.delete({ where: { id } });
};

export const createCompetitiveMove = async ({
  move,
}: {
  move: CompetitiveMoveOptionalDefaults;
}) => {
  await getSession();
  return await prisma.competitiveMove.create({ data: move });
};

export const updateCompetitiveMove = async ({
  id,
  move,
}: {
  id: string;
  move: CompetitiveMoveOptionalDefaults;
}) => {
  await getSession();
  return await prisma.competitiveMove.update({ where: { id }, data: move });
};

export const deleteCompetitiveMove = async ({ id }: { id: string }) => {
  await getSession();
  return await prisma.competitiveMove.delete({ where: { id } });
};

export const createCompetitorSwot = async ({
  swot,
}: {
  swot: CompetitorSwotOptionalDefaults;
}) => {
  await getSession();
  return await prisma.competitorSwot.create({ data: swot });
};

export const updateCompetitorSwot = async ({
  id,
  swot,
}: {
  id: string;
  swot: CompetitorSwotOptionalDefaults;
}) => {
  await getSession();
  return await prisma.competitorSwot.update({ where: { id }, data: swot });
};

export const deleteCompetitorSwot = async ({ id }: { id: string }) => {
  await getSession();
  return await prisma.competitorSwot.delete({ where: { id } });
};

export const getCompetitor = async ({ id }: { id: string }) => {
  await getSession();
  return await prisma.competitor.findUnique({
    where: { id },
    include: { idea: true },
  });
};

export const getCompetitiveMoves = async (competitorId: string) => {
  await getSession();
  return await prisma.competitiveMove.findMany({
    where: {
      competitorId,
    },
  });
};

export const getCompetitiveMove = async ({ id }: { id: string }) => {
  await getSession();
  return await prisma.competitiveMove.findUnique({ where: { id } });
};

export const getCompetitorSwots = async (competitorId: string) => {
  await getSession();
  return await prisma.competitorSwot.findMany({
    where: {
      competitorId,
    },
  });
};

export const getCompetitorSwot = async ({ id }: { id: string }) => {
  await getSession();
  return await prisma.competitorSwot.findUnique({ where: { id } });
};
