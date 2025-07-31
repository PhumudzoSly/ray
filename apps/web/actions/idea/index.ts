"use server";
import {
  prisma,
  IdeaOptionalDefaults,
  IdeaStatusType,
} from "@workspace/backend";
import { getSession } from "../account/user";
import { inngestClient } from "@/lib/inngest";
import { ResearchType } from "@workspace/backend/prisma/generated/client/client";

export const createIdea = async (data: IdeaOptionalDefaults) => {
  const { org } = await getSession();

  const idea = await prisma.idea.create({
    data: {
      status: data.status || "INVALIDATED",
      organizationId: org,
      name: data.name,
      description: data.description,
      industry: data.industry,
      internal: data.internal,
      openSource: data.openSource,
      problemSolved: data.problemSolved,
      solutionOffered: data.solutionOffered,
    },
  });

  return idea;
};

export const getAllIdeas = async () => {
  const { org } = await getSession();

  const ideas = await prisma.idea.findMany({ where: { organizationId: org } });
  return ideas;
};

/**
 * Get a single idea by ID (scoped to org)
 */
export const getSingleIdea = async (id: string) => {
  const { org } = await getSession();
  const idea = await prisma.idea.findFirst({
    where: { id, organizationId: org },
  });
  return idea;
};

export const updateIdea = async (data: IdeaOptionalDefaults) => {
  await getSession();

  const idea = await prisma.idea.update({
    where: {
      id: data.id,
    },
    data: {
      status: data.status || "INVALIDATED",
      name: data.name,
      description: data.description,
      industry: data.industry,
      internal: data.internal,
      openSource: data.openSource,
      problemSolved: data.problemSolved,
      solutionOffered: data.solutionOffered,
    },
  });

  return idea;
};

export const deleteIdea = async (id: string) => {
  await getSession();
  await prisma.idea.delete({
    where: {
      id,
    },
  });
};

export const updateName = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  await getSession();

  await prisma.idea.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
};

export const updateDescription = async ({
  id,
  description,
}: {
  id: string;
  description: string;
}) => {
  await getSession();

  await prisma.idea.update({
    where: {
      id,
    },
    data: {
      description,
    },
  });
};

export const changeStatus = async ({
  id,
  status,
}: {
  id: string;
  status: IdeaStatusType;
}) => {
  await getSession();
  return prisma.idea.update({
    where: { id },
    data: { status },
  });
};

export const startValidation = async ({
  ideaId,
  type,
}: {
  ideaId: string;
  type: ResearchType;
}) => {
  const { org } = await getSession();

  const research = await prisma.marketResearch.create({
    data: {
      ideaId,
      type,
      organizationId: org,
      confidenceLevel: "LOW",
      validationScore: 0,
    },
  });

  // Trigger Inngest background job with additional context
  try {
    await inngestClient.send({
      name: "idea/validate",
      data: {
        type,
        ideaId,
        researchId: research.id,
      },
    });
  } catch (error) {
    console.error("Failed to trigger Inngest validation:", error);
    // Reset the status back to INVALIDATED if Inngest fails
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        status: "INVALIDATED",
      },
    });
    throw new Error("Failed to start validation. Please try again.");
  }

  return { success: true, message: "Validation started" };
};

export const getResearches = async ({ id }: { id: string }) => {
  const { org } = await getSession();

  const researches = await prisma.marketResearch.findMany({
    where: { organizationId: org, ideaId: id },
  });

  return researches;
};

export const getResearchDetails = async ({
  ideaId,
  researchId,
}: {
  ideaId: string;
  researchId: string;
}) => {
  const { org } = await getSession();

  const research = await prisma.researchResults.findUnique({
    where: { researchId },
    include: {
      research: true,
    },
  });

  return research;
};
