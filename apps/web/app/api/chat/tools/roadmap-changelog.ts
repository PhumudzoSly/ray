import { prisma } from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getRoadmapChangelogs = tool({
  description:
    "Get all changelogs that belong to a specific roadmap in the current organization.",
  inputSchema: z.object({
    roadmapId: z
      .string()
      .min(1)
      .describe("The roadmap ID to get changelogs from"),
    isPublished: z
      .boolean()
      .optional()
      .describe("Filter changelogs by published status"),
    version: z.string().optional().describe("Filter changelogs by version"),
  }),
  execute: async ({ roadmapId, isPublished, version }) => {
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

    const changelogs = await prisma.roadmapChangelog.findMany({
      where: {
        roadmapId,
        ...(isPublished !== undefined && { isPublished }),
        ...(version && { version }),
      },
      include: {
        roadmap: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        publishDate: "desc",
      },
    });
    return changelogs;
  },
});

export const createRoadmapChangelog = tool({
  description: "Create a new changelog for a specific roadmap.",
  inputSchema: z.object({
    roadmapId: z
      .string()
      .min(1)
      .describe("The roadmap ID this changelog belongs to"),
    title: z.string().min(1).max(200).describe("The title of the changelog"),
    description: z.string().describe("The description of the changelog"),
    version: z
      .string()
      .optional()
      .describe("The version number (e.g., '1.2.0', 'v2.1.0')"),
    publishDate: z
      .string()
      .describe("The publish date for the changelog (ISO string)"),
    isPublished: z
      .boolean()
      .optional()
      .describe("Whether the changelog is published"),
    fixes: z
      .array(z.string())
      .optional()
      .describe("Array of bug fixes (legacy field)"),
    newFeatures: z
      .array(z.string())
      .optional()
      .describe("Array of new features (legacy field)"),
  }),
  execute: async ({
    roadmapId,
    title,
    description,
    version,
    publishDate,
    isPublished,
    fixes,
    newFeatures,
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

    const changelog = await prisma.roadmapChangelog.create({
      data: {
        roadmapId,
        title,
        description,
        version,
        publishDate: new Date(publishDate),
        isPublished: isPublished ?? false,
        fixes: fixes ?? [],
        newFeatures: newFeatures ?? [],
      },
    });

    return changelog;
  },
});

export const getCurrentRoadmapChangelog = tool({
  description:
    "Get a specific changelog by ID that belongs to the current organization.",
  inputSchema: z.object({
    changelogId: z.string().min(1).describe("The changelog ID"),
  }),
  execute: async ({ changelogId }) => {
    const { org } = await getSession();
    const changelog = await prisma.roadmapChangelog.findFirst({
      where: {
        id: changelogId,
        roadmap: {
          project: {
            organizationId: org,
          },
        },
      },
      include: {
        roadmap: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!changelog) {
      return `Changelog with the ID of ${changelogId} was not found, the user probably didn't select a changelog or provided an invalid ID`;
    }

    return changelog;
  },
});

export const updateRoadmapChangelog = tool({
  description:
    "Update an existing changelog that belongs to the current organization.",
  inputSchema: z.object({
    changelogId: z.string().min(1).describe("The changelog ID to update"),
    title: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("The new title of the changelog"),
    description: z
      .string()
      .optional()
      .describe("The new description of the changelog"),
    version: z.string().optional().describe("The new version number"),
    publishDate: z
      .string()
      .optional()
      .describe("The new publish date for the changelog (ISO string)"),
    isPublished: z
      .boolean()
      .optional()
      .describe("Whether the changelog is published"),
    fixes: z
      .array(z.string())
      .optional()
      .describe("Array of bug fixes (legacy field)"),
    newFeatures: z
      .array(z.string())
      .optional()
      .describe("Array of new features (legacy field)"),
  }),
  execute: async ({
    changelogId,
    title,
    description,
    version,
    publishDate,
    isPublished,
    fixes,
    newFeatures,
  }) => {
    const { org } = await getSession();

    // Verify the changelog exists and belongs to the organization
    const existingChangelog = await prisma.roadmapChangelog.findFirst({
      where: {
        id: changelogId,
        roadmap: {
          project: {
            organizationId: org,
          },
        },
      },
    });

    if (!existingChangelog) {
      throw new Error(
        "Changelog not found or doesn't belong to your organization"
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (version !== undefined) updateData.version = version;
    if (publishDate !== undefined)
      updateData.publishDate = new Date(publishDate);
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (fixes !== undefined) updateData.fixes = fixes;
    if (newFeatures !== undefined) updateData.newFeatures = newFeatures;

    const updatedChangelog = await prisma.roadmapChangelog.update({
      where: {
        id: changelogId,
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

    return updatedChangelog;
  },
});

export const deleteRoadmapChangelog = tool({
  description:
    "Delete a changelog that belongs to the current organization. This will also delete all associated entries.",
  inputSchema: z.object({
    changelogId: z.string().min(1).describe("The changelog ID to delete"),
  }),
  execute: async ({ changelogId }) => {
    const { org } = await getSession();

    // Verify the changelog exists and belongs to the organization
    const existingChangelog = await prisma.roadmapChangelog.findFirst({
      where: {
        id: changelogId,
        roadmap: {
          project: {
            organizationId: org,
          },
        },
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!existingChangelog) {
      throw new Error(
        "Changelog not found or doesn't belong to your organization"
      );
    }

    // Delete the changelog (all related entries will be deleted due to cascade)
    await prisma.roadmapChangelog.delete({
      where: {
        id: changelogId,
      },
    });

    return {
      success: true,
      message: `Changelog "${existingChangelog.title}" (${existingChangelog.version || "no version"}) has been deleted successfully. This included ${existingChangelog._count.entries} entries.`,
    };
  },
});
