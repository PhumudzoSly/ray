"use server";

import {
  prisma,
  IdeaOptionalDefaults,
  IdeaStatusType,
} from "@workspace/backend";
import { getSession } from "../account/user";

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

// Check if additional questions are needed before validation
export const checkValidationQuestions = async ({
  ideaId,
}: {
  ideaId: string;
}) => {
  const { org } = await getSession();

  // Verify the idea exists and belongs to the organization
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, organizationId: org },
  });

  if (!idea) {
    throw new Error("Idea not found");
  }

  // Import the suggestQuestions function from the backend
  const { suggestQuestions } = await import("@workspace/backend/ai/validators");

  try {
    const questionsResult = await suggestQuestions(ideaId);
    return {
      success: true,
      questionsRequired: questionsResult.questionsRequired,
      requiredQuestions: questionsResult.requiredQuestions || [],
    };
  } catch (error) {
    console.error("Error checking validation questions:", error);
    // If there's an error, assume no questions are needed and proceed
    return {
      success: true,
      questionsRequired: false,
      requiredQuestions: [],
    };
  }
};

// Submit answers to validation questions
export const submitValidationAnswers = async ({
  ideaId,
  answers,
}: {
  ideaId: string;
  answers: Array<{ question: string; answer: string }>;
}) => {
  const { org } = await getSession();

  // Verify the idea exists and belongs to the organization
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, organizationId: org },
  });

  if (!idea) {
    throw new Error("Idea not found");
  }

  // Update the idea with the additional information from answers
  // This is a simplified approach - in a real implementation, you might want to
  // parse the answers and update specific fields based on the questions
  const additionalInfo = answers
    .map((a) => `${a.question}: ${a.answer}`)
    .join("\n");

  await prisma.idea.update({
    where: { id: ideaId },
    data: {
      // You might want to add a field to store additional validation info
      // For now, we'll update the description with the additional info
      description: idea.description
        ? `${idea.description}\n\nAdditional Validation Info:\n${additionalInfo}`
        : `Additional Validation Info:\n${additionalInfo}`,
    },
  });

  return {
    success: true,
    message: "Answers submitted successfully",
  };
};

// Trigger AI validation for an idea using Inngest background processing
export const triggerValidation = async ({ ideaId }: { ideaId: string }) => {
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

  // Trigger Inngest background job
  const { inngestClient } = await import("@/lib/inngest");
  await inngestClient.send({
    name: "idea/validate",
    data: {
      ideaId,
      // additionalContext will be passed from the client if available
    },
  });

  return { success: true, message: "Validation started" };
};

// Enhanced trigger validation with additional context
export const triggerValidationWithContext = async ({
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
  const { inngestClient } = await import("@/lib/inngest");
  await inngestClient.send({
    name: "idea/validate",
    data: {
      ideaId,
      additionalContext: additionalContext || {},
    },
  });

  return {
    success: true,
    message: "Validation started with additional context",
  };
};

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
