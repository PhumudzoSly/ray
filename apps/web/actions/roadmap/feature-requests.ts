"use server";
import { prisma, FeatureRequestOptionalDefaults } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new feature request
 */
export const createFeatureRequest = async (
  data: FeatureRequestOptionalDefaults
) => {
  const { org, userId } = await getSession();
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
    const request = await prisma.featureRequest.create({
      data: { ...data, createdAt: new Date() },
    });
    return { success: true, data: request };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get a feature request by ID (scoped to org via parent roadmap)
 */
export const getFeatureRequest = async (id: string) => {
  const { org } = await getSession();
  try {
    const request = await prisma.featureRequest.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    return { success: true, data: request };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * List all feature requests for a roadmap (scoped to org)
 */
export const getAllFeatureRequests = async (roadmapId: string) => {
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
    const requests = await prisma.featureRequest.findMany({
      where: { roadmapId },
    });
    return { success: true, data: requests };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update a feature request (scoped to org via parent roadmap)
 */
export const updateFeatureRequest = async (
  id: string,
  data: Partial<FeatureRequestOptionalDefaults>
) => {
  const { org } = await getSession();
  try {
    // Ensure the request belongs to a roadmap in the org
    const request = await prisma.featureRequest.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    if (!request)
      return {
        success: false,
        error: "Feature request not found or not in your organization",
      };
    const updated = await prisma.featureRequest.update({ where: { id }, data });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete a feature request (scoped to org via parent roadmap)
 */
export const deleteFeatureRequest = async (id: string) => {
  const { org } = await getSession();
  try {
    // Ensure the request belongs to a roadmap in the org
    const request = await prisma.featureRequest.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    if (!request)
      return {
        success: false,
        error: "Feature request not found or not in your organization",
      };
    await prisma.featureRequest.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
