"use server";
import { prisma, RoadmapChangelogOptionalDefaults } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new roadmap changelog
 */
export const createRoadmapChangelog = async (
  data: RoadmapChangelogOptionalDefaults & {
    entries?: Array<{
      type: string;
      title: string;
      description?: string;
      issueId?: string;
      featureId?: string;
      priority?: string;
      category?: string;
      breaking?: boolean;
    }>;
  }
) => {
  const { org } = await getSession();
  try {
    // Ensure the roadmap belongs to the org
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: data.roadmapId, project: { organizationId: org } },
    });
    if (!roadmap)
      return {
        success: false,
        error: "Roadmap not found or not in your organization",
      };

    const changelog = await prisma.roadmapChangelog.create({
      data: {
        ...data,
        fixes: data.fixes || [],
        newFeatures: data.newFeatures || [],
        entries: data.entries
          ? {
              create: data.entries.map((entry) => ({
                type: entry.type as any,
                title: entry.title,
                description: entry.description,
                issueId: entry.issueId,
                featureId: entry.featureId,
                priority: entry.priority as any,
                category: entry.category,
                breaking: entry.breaking || false,
              })),
            }
          : undefined,
      },
      include: {
        entries: {
          include: {
            issue: true,
            feature: true,
          },
        },
      },
    });
    return { success: true, data: changelog };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get a roadmap changelog by ID (scoped to org via parent roadmap)
 */
export const getRoadmapChangelog = async (id: string) => {
  const { org } = await getSession();
  try {
    const changelog = await prisma.roadmapChangelog.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
      include: {
        entries: {
          include: {
            issue: true,
            feature: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return { success: true, data: changelog };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * List all changelogs for a roadmap (scoped to org)
 */
export const getAllRoadmapChangelogs = async (roadmapId: string) => {
  const { org } = await getSession();
  try {
    // Ensure the roadmap belongs to the org
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: roadmapId, project: { organizationId: org } },
    });
    if (!roadmap)
      return {
        success: false,
        error: "Roadmap not found or not in your organization",
      };
    const changelogs = await prisma.roadmapChangelog.findMany({
      where: { roadmapId },
      include: {
        entries: {
          include: {
            issue: true,
            feature: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { publishDate: "desc" },
    });
    return { success: true, data: changelogs };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update a roadmap changelog (scoped to org via parent roadmap)
 */
export const updateRoadmapChangelog = async (
  id: string,
  data: Partial<{
    title?: string;
    description?: string;
    version?: string;
    publishDate?: Date;
    isPublished?: boolean;
    entries?: Array<{
      id?: string;
      type: string;
      title: string;
      description?: string;
      issueId?: string;
      featureId?: string;
      priority?: string;
      category?: string;
      breaking?: boolean;
    }>;
  }>
) => {
  const { org } = await getSession();
  try {
    // Ensure the changelog belongs to a roadmap in the org
    const changelog = await prisma.roadmapChangelog.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    if (!changelog)
      return {
        success: false,
        error: "Changelog not found or not in your organization",
      };

    // Handle entries update if provided
    if (data.entries) {
      // Delete existing entries
      await prisma.changelogEntry.deleteMany({
        where: { changelogId: id },
      });

      // Create new entries
      await prisma.changelogEntry.createMany({
        data: data.entries.map((entry) => ({
          changelogId: id,
          type: entry.type as any,
          title: entry.title,
          description: entry.description,
          issueId: entry.issueId,
          featureId: entry.featureId,
          priority: entry.priority as any,
          category: entry.category,
          breaking: entry.breaking || false,
        })),
      });
    }

    const updated = await prisma.roadmapChangelog.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        version: data.version,
        publishDate: data.publishDate,
        isPublished: data.isPublished,
      },
      include: {
        entries: {
          include: {
            issue: true,
            feature: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete a roadmap changelog (scoped to org via parent roadmap)
 */
export const deleteRoadmapChangelog = async (id: string) => {
  const { org } = await getSession();
  try {
    // Ensure the changelog belongs to a roadmap in the org
    const changelog = await prisma.roadmapChangelog.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    if (!changelog)
      return {
        success: false,
        error: "Changelog not found or not in your organization",
      };
    await prisma.roadmapChangelog.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get available issues and features for linking to changelog entries
 */
export const getAvailableItemsForChangelog = async (roadmapId: string) => {
  const { org } = await getSession();
  try {
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: roadmapId, project: { organizationId: org } },
    });
    if (!roadmap)
      return {
        success: false,
        error: "Roadmap not found or not in your organization",
      };

    const [issues, features] = await Promise.all([
      prisma.issue.findMany({
        where: {
          projectId: roadmap.projectId,
          status: { in: ["DONE", "COMPLETED"] },
          achieved: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          label: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.feature.findMany({
        where: {
          projectId: roadmap.projectId,
          phase: { in: ["COMPLETED", "RELEASE", "LIVE"] },
        },
        select: {
          id: true,
          name: true,
          description: true,
          phase: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return {
      success: true,
      data: { issues, features },
    };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete a changelog entry (scoped to org via parent changelog)
 */
export const deleteChangelogEntry = async (entryId: string) => {
  const { org } = await getSession();
  try {
    // Ensure the entry belongs to a changelog in the org
    const entry = await prisma.changelogEntry.findFirst({
      where: {
        id: entryId,
        changelog: {
          roadmap: {
            project: { organizationId: org },
          },
        },
      },
    });
    if (!entry)
      return {
        success: false,
        error: "Entry not found or not in your organization",
      };
    await prisma.changelogEntry.delete({ where: { id: entryId } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
