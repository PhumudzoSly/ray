import { prisma } from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getWaitlists = tool({
  description: "Get all waitlists that belong to the current organization.",
  inputSchema: z.object({
    projectId: z.string().optional().describe("Filter waitlists by project ID"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Filter waitlists by public visibility"),
  }),
  execute: async ({ projectId, isPublic }) => {
    const { org } = await getSession();

    const waitlists = await prisma.waitlist.findMany({
      where: {
        organizationId: org,
        ...(projectId && { projectId }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return waitlists;
  },
});

export const createWaitlist = tool({
  description: "Create a new waitlist for the current organization.",
  inputSchema: z.object({
    name: z.string().min(1).max(100).describe("The name of the waitlist"),
    slug: z.string().min(1).max(100).describe("The URL slug for the waitlist"),
    description: z.string().describe("The description of the waitlist"),
    projectId: z.string().describe("The project ID this waitlist belongs to"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Whether the waitlist is publicly visible"),
    allowNameCapture: z
      .boolean()
      .optional()
      .describe("Whether to allow name capture"),
    showPosition: z
      .boolean()
      .optional()
      .describe("Whether to show position in waitlist"),
    showSocialProof: z
      .boolean()
      .optional()
      .describe("Whether to show social proof"),
    customMessage: z
      .string()
      .optional()
      .describe("Custom message for the waitlist"),
  }),
  execute: async ({
    name,
    slug,
    description,
    projectId,
    isPublic,
    allowNameCapture,
    showPosition,
    showSocialProof,
    customMessage,
  }) => {
    const { org, userId } = await getSession();

    // Verify the project belongs to the organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: org,
      },
    });

    if (!project) {
      throw new Error(
        "Project not found or doesn't belong to your organization"
      );
    }

    const waitlist = await prisma.waitlist.create({
      data: {
        name,
        slug,
        description,
        organizationId: org,
        projectId,
        isPublic: isPublic ?? false,
        allowNameCapture: allowNameCapture ?? true,
        showPosition: showPosition ?? true,
        showSocialProof: showSocialProof ?? true,
        customMessage,
        createdById: userId,
      },
    });

    return waitlist;
  },
});

export const getCurrentWaitlist = tool({
  description:
    "Get a specific waitlist by ID that belongs to the current organization.",
  inputSchema: z.object({
    waitlistId: z.string().min(1).describe("The waitlist ID"),
  }),
  execute: async ({ waitlistId }) => {
    const { org } = await getSession();
    const waitlist = await prisma.waitlist.findFirst({
      where: {
        id: waitlistId,
        organizationId: org,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!waitlist) {
      return `Waitlist with the ID of ${waitlistId} was not found, the user probably didn't select a waitlist or provided an invalid ID`;
    }

    return waitlist;
  },
});

export const updateWaitlist = tool({
  description:
    "Update an existing waitlist that belongs to the current organization.",
  inputSchema: z.object({
    id: z.string().min(1).describe("The waitlist ID to update"),
    name: z
      .string()
      .min(1)
      .max(100)
      .optional()
      .describe("The new name of the waitlist"),
    slug: z
      .string()
      .min(1)
      .max(100)
      .optional()
      .describe("The URL slug for the waitlist"),
    description: z
      .string()
      .optional()
      .describe("The new description of the waitlist"),
    projectId: z
      .string()
      .optional()
      .describe("The new project ID this waitlist belongs to"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Whether the waitlist is publicly visible"),
    allowNameCapture: z
      .boolean()
      .optional()
      .describe("Whether to allow name capture"),
    showPosition: z
      .boolean()
      .optional()
      .describe("Whether to show position in waitlist"),
    showSocialProof: z
      .boolean()
      .optional()
      .describe("Whether to show social proof"),
    customMessage: z
      .string()
      .optional()
      .describe("Custom message for the waitlist"),
  }),
  execute: async ({
    id: waitlistId,
    name,
    slug,
    description,
    projectId,
    isPublic,
    allowNameCapture,
    showPosition,
    showSocialProof,
    customMessage,
  }) => {
    const { org } = await getSession();

    // Verify the waitlist exists and belongs to the organization
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        id: waitlistId,
        organizationId: org,
      },
    });

    if (!existingWaitlist) {
      throw new Error(
        "Waitlist not found or doesn't belong to your organization"
      );
    }

    // Verify the project belongs to the organization if provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          organizationId: org,
        },
      });

      if (!project) {
        throw new Error(
          "Project not found or doesn't belong to your organization"
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (allowNameCapture !== undefined)
      updateData.allowNameCapture = allowNameCapture;
    if (showPosition !== undefined) updateData.showPosition = showPosition;
    if (showSocialProof !== undefined)
      updateData.showSocialProof = showSocialProof;
    if (customMessage !== undefined) updateData.customMessage = customMessage;

    const updatedWaitlist = await prisma.waitlist.update({
      where: {
        id: waitlistId,
      },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedWaitlist;
  },
});

export const deleteWaitlist = tool({
  description:
    "Delete a waitlist that belongs to the current organization. This will also delete all associated entries.",
  inputSchema: z.object({
    waitlistId: z.string().min(1).describe("The waitlist ID to delete"),
  }),
  execute: async ({ waitlistId }) => {
    const { org } = await getSession();

    // Verify the waitlist exists and belongs to the organization
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        id: waitlistId,
        organizationId: org,
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!existingWaitlist) {
      throw new Error(
        "Waitlist not found or doesn't belong to your organization"
      );
    }

    // Delete the waitlist (all related entries will be deleted due to cascade)
    await prisma.waitlist.delete({
      where: {
        id: waitlistId,
      },
    });

    return {
      success: true,
      message: `Waitlist "${existingWaitlist.name}" has been deleted successfully. This included ${existingWaitlist._count.entries} entries.`,
    };
  },
});
