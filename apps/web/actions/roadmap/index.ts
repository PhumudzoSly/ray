"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new public roadmap
 */
export const createPublicRoadmap = async (data: { projectId: string; name: string; slug: string; description: string; isPublic: boolean; allowVoting: boolean; allowFeedback: boolean; showChangelog: boolean; customDomain?: string; theme?: string; logoUrl?: string; accentColor?: string }) => {
  const { org } = await getSession();
  try {
    // Ensure the project belongs to the org
    const project = await prisma.project.findFirst({ where: { id: data.projectId, organizationId: org } });
    if (!project) return { success: false, error: 'Project not found or not in your organization' };
    const roadmap = await prisma.publicRoadmap.create({ data });
    return { success: true, data: roadmap };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get a public roadmap by ID (scoped to org via parent project)
 */
export const getPublicRoadmap = async (id: string) => {
  const { org } = await getSession();
  try {
    const roadmap = await prisma.publicRoadmap.findFirst({ where: { id, project: { organizationId: org } } });
    return { success: true, data: roadmap };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * List all public roadmaps for the current org
 */
export const getAllPublicRoadmaps = async () => {
  const { org } = await getSession();
  try {
    const roadmaps = await prisma.publicRoadmap.findMany({ where: { project: { organizationId: org } } });
    return { success: true, data: roadmaps };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update a public roadmap (scoped to org via parent project)
 */
export const updatePublicRoadmap = async (id: string, data: Partial<{ name?: string; slug?: string; description?: string; isPublic?: boolean; allowVoting?: boolean; allowFeedback?: boolean; showChangelog?: boolean; customDomain?: string; theme?: string; logoUrl?: string; accentColor?: string }>) => {
  const { org } = await getSession();
  try {
    // Ensure the roadmap belongs to a project in the org
    const roadmap = await prisma.publicRoadmap.findFirst({ where: { id, project: { organizationId: org } } });
    if (!roadmap) return { success: false, error: 'Roadmap not found or not in your organization' };
    const updated = await prisma.publicRoadmap.update({ where: { id }, data });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete a public roadmap (scoped to org via parent project)
 */
export const deletePublicRoadmap = async (id: string) => {
  const { org } = await getSession();
  try {
    // Ensure the roadmap belongs to a project in the org
    const roadmap = await prisma.publicRoadmap.findFirst({ where: { id, project: { organizationId: org } } });
    if (!roadmap) return { success: false, error: 'Roadmap not found or not in your organization' };
    await prisma.publicRoadmap.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get a public roadmap by slug (public, no org restriction)
 */
export const getRoadmapBySlug = async (slug: string) => {
  try {
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { slug },
      include: { project: true },
    });
    return { success: true, data: roadmap };
  } catch (error) {
    return { success: false, error };
  }
};

export * from "./items";
export * from "./changelogs";
export * from "./votes";
export * from "./feedback"; 