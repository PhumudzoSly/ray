"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Get a feature by ID (scoped to org)
 */
export const getFeatureById = async (id: string) => {
    const { org } = await getSession();
    try {
        const feature = await prisma.feature.findFirst({
            where: { id, organizationId: org },
        });
        return { success: true, data: feature };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get the hierarchy for a feature (parent and sub-features)
 */
export const getFeatureHierarchy = async (featureId: string) => {
    const { org } = await getSession();
    try {
        // Get the feature
        const feature = await prisma.feature.findFirst({
            where: { id: featureId, organizationId: org },
            include: { project: true },
        });
        if (!feature) return { success: false, error: "Feature not found" };

        // Get parent feature (if any)
        let parentFeature = null;
        if (feature.parentFeatureId) {
            parentFeature = await prisma.feature.findFirst({
                where: { id: feature.parentFeatureId, organizationId: org },
            });
        }

        // Get sub-features
        const subFeatures = await prisma.feature.findMany({
            where: { parentFeatureId: featureId, organizationId: org },
        });

        return {
            success: true,
            data: {
                parentFeature,
                subFeatures,
            },
        };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update a feature by ID (scoped to org)
 */
export const updateFeatureById = async (featureId: string, updates: any) => {
    const { org } = await getSession();
    try {
        const updated = await prisma.feature.update({
            where: { id: featureId, organizationId: org },
            data: updates,
        });
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Validate if a feature can be completed (e.g., moved to LIVE phase)
 */
export const validateFeatureCompletion = async (featureId: string) => {
    const { org } = await getSession();
    try {
        // Find the feature
        const feature = await prisma.feature.findFirst({
            where: { id: featureId, organizationId: org },
        });
        if (!feature) return { canComplete: false, blockers: ["Feature not found"] };

        // Find dependencies (assuming a relation table or field 'dependencies')
        // For this example, assume a 'dependencies' relation exists
        const dependencies = await prisma.feature.findMany({
            where: { parentFeatureId: featureId, organizationId: org },
        });
        // Blockers: dependencies that are not completed (not LIVE)
        const blockers = dependencies.filter((dep) => dep.phase !== "LIVE");
        return {
            canComplete: blockers.length === 0,
            blockers,
        };
    } catch (error) {
        return { canComplete: false, blockers: ["Error validating completion"] };
    }
};

/**
 * Get all links for a feature (scoped to org)
 */
export const getFeatureLinks = async (featureId: string) => {
    const { org } = await getSession();
    try {
        const links = await prisma.featureLink.findMany({
            where: { featureId, organizationId: org },
        });
        return { success: true, data: links };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Add a link to a feature (scoped to org)
 */
export const addFeatureLink = async ({ featureId, url }: { featureId: string; url: string }) => {
    const { org } = await getSession();
    try {
        const link = await prisma.featureLink.create({
            data: { featureId, url, organizationId: org },
        });
        return { success: true, data: link };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a link from a feature (scoped to org)
 */
export const deleteFeatureLink = async (linkId: string) => {
    const { org } = await getSession();
    try {
        await prisma.featureLink.delete({
            where: { id: linkId, organizationId: org },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Create a new feature (scoped to org)
 */
export const createFeature = async (data: {
    name: string;
    description?: string;
    priority: string;
    projectId: string;
    parentFeatureId?: string;
    phase: string;
    startDate?: string;
    endDate?: string;
    estimatedEffort?: number;
    businessValue?: number;
}) => {
    const { org } = await getSession();
    try {
        const feature = await prisma.feature.create({
            data: {
                ...data,
                organizationId: org,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
        return { success: true, data: feature };
    } catch (error) {
        return { success: false, error };
    }
};

// Add a dependency between two features
export const addFeatureDependency = async ({ parentId, dependentFeatureId }: { parentId: string; dependentFeatureId: string }) => {
    const { org } = await getSession();
    if (parentId === dependentFeatureId) throw new Error("Cannot add self as dependency");
    await prisma.feature.update({
        where: { id: dependentFeatureId, organizationId: org },
        data: {
            dependencies: {
                connect: { id: parentId },
            },
        },
    });
    return { success: true };
};

// Remove a dependency between two features
export const removeFeatureDependency = async ({ parentId, dependentFeatureId }: { parentId: string; dependentFeatureId: string }) => {
    const { org } = await getSession();
    await prisma.feature.update({
        where: { id: dependentFeatureId, organizationId: org },
        data: {
            dependencies: {
                disconnect: { id: parentId },
            },
        },
    });
    return { success: true };
};

// Get dependencies and dependents for a feature
export const getFeatureDependencies = async ({ featureId }: { featureId: string }) => {
    const { org } = await getSession();
    // Features that this feature depends on (parent features)
    const dependencies = await prisma.feature.findMany({
        where: {
            dependents: {
                some: {
                    id: featureId,
                    organizationId: org,
                },
            },
            organizationId: org,
        },
    });
    // Features that depend on this feature (child features)
    const dependents = await prisma.feature.findMany({
        where: {
            dependencies: {
                some: {
                    id: featureId,
                    organizationId: org,
                },
            },
            organizationId: org,
        },
    });
    return { dependencies, dependents };
};

/**
 * Get project-level feature dependency statistics (scoped to org)
 */
export const getProjectDependencyStats = async (projectId: string) => {
    const { org } = await getSession();
    // Get all features in the project
    const features = await prisma.feature.findMany({
        where: { projectId, organizationId: org },
        include: { dependencies: true, dependents: true },
    });
    const totalFeatures = features.length;
    let totalDependencies = 0;
    let blockedFeatures = 0;
    let completableFeatures = 0;
    let featuresWithDependencies = 0;
    let featuresBeingDependedOn = 0;

    for (const feature of features) {
        const deps = feature.dependencies || [];
        const dependents = feature.dependents || [];
        totalDependencies += deps.length;
        if (deps.length > 0) featuresWithDependencies++;
        if (dependents.length > 0) featuresBeingDependedOn++;
        // Blocked if any dependency is not LIVE
        const isBlocked = deps.some((dep: any) => dep.phase !== "LIVE");
        if (isBlocked) blockedFeatures++;
        else completableFeatures++;
    }

    return {
        totalFeatures,
        totalDependencies,
        blockedFeatures,
        completableFeatures,
        featuresWithDependencies,
        featuresBeingDependedOn,
    };
}; 