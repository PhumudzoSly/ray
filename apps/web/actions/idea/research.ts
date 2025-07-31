"use server";

import { z } from "zod";
import { inngestClient } from "@/lib/inngest";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { revalidatePath } from "next/cache";
import type { ResearchDepth } from "@/types/research";

// Schema for validation
const startResearchSchema = z.object({
  ideaId: z.string().min(1, "Idea ID is required"),
  depth: z.enum(["QUICK", "STANDARD", "DEEP", "EXHAUSTIVE"], {
    required_error: "Research depth is required",
  }),
});

const getResearchSessionSchema = z.object({
  ideaId: z.string().min(1, "Idea ID is required"),
});

const getResearchResultsSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export async function startResearchValidation(
  ideaId: string,
  depth: ResearchDepth
) {
  try {
    // Validate input
    const validatedData = startResearchSchema.parse({ ideaId, depth });

    const { userId, org } = await getSession();

    if (!userId || !org) {
      throw new Error("Authentication required");
    }

    // Verify idea belongs to user's organization
    const idea = await prisma.idea.findUnique({
      where: { id: validatedData.ideaId },
    });

    if (!idea || idea.organizationId !== org) {
      throw new Error("Idea not found or unauthorized");
    }

    // Check if there's already an active research session
    const existingSession = await prisma.researchSession.findFirst({
      where: {
        ideaId: validatedData.ideaId,
        status: {
          in: ["INITIALIZING", "IN_PROGRESS"],
        },
      },
    });

    if (existingSession) {
      throw new Error(
        "Research validation is already in progress for this idea"
      );
    }

    // Start the research process
    await inngestClient.send({
      name: "deep-research/start",
      data: {
        ideaId: validatedData.ideaId,
        organizationId: org,
        depth: validatedData.depth,
        userId,
      },
    });

    revalidatePath(`/ideas/${validatedData.ideaId}`);

    return {
      success: true,
      message: "Research validation started successfully",
    };
  } catch (error) {
    console.error("Failed to start research validation:", error);

    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0]?.message || "Invalid input");
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to start research validation"
    );
  }
}

export async function getResearchSession(ideaId: string) {
  try {
    // Validate input
    const validatedData = getResearchSessionSchema.parse({ ideaId });

    const { org } = await getSession();

    if (!org) {
      throw new Error("Authentication required");
    }

    // Get the latest research session for this idea
    const researchSession = await prisma.researchSession.findFirst({
      where: {
        ideaId: validatedData.ideaId,
        organizationId: org,
      },
      include: {
        phases: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { session: researchSession };
  } catch (error) {
    console.error("Failed to get research session:", error);

    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0]?.message || "Invalid input");
    }

    throw new Error("Failed to get research session");
  }
}

export async function getResearchResults(sessionId: string) {
  try {
    // Validate input
    const validatedData = getResearchResultsSchema.parse({ sessionId });

    const { org } = await getSession();

    if (!org) {
      throw new Error("Authentication required");
    }

    // Get research session with results
    const researchSession = await prisma.researchSession.findUnique({
      where: {
        id: validatedData.sessionId,
        organizationId: org,
      },
      include: {
        phases: {
          orderBy: {
            createdAt: "asc",
          },
        },
        idea: true,
      },
    });

    if (!researchSession) {
      throw new Error("Research session not found");
    }

    return { session: researchSession };
  } catch (error) {
    console.error("Failed to get research results:", error);

    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0]?.message || "Invalid input");
    }

    throw new Error("Failed to get research results");
  }
}

export async function pauseResearchSession(sessionId: string) {
  try {
    const { org } = await getSession();

    if (!org) {
      throw new Error("Authentication required");
    }

    // Verify session belongs to organization
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Research session not found");
    }

    if (session.organizationId !== org) {
      throw new Error("Unauthorized");
    }

    if (session.status !== "IN_PROGRESS") {
      throw new Error("Can only pause research that is in progress");
    }

    // Trigger the pause Inngest function
    await inngestClient.send({
      name: "deep-research/pause",
      data: { sessionId },
    });

    revalidatePath(`/ideas/${session.ideaId}`);

    return {
      success: true,
      message: "Research paused successfully",
    };
  } catch (error) {
    console.error("Failed to pause research:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to pause research"
    );
  }
}

export async function resumeResearchSession(sessionId: string) {
  try {
    const { org } = await getSession();

    if (!org) {
      throw new Error("Authentication required");
    }

    // Verify session belongs to organization and get idea context
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId },
      include: {
        idea: true,
      },
    });

    if (!session) {
      throw new Error("Research session not found");
    }

    if (session.organizationId !== org) {
      throw new Error("Unauthorized");
    }

    if (session.status !== "PAUSED") {
      throw new Error("Can only resume paused research");
    }

    // Reconstruct research context
    const context = {
      ideaName: session.idea.name,
      ideaDescription: session.idea.description,
      industry: session.idea.industry,
      targetAudience: session.idea.problemSolved || undefined,
      problemSolved: session.idea.problemSolved || undefined,
      solutionOffered: session.idea.solutionOffered || undefined,
    };

    // Trigger the resume Inngest function
    await inngestClient.send({
      name: "deep-research/resume",
      data: {
        sessionId,
        context,
      },
    });

    revalidatePath(`/ideas/${session.ideaId}`);

    return {
      success: true,
      message: "Research resumed successfully",
    };
  } catch (error) {
    console.error("Failed to resume research:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to resume research"
    );
  }
}
