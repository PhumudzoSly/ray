import { prisma } from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getRoadmaps = tool({
  description:
    "Get all public roadmaps that belong to the current organization, optionally filtered by project.",
  inputSchema: z.object({
    projectId: z
      .string()
      .optional()
      .describe("The project ID to filter roadmaps by"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Filter roadmaps by public visibility"),
  }),
  execute: async ({ projectId, isPublic }) => {
    const { org } = await getSession();
    const roadmaps = await prisma.publicRoadmap.findMany({
      where: {
        project: {
          organizationId: org,
        },
        ...(projectId && { projectId }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        items: {
          select: {
            id: true,
            title: true,
            status: true,
            category: true,
            priority: true,
            targetDate: true,
          },
        },
        changelogs: {
          select: {
            id: true,
            title: true,
            version: true,
            publishDate: true,
            isPublished: true,
          },
        },
        featureRequests: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        _count: {
          select: {
            items: true,
            changelogs: true,
            featureRequests: true,
          },
        },
      },
    });
    return roadmaps;
  },
});

export const createRoadmap = tool({
  description: "Create a new public roadmap for a project.",
  inputSchema: z.object({
    projectId: z
      .string()
      .min(1)
      .describe("The project ID this roadmap belongs to"),
    name: z.string().min(1).max(200).describe("The name of the roadmap"),
    slug: z.string().min(1).max(100).describe("The URL slug for the roadmap"),
    description: z.string().describe("The description of the roadmap"),
    isPublic: z.boolean().describe("Whether the roadmap is publicly visible"),
    allowVoting: z
      .boolean()
      .describe("Whether users can vote on roadmap items"),
    allowFeedback: z.boolean().describe("Whether users can provide feedback"),
  }),
  execute: async ({
    projectId,
    name,
    slug,
    description,
    isPublic,
    allowVoting,
    allowFeedback,
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

    // Check if slug is already taken
    const existingRoadmap = await prisma.publicRoadmap.findFirst({
      where: {
        slug,
        project: {
          organizationId: org,
        },
      },
    });

    if (existingRoadmap) {
      throw new Error(
        "A roadmap with this slug already exists in your organization"
      );
    }

    const roadmap = await prisma.publicRoadmap.create({
      data: {
        projectId,
        name,
        slug,
        description,
        isPublic,
        allowVoting,
        allowFeedback,
      },
    });

    return roadmap;
  },
});

export const getCurrentRoadmap = tool({
  description:
    "Get a specific roadmap by ID that belongs to the current organization.",
  inputSchema: z.object({
    roadmapId: z.string().min(1).describe("The roadmap ID"),
  }),
  execute: async ({ roadmapId }) => {
    const { org } = await getSession();
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: {
        id: roadmapId,
        project: {
          organizationId: org,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
        items: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            category: true,
            priority: true,
            targetDate: true,
            isPublic: true,
            votes: {
              select: {
                id: true,
                userId: true,
                ipAddress: true,
              },
            },
            feedback: {
              select: {
                id: true,
                content: true,
                sentiment: true,
                isApproved: true,
              },
            },
            _count: {
              select: {
                votes: true,
                feedback: true,
              },
            },
          },
        },
        changelogs: {
          select: {
            id: true,
            title: true,
            description: true,
            version: true,
            publishDate: true,
            isPublished: true,
          },
        },
        featureRequests: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            status: true,
            priority: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
            changelogs: true,
            featureRequests: true,
          },
        },
      },
    });

    if (!roadmap) {
      return `Roadmap with the ID of ${roadmapId} was not found, the user probably didn't select a roadmap or provided an invalid ID`;
    }

    return roadmap;
  },
});

export const updateRoadmap = tool({
  description:
    "Update an existing roadmap that belongs to the current organization.",
  inputSchema: z.object({
    roadmapId: z.string().min(1).describe("The roadmap ID to update"),
    name: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("The new name of the roadmap"),
    slug: z
      .string()
      .min(1)
      .max(100)
      .optional()
      .describe("The new URL slug for the roadmap"),
    description: z
      .string()
      .optional()
      .describe("The new description of the roadmap"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Whether the roadmap is publicly visible"),
    allowVoting: z
      .boolean()
      .optional()
      .describe("Whether users can vote on roadmap items"),
    allowFeedback: z
      .boolean()
      .optional()
      .describe("Whether users can provide feedback"),
  }),
  execute: async ({
    roadmapId,
    name,
    slug,
    description,
    isPublic,
    allowVoting,
    allowFeedback,
  }) => {
    const { org } = await getSession();

    // Verify the roadmap exists and belongs to the organization
    const existingRoadmap = await prisma.publicRoadmap.findFirst({
      where: {
        id: roadmapId,
        project: {
          organizationId: org,
        },
      },
    });

    if (!existingRoadmap) {
      throw new Error(
        "Roadmap not found or doesn't belong to your organization"
      );
    }

    // Check if new slug is already taken (if slug is being updated)
    if (slug && slug !== existingRoadmap.slug) {
      const slugExists = await prisma.publicRoadmap.findFirst({
        where: {
          slug,
          project: {
            organizationId: org,
          },
          id: {
            not: roadmapId,
          },
        },
      });

      if (slugExists) {
        throw new Error(
          "A roadmap with this slug already exists in your organization"
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (allowVoting !== undefined) updateData.allowVoting = allowVoting;
    if (allowFeedback !== undefined) updateData.allowFeedback = allowFeedback;

    const updatedRoadmap = await prisma.publicRoadmap.update({
      where: {
        id: roadmapId,
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

    return updatedRoadmap;
  },
});

export const deleteRoadmap = tool({
  description:
    "Delete a roadmap that belongs to the current organization. This will also delete all associated items, changelogs, and feature requests.",
  inputSchema: z.object({
    roadmapId: z.string().min(1).describe("The roadmap ID to delete"),
  }),
  execute: async ({ roadmapId }) => {
    const { org } = await getSession();

    // Verify the roadmap exists and belongs to the organization
    const existingRoadmap = await prisma.publicRoadmap.findFirst({
      where: {
        id: roadmapId,
        project: {
          organizationId: org,
        },
      },
      include: {
        _count: {
          select: {
            items: true,
            changelogs: true,
            featureRequests: true,
          },
        },
      },
    });

    if (!existingRoadmap) {
      throw new Error(
        "Roadmap not found or doesn't belong to your organization"
      );
    }

    // Delete the roadmap (all related items will be deleted due to cascade)
    await prisma.publicRoadmap.delete({
      where: {
        id: roadmapId,
      },
    });

    return {
      success: true,
      message: `Roadmap "${existingRoadmap.name}" has been deleted successfully. This included ${existingRoadmap._count.items} items, ${existingRoadmap._count.changelogs} changelogs, and ${existingRoadmap._count.featureRequests} feature requests.`,
    };
  },
});
