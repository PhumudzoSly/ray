"use server";

import {
  prisma,
  IdeaOptionalDefaults,
  IdeaStatusType,
} from "@workspace/backend";
import { getSession } from "../account/user";
import { inngestClient } from "@/lib/inngest";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";

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
    },
  });
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

export const updateIndustry = async ({
  id,
  industry,
}: {
  id: string;
  industry: string;
}) => {
  await getSession();

  await prisma.idea.update({
    where: {
      id,
    },
    data: {
      industry,
    },
  });
};

export const updateInternal = async ({
  id,
  internal,
}: {
  id: string;
  internal: boolean;
}) => {
  await getSession();

  await prisma.idea.update({
    where: {
      id,
    },
    data: {
      internal,
    },
  });
};

export const updateOpenSource = async ({
  id,
  openSource,
}: {
  id: string;
  openSource: boolean;
}) => {
  await getSession();

  await prisma.idea.update({
    where: {
      id,
    },
    data: {
      openSource,
    },
  });
};

export const updateProblemSolved = async ({
  id,
  problemSolved,
}: {
  id: string;
  problemSolved: string;
}) => {
  await getSession();

  await prisma.idea.update({
    where: {
      id,
    },
    data: {
      problemSolved,
    },
  });
};

export const updateSolutionOffered = async ({
  id,
  solutionOffered,
}: {
  id: string;
  solutionOffered: string;
}) => {
  await getSession();

  await prisma.idea.update({
    where: {
      id,
    },
    data: {
      solutionOffered,
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

export const checkIdeaClarity = async ({
  ideaId,
  additionalContext,
}: {
  ideaId: string;
  additionalContext?: any;
}) => {
  const { org } = await getSession();

  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, organizationId: org },
  });

  if (!idea) {
    throw new Error("Idea not found");
  }

  // Build the prompt with additional context if provided
  let prompt = `
    You are an expert in SaaS idea validation.
    You will be given an idea and you will need to determine if it is clear and concise.
    
    The idea is: ${idea?.description}
    The problem solved is: ${idea?.problemSolved}
    The solution offered is: ${idea?.solutionOffered}
    The industry is: ${idea?.industry}
    The internal is: ${idea?.internal}
    The open source is: ${idea?.openSource}
    The status is: ${idea?.status}
  `;

  // Add additional context if provided
  if (additionalContext) {
    if (additionalContext.preValidationAnswers) {
      prompt += `\n\nAdditional Information from User:\n`;
      additionalContext.preValidationAnswers.forEach((qa: any) => {
        prompt += `Question: ${qa.question}\nAnswer: ${qa.answer}\n\n`;
      });
    }

    if (additionalContext.source) {
      prompt += `\nContext Source: ${additionalContext.source}\n`;
    }
  }

  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: z.object({
      isClear: z.boolean(),
      questions: z
        .array(z.string())
        .nullable()
        .describe(
          "Questions to ask the user to clarify the idea, only generated if the idea is not clear"
        ),
    }),
    prompt,
  });

  console.log("OBJECT", object);

  return object;
};

export const startValidation = async ({
  ideaId,
  additionalContext,
}: {
  ideaId: string;
  additionalContext?: any;
}) => {
  const { org } = await getSession();
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, organizationId: org },
  });
  if (!idea) throw new Error("Idea not found");

  // Check if validation is already in progress
  if (idea.status === "IN_PROGRESS") {
    throw new Error("Validation already in progress");
  }

  // Update idea status to in progress
  await prisma.idea.update({
    where: { id: ideaId },
    data: {
      status: "IN_PROGRESS",
    },
  });

  // Trigger Inngest background job with additional context
  try {
    await inngestClient.send({
      name: "idea/validate",
      data: {
        ideaId,
        additionalContext: additionalContext || {},
        org,
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

// Trigger AI validation for an idea using Inngest background processing

// Get detailed validation results for an idea
export const getValidationDetails = async ({ ideaId }: { ideaId: string }) => {
  const { org } = await getSession();

  // Fetch the idea and related validation fields
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, organizationId: org },
  });

  if (!idea) {
    throw new Error("Idea not found");
  }

  // Return a shape similar to what the component expects
  return {
    validation: idea?.aiOverallValidation || null,
    idea,
    // Add more fields as needed
  };
};
