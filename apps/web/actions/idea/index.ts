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
  const { org, userId } = await getSession();

  // Map research type to depth - for now using STANDARD as default
  // You can customize this mapping based on your needs
  const getDepthForType = (
    researchType: ResearchType
  ): "QUICK" | "STANDARD" | "DEEP" | "EXHAUSTIVE" => {
    switch (researchType) {
      case "MARKET_OPPORTUNITY":
      case "COMPETITIVE_ANALYSIS":
        return "QUICK";
      case "CUSTOMER_VALIDATION":
      case "PRODUCT_MARKET_FIT":
        return "STANDARD";
      case "BUSINESS_MODEL":
      case "FINANCIAL_PROJECTIONS":
      case "GO_TO_MARKET":
        return "DEEP";
      case "COMPLETE":
      case "INVESTMENT_RECOMMENDATION":
      case "RISK_ANALYSIS":
      case "TECHNICAL_FEASIBILITY":
        return "EXHAUSTIVE";
      default:
        return "STANDARD";
    }
  };

  const depth = getDepthForType(type);

  const research = await prisma.marketResearch.create({
    data: {
      ideaId,
      type,
      organizationId: org,
      confidenceLevel: "LOW",
      validationScore: 0,
    },
  });

  // Trigger deep research agent
  try {
    await inngestClient.send({
      name: "deep-research/start",
      data: {
        ideaId,
        organizationId: org,
        depth,
        userId,
        researchId: research.id, // Include research ID for tracking
      },
    });

    // Update idea status to indicate validation is in progress
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        status: "IN_PROGRESS",
      },
    });
  } catch (error) {
    console.error("Failed to trigger deep research agent:", error);

    // Clean up the research record if Inngest fails
    await prisma.marketResearch.delete({
      where: { id: research.id },
    });

    throw new Error("Failed to start validation. Please try again.");
  }

  return {
    success: true,
    message: "Deep research validation started",
    researchId: research.id,
  };
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

  const research = await prisma.marketResearch.findFirst({
    where: {
      id: researchId,
      ideaId,
      organizationId: org,
    },
    include: {
      ResearchResults: true,
    },
  });

  if (!research) {
    throw new Error("Research not found");
  }

  return {
    research,
    content: research.ResearchResults?.content || null,
  };
};
