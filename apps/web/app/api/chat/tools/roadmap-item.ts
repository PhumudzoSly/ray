import {
  IssueStatusSchema,
  IssueLabelSchema,
  ImportanceSchema,
  prisma,
} from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getRoadmapItems = tool({
  description:
    "Get all roadmap items that belong to a specific roadmap in the current organization.",
  inputSchema: z.object({
    roadmapId: z.string().min(1).describe("The roadmap ID to get items from"),
    status: z.string().optional().describe("Filter items by status"),
    category: z.string().optional().describe("Filter items by category"),
    priority: z.string().optional().describe("Filter items by priority"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Filter items by public visibility"),
  }),
  execute: async ({ roadmapId, status, category, priority, isPublic }) => {
    const { org } = await getSession();

    // Verify the roadmap belongs to the organization
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: {
        id: roadmapId,
        project: {
          organizationId: org,
        },
      },
    });

    if (!roadmap) {
      throw new Error(
        "Roadmap not found or doesn't belong to your organization"
      );
    }

    const items = await prisma.roadmapItem.findMany({
      where: {
        roadmapId,
        ...(status && { status: status as any }),
        ...(category && { category: category as any }),
        ...(priority && { priority: priority as any }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        votes: {
          select: {
            id: true,
            userId: true,
            ipAddress: true,
            createdAt: true,
          },
        },
        feedback: {
          select: {
            id: true,
            content: true,
            sentiment: true,
            isApproved: true,
            userId: true,
            createdAt: true,
          },
        },
        convertedFromFeatureRequest: {
          select: {
            id: true,
            title: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
            feedback: true,
            convertedFromFeatureRequest: true,
          },
        },
      },
    });
    return items;
  },
});

export const createRoadmapItem = tool({
  description: "Create a new roadmap item for a specific roadmap.",
  inputSchema: z.object({
    roadmapId: z
      .string()
      .min(1)
      .describe("The roadmap ID this item belongs to"),
    title: z.string().min(1).max(200).describe("The title of the roadmap item"),
    description: z.string().describe("The description of the roadmap item"),
    status: IssueStatusSchema,
    category: IssueLabelSchema,
    priority: ImportanceSchema,
    isPublic: z.boolean().describe("Whether the item is publicly visible"),
    targetDate: z
      .string()
      .optional()
      .describe("The target date for the item (ISO string)"),
  }),
  execute: async ({
    roadmapId,
    title,
    description,
    status,
    category,
    priority,
    isPublic,
    targetDate,
  }) => {
    const { org } = await getSession();

    // Verify the roadmap belongs to the organization
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: {
        id: roadmapId,
        project: {
          organizationId: org,
        },
      },
    });

    if (!roadmap) {
      throw new Error(
        "Roadmap not found or doesn't belong to your organization"
      );
    }

    const item = await prisma.roadmapItem.create({
      data: {
        roadmapId,
        title,
        description,
        status,
        category,
        priority,
        isPublic,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return item;
  },
});

export const getCurrentRoadmapItem = tool({
  description:
    "Get a specific roadmap item by ID that belongs to the current organization.",
  inputSchema: z.object({
    itemId: z.string().min(1).describe("The roadmap item ID"),
  }),
  execute: async ({ itemId }) => {
    const { org } = await getSession();
    const item = await prisma.roadmapItem.findFirst({
      where: {
        id: itemId,
        roadmap: {
          project: {
            organizationId: org,
          },
        },
      },
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        votes: {
          select: {
            id: true,
            userId: true,
            ipAddress: true,
            createdAt: true,
          },
        },
        feedback: {
          select: {
            id: true,
            content: true,
            sentiment: true,
            isApproved: true,
            userId: true,
            ipAddress: true,
            createdAt: true,
            convertedToFeatureId: true,
            convertedToIssueId: true,
            convertedAt: true,
            conversionNotes: true,
          },
        },
        convertedFromFeatureRequest: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            email: true,
            name: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            votes: true,
            feedback: true,
            convertedFromFeatureRequest: true,
          },
        },
      },
    });

    if (!item) {
      return `Roadmap item with the ID of ${itemId} was not found, the user probably didn't select an item or provided an invalid ID`;
    }

    return item;
  },
});

export const updateRoadmapItem = tool({
  description:
    "Update an existing roadmap item that belongs to the current organization.",
  inputSchema: z.object({
    itemId: z.string().min(1).describe("The roadmap item ID to update"),
    title: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("The new title of the roadmap item"),
    description: z
      .string()
      .optional()
      .describe("The new description of the roadmap item"),
    status: z
      .enum([
        "BACKLOG",
        "TODO",
        "IN_PROGRESS",
        "IN_REVIEW",
        "DONE",
        "CANCELLED",
      ])
      .optional()
      .describe("The new status of the roadmap item"),
    category: z
      .enum([
        "BUG",
        "FEATURE",
        "IMPROVEMENT",
        "DOCUMENTATION",
        "QUESTION",
        "DUPLICATE",
        "INVALID",
        "WONTFIX",
      ])
      .optional()
      .describe("The new category of the roadmap item"),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .optional()
      .describe("The new priority of the roadmap item"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Whether the item is publicly visible"),
    targetDate: z
      .string()
      .optional()
      .describe("The new target date for the item (ISO string)"),
  }),
  execute: async ({
    itemId,
    title,
    description,
    status,
    category,
    priority,
    isPublic,
    targetDate,
  }) => {
    const { org } = await getSession();

    // Verify the item exists and belongs to the organization
    const existingItem = await prisma.roadmapItem.findFirst({
      where: {
        id: itemId,
        roadmap: {
          project: {
            organizationId: org,
          },
        },
      },
    });

    if (!existingItem) {
      throw new Error(
        "Roadmap item not found or doesn't belong to your organization"
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (targetDate !== undefined)
      updateData.targetDate = targetDate ? new Date(targetDate) : null;

    const updatedItem = await prisma.roadmapItem.update({
      where: {
        id: itemId,
      },
      data: updateData,
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updatedItem;
  },
});

export const deleteRoadmapItem = tool({
  description:
    "Delete a roadmap item that belongs to the current organization. This will also delete all associated votes and feedback.",
  inputSchema: z.object({
    itemId: z.string().min(1).describe("The roadmap item ID to delete"),
  }),
  execute: async ({ itemId }) => {
    const { org } = await getSession();

    // Verify the item exists and belongs to the organization
    const existingItem = await prisma.roadmapItem.findFirst({
      where: {
        id: itemId,
        roadmap: {
          project: {
            organizationId: org,
          },
        },
      },
      include: {
        _count: {
          select: {
            votes: true,
            feedback: true,
          },
        },
      },
    });

    if (!existingItem) {
      throw new Error(
        "Roadmap item not found or doesn't belong to your organization"
      );
    }

    // Delete the item (all related votes and feedback will be deleted due to cascade)
    await prisma.roadmapItem.delete({
      where: {
        id: itemId,
      },
    });

    return {
      success: true,
      message: `Roadmap item "${existingItem.title}" has been deleted successfully. This included ${existingItem._count.votes} votes and ${existingItem._count.feedback} feedback entries.`,
    };
  },
});
