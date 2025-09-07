"use server";
import { prisma, RoadmapChangelogOptionalDefaults } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new roadmap changelog
 */
export const createRoadmapChangelog = async (
  data: RoadmapChangelogOptionalDefaults
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

    const updated = await prisma.roadmapChangelog.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        version: data.version,
        publishDate: data.publishDate,
        isPublished: data.isPublished,
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
