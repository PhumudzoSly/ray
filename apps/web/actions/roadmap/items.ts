"use server";
import { prisma, RoadmapItemOptionalDefaults } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new roadmap item
 */
export const createRoadmapItem = async (data: RoadmapItemOptionalDefaults) => {
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
    const item = await prisma.roadmapItem.create({ data });
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get a roadmap item by ID (scoped to org via parent roadmap)
 */
export const getRoadmapItem = async (id: string) => {
  const { org } = await getSession();
  try {
    const item = await prisma.roadmapItem.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * List all roadmap items for a roadmap (scoped to org)
 */
export const getAllRoadmapItems = async (roadmapId: string) => {
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
    const items = await prisma.roadmapItem.findMany({ where: { roadmapId } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update a roadmap item (scoped to org via parent roadmap)
 */
export const updateRoadmapItem = async (
  id: string,
  data: Partial<RoadmapItemOptionalDefaults>
) => {
  const { org } = await getSession();
  try {
    // Ensure the item belongs to a roadmap in the org
    const item = await prisma.roadmapItem.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    if (!item)
      return {
        success: false,
        error: "Item not found or not in your organization",
      };
    const updated = await prisma.roadmapItem.update({ where: { id }, data });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete a roadmap item (scoped to org via parent roadmap)
 */
export const deleteRoadmapItem = async (id: string) => {
  const { org } = await getSession();
  try {
    // Ensure the item belongs to a roadmap in the org
    const item = await prisma.roadmapItem.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    if (!item)
      return {
        success: false,
        error: "Item not found or not in your organization",
      };
    await prisma.roadmapItem.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
