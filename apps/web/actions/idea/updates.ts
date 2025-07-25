"use server";
import { getSession } from "@/actions/account/user";
import { prisma } from "@workspace/backend";

export const updateProblemSolved = async ({
  ideaId,
  problemSolved,
}: {
  ideaId: string;
  problemSolved: string;
}) => {
  const { org } = await getSession();

  const idea = await prisma.idea.update({
    where: {
      id: ideaId,
      organizationId: org,
    },
    data: { problemSolved },
  });

  return idea;
};

export const updateSolutionOffered = async ({
  ideaId,
  solutionOffered,
}: {
  ideaId: string;
  solutionOffered: string;
}) => {
  const { org } = await getSession();

  const idea = await prisma.idea.update({
    where: {
      id: ideaId,
      organizationId: org,
    },
    data: { solutionOffered },
  });

  return idea;
};
