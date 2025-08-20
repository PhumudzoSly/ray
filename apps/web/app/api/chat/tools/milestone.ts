import {
  MilestoneStatusSchema,
  prisma,
} from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getMilestones = tool({
  description:
    "Get all milestones that belong to the current organization, optionally filtered by project.",
  inputSchema: z.object({
    projectId: z
      .string()
      .optional()
      .describe("The project ID to filter milestones by"),
    status: z.string().optional().describe("Filter milestones by status"),
    ownerId: z
      .string()
      .optional()
      .describe("Filter milestones by owner user ID"),
  }),
  execute: async ({ projectId, status, ownerId }) => {
    const { org } = await getSession();
    const milestones = await prisma.milestone.findMany({
      where: {
        organizationId: org,
        ...(projectId && { projectId }),
        ...(status && { status: status as any }),
        ...(ownerId && { ownerId }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        issues: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        features: {
          select: {
            id: true,
            name: true,
            phase: true,
          },
        },
        dependsOn: {
          include: {
            dependency: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        blocking: {
          include: {
            milestone: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            issues: true,
            features: true,
            dependsOn: true,
            blocking: true,
          },
        },
      },
    });
    return milestones;
  },
});

export const createMilestone = tool({
  description: "Create a new milestone for the current organization.",
  inputSchema: z.object({
    name: z.string().min(1).max(200).describe("The name of the milestone"),
    description: z.string().optional().describe("The description of the milestone"),
    projectId: z
      .string()
      .min(1)
      .describe("The project ID this milestone belongs to"),
    status: MilestoneStatusSchema.optional(),
    startDate: z
      .string()
      .optional()
      .describe("The start date for the milestone (ISO string)"),
    endDate: z
      .string()
      .optional()
      .describe("The end date for the milestone (ISO string)"),
    ownerId: z
      .string()
      .optional()
      .describe("The user ID to assign as owner of this milestone"),
  }),
  execute: async ({
    name,
    description,
    projectId,
    status,
    startDate,
    endDate,
    ownerId,
  }) => {
    const { org } = await getSession();

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

    const milestone = await prisma.milestone.create({
      data: {
        name,
        description,
        organizationId: org,
        projectId,
        status: status ?? "NOT_STARTED",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId,
      },
    });

    return milestone;
  },
});

export const getCurrentMilestone = tool({
  description:
    "Get a specific milestone by ID that belongs to the current organization.",
  inputSchema: z.object({
    milestoneId: z.string().min(1).describe("The milestone ID"),
  }),
  execute: async ({ milestoneId }) => {
    const { org } = await getSession();
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
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
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        issues: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        features: {
          select: {
            id: true,
            name: true,
            phase: true,
            priority: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        dependsOn: {
          include: {
            dependency: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
        blocking: {
          include: {
            milestone: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
        _count: {
          select: {
            issues: true,
            features: true,
            dependsOn: true,
            blocking: true,
          },
        },
      },
    });

    if (!milestone) {
      return `Milestone with the ID of ${milestoneId} was not found, the user probably didn't select a milestone or provided an invalid ID`;
    }

    return milestone;
  },
});

export const updateMilestone = tool({
  description:
    "Update an existing milestone that belongs to the current organization.",
  inputSchema: z.object({
    milestoneId: z.string().min(1).describe("The milestone ID to update"),
    name: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("The new name of the milestone"),
    description: z
      .string()
      .optional()
      .describe("The new description of the milestone"),
    status: z
      .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"])
      .optional()
      .describe("The new status of the milestone"),
    startDate: z
      .string()
      .optional()
      .describe("The new start date for the milestone (ISO string)"),
    endDate: z
      .string()
      .optional()
      .describe("The new end date for the milestone (ISO string)"),
    ownerId: z
      .string()
      .optional()
      .describe("The new user ID to assign as owner of this milestone"),
  }),
  execute: async ({
    milestoneId,
    name,
    description,
    status,
    startDate,
    endDate,
    ownerId,
  }) => {
    const { org } = await getSession();

    // Verify the milestone exists and belongs to the organization
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        organizationId: org,
      },
    });

    if (!existingMilestone) {
      throw new Error("Milestone not found or doesn't belong to your organization");
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;
    if (ownerId !== undefined) updateData.ownerId = ownerId;

    const updatedMilestone = await prisma.milestone.update({
      where: {
        id: milestoneId,
      },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedMilestone;
  },
});

export const deleteMilestone = tool({
  description:
    "Delete a milestone that belongs to the current organization. This will unlink all associated issues and features.",
  inputSchema: z.object({
    milestoneId: z.string().min(1).describe("The milestone ID to delete"),
  }),
  execute: async ({ milestoneId }) => {
    const { org } = await getSession();

    // Verify the milestone exists and belongs to the organization
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        organizationId: org,
      },
      include: {
        _count: {
          select: {
            issues: true,
            features: true,
          },
        },
      },
    });

    if (!existingMilestone) {
      throw new Error("Milestone not found or doesn't belong to your organization");
    }

    // Delete the milestone
    await prisma.milestone.delete({
      where: {
        id: milestoneId,
      },
    });

    return {
      success: true,
      message: `Milestone "${existingMilestone.name}" has been deleted successfully. ${existingMilestone._count.issues} issues and ${existingMilestone._count.features} features have been unlinked.`,
    };
  },
});