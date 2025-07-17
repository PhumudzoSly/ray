"use server";
import { FeatureOptionalDefaults, prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { FeaturePhase, Importance, ActivityType, EntityType } from "@workspace/backend/prisma/generated/client/client";

// ============================================================================
// TYPES
// ============================================================================

export interface FeatureFilters {
    projectId?: string;
    phase?: FeaturePhase[];
    priority?: Importance[];
    assignedToId?: string;
    parentFeatureId?: string;
    hasDependencies?: boolean;
    hasSubFeatures?: boolean;
    search?: string;
}

// ============================================================================
// FEATURE CRUD OPERATIONS
// ============================================================================

/**
 * Create a new feature
 */
export const createFeature = async (data: FeatureOptionalDefaults) => {
    const { org, userId } = await getSession();
    try {
        const feature = await prisma.feature.create({
            data: {
                ...data,
                organizationId: org,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
            include: {
                assignedTo: true,
                parentFeature: true,
                project: true,
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
                FeatureLink: true,
            },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.CREATED,
                title: `Feature "${data.name}" created`,
                description: `New feature created in project`,
                entityType: EntityType.FEATURE,
                entityId: feature.id,
                organizationId: org,
                userId: userId,
            },
        });

        return { success: true, data: feature };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get a feature by ID (scoped to org)
 */
export const getFeatureById = async (id: string) => {
    const { org } = await getSession();
    try {
        const feature = await prisma.feature.findFirst({
            where: { id, organizationId: org },
            include: {
                assignedTo: true,
                parentFeature: true,
                subFeatures: true,
                project: true,
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
                FeatureLink: true,
            },
        });
        return { success: true, data: feature };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get all features with optional filtering
 */
export const getFeatures = async (filters: FeatureFilters = {}) => {
    const { org } = await getSession();
    try {
        const where: any = { organizationId: org };

        if (filters.projectId) where.projectId = filters.projectId;
        if (filters.phase && filters.phase.length > 0) where.phase = { in: filters.phase };
        if (filters.priority && filters.priority.length > 0) where.priority = { in: filters.priority };
        if (filters.assignedToId) where.assignedToId = filters.assignedToId;
        if (filters.parentFeatureId) where.parentFeatureId = filters.parentFeatureId;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        const features = await prisma.feature.findMany({
            where,
            include: {
                assignedTo: true,
                parentFeature: true,
                subFeatures: true,
                project: true,
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
                FeatureLink: true,
            },
            orderBy: [
                { priority: "desc" },
                { createdAt: "desc" },
            ],
        });

        // Apply additional filters that require post-processing
        let filteredFeatures = features;

        if (filters.hasDependencies !== undefined) {
            filteredFeatures = filteredFeatures.filter(f =>
                filters.hasDependencies ? f.dependencies.length > 0 : f.dependencies.length === 0
            );
        }

        if (filters.hasSubFeatures !== undefined) {
            filteredFeatures = filteredFeatures.filter(f =>
                filters.hasSubFeatures ? f.subFeatures.length > 0 : f.subFeatures.length === 0
            );
        }

        return { success: true, data: filteredFeatures };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get features by project
 */
export const getFeaturesByProject = async (projectId: string) => {
    const { org } = await getSession();
    try {
        const features = await prisma.feature.findMany({
            where: {
                projectId,
                organizationId: org,
            },
            include: {
                assignedTo: true,
                parentFeature: true,
                subFeatures: true,
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
                FeatureLink: true,
            },
            orderBy: [
                { priority: "desc" },
                { createdAt: "desc" },
            ],
        });
        return { success: true, data: features };
    } catch (error) {
        return { success: false, error };
    }
};

export const getSimpleFeatureByProject = async (projectId: string) => {
    const { org } = await getSession();
    const features = await prisma.feature.findMany({
        where: { projectId, organizationId: org },
    });
    return features
};

/**
 * Update a feature by ID
 */
export const updateFeature = async (featureId: string, updates: FeatureOptionalDefaults) => {
    const { org, userId } = await getSession();
    try {
        // Get the original feature to track changes
        const originalFeature = await prisma.feature.findFirst({
            where: { id: featureId, organizationId: org },
        });

        if (!originalFeature) {
            return { success: false, error: "Feature not found" };
        }

        const updatedFeature = await prisma.feature.update({
            where: { id: featureId, organizationId: org },
            data: {
                ...updates,
                startDate: updates.startDate ? new Date(updates.startDate) : undefined,
                endDate: updates.endDate ? new Date(updates.endDate) : undefined,
            },
            include: {
                assignedTo: true,
                parentFeature: true,
                subFeatures: true,
                project: true,
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
                FeatureLink: true,
            },
        });

        // Create activity feed entries for significant changes
        const changes: string[] = [];

        if (updates.name && updates.name !== originalFeature.name) {
            changes.push(`Name changed from "${originalFeature.name}" to "${updates.name}"`);
        }

        if (updates.phase && updates.phase !== originalFeature.phase) {
            changes.push(`Phase changed from ${originalFeature.phase} to ${updates.phase}`);
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.PHASE_CHANGED,
                    title: `Feature "${updatedFeature.name}" phase changed`,
                    description: `Phase changed from ${originalFeature.phase} to ${updates.phase}`,
                    entityType: EntityType.FEATURE,
                    entityId: featureId,
                    organizationId: org,
                    userId: userId,
                    oldValue: originalFeature.phase,
                    newValue: updates.phase,
                },
            });
        }

        if (updates.assignedToId !== undefined && updates.assignedToId !== originalFeature.assignedToId) {
            const activityType = updates.assignedToId ? ActivityType.ASSIGNED : ActivityType.UNASSIGNED;
            await prisma.activityFeed.create({
                data: {
                    type: activityType,
                    title: `Feature "${updatedFeature.name}" ${updates.assignedToId ? 'assigned' : 'unassigned'}`,
                    description: updates.assignedToId ? 'Feature assigned to user' : 'Feature unassigned',
                    entityType: EntityType.FEATURE,
                    entityId: featureId,
                    organizationId: org,
                    userId: userId,
                    oldValue: originalFeature.assignedToId,
                    newValue: updates.assignedToId,
                },
            });
        }

        if (updates.parentFeatureId !== undefined && updates.parentFeatureId !== originalFeature.parentFeatureId) {
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.PARENT_CHANGED,
                    title: `Feature "${updatedFeature.name}" parent changed`,
                    description: 'Feature parent relationship updated',
                    entityType: EntityType.FEATURE,
                    entityId: featureId,
                    organizationId: org,
                    userId: userId,
                    oldValue: originalFeature.parentFeatureId,
                    newValue: updates.parentFeatureId,
                },
            });
        }

        // Create general update activity if there are changes
        if (changes.length > 0) {
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.UPDATED,
                    title: `Feature "${updatedFeature.name}" updated`,
                    description: changes.join(', '),
                    entityType: EntityType.FEATURE,
                    entityId: featureId,
                    organizationId: org,
                    userId: userId,
                },
            });
        }

        return { success: true, data: updatedFeature };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a feature by ID
 */
export const deleteFeature = async (featureId: string) => {
    const { org, userId } = await getSession();
    try {
        const feature = await prisma.feature.findFirst({
            where: { id: featureId, organizationId: org },
        });

        if (!feature) {
            return { success: false, error: "Feature not found" };
        }

        // Check if feature has sub-features
        const subFeatures = await prisma.feature.findMany({
            where: { parentFeatureId: featureId, organizationId: org },
        });

        if (subFeatures.length > 0) {
            return { success: false, error: "Cannot delete feature with sub-features" };
        }

        // Check if feature is a dependency for other features
        const dependentFeatures = await prisma.featureDependency.findMany({
            where: { dependencyId: featureId, organizationId: org },
        });

        if (dependentFeatures.length > 0) {
            return { success: false, error: "Cannot delete feature that is a dependency for other features" };
        }

        await prisma.feature.delete({
            where: { id: featureId, organizationId: org },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.UPDATED,
                title: `Feature "${feature.name}" deleted`,
                description: 'Feature was deleted',
                entityType: EntityType.FEATURE,
                entityId: featureId,
                organizationId: org,
                userId: userId,
            },
        });

        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

// ============================================================================
// FEATURE HIERARCHY OPERATIONS
// ============================================================================

/**
 * Get the hierarchy for a feature (parent and sub-features)
 */
export const getFeatureHierarchy = async (featureId: string) => {
    const { org } = await getSession();
    try {
        const feature = await prisma.feature.findFirst({
            where: { id: featureId, organizationId: org },
            include: {
                parentFeature: true,
                subFeatures: {
                    include: {
                        assignedTo: true,
                        dependencies: {
                            include: {
                                dependency: true,
                            },
                        },
                        dependentOn: {
                            include: {
                                feature: true,
                            },
                        },
                    },
                },
                project: true,
            },
        });

        if (!feature) {
            return { success: false, error: "Feature not found" };
        }

        return {
            success: true,
            data: {
                feature,
                parentFeature: feature.parentFeature,
                subFeatures: feature.subFeatures,
            },
        };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get all root features (features without parents) for a project
 */
export const getRootFeatures = async (projectId: string) => {
    const { org } = await getSession();
    try {
        const features = await prisma.feature.findMany({
            where: {
                projectId,
                organizationId: org,
                parentFeatureId: null,
            },
            include: {
                assignedTo: true,
                subFeatures: {
                    include: {
                        assignedTo: true,
                        subFeatures: true,
                    },
                },
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
            },
            orderBy: [
                { priority: "desc" },
                { createdAt: "desc" },
            ],
        });
        return { success: true, data: features };
    } catch (error) {
        return { success: false, error };
    }
};

// ============================================================================
// FEATURE DEPENDENCY OPERATIONS
// ============================================================================

/**
 * Add a dependency between two features
 */
export const addFeatureDependency = async (data: { parentId: string; dependentFeatureId: string }) => {
    const { org, userId } = await getSession();
    const { parentId, dependentFeatureId } = data;

    try {
        if (parentId === dependentFeatureId) {
            return { success: false, error: "Cannot add self as dependency" };
        }

        // Check if dependency already exists
        const existingDependency = await prisma.featureDependency.findFirst({
            where: {
                featureId: dependentFeatureId,
                dependencyId: parentId,
                organizationId: org,
            },
        });

        if (existingDependency) {
            return { success: false, error: "Dependency already exists" };
        }

        // Check for circular dependencies
        const wouldCreateCycle = await checkForCircularDependency(parentId, dependentFeatureId, org);
        if (wouldCreateCycle) {
            return { success: false, error: "Adding this dependency would create a circular dependency" };
        }

        const dependency = await prisma.featureDependency.create({
            data: {
                featureId: dependentFeatureId,
                dependencyId: parentId,
                organizationId: org,
            },
            include: {
                feature: true,
                dependency: true,
            },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.DEPENDENCY_ADDED,
                title: `Dependency added to "${dependency.feature.name}"`,
                description: `Feature now depends on "${dependency.dependency.name}"`,
                entityType: EntityType.FEATURE,
                entityId: dependentFeatureId,
                organizationId: org,
                userId: userId,
            },
        });

        return { success: true, data: dependency };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Remove a dependency between two features
 */
export const removeFeatureDependency = async (data: { parentId: string; dependentFeatureId: string }) => {
    const { org, userId } = await getSession();
    const { parentId, dependentFeatureId } = data;

    try {
        const dependency = await prisma.featureDependency.findFirst({
            where: {
                featureId: dependentFeatureId,
                dependencyId: parentId,
                organizationId: org,
            },
            include: {
                feature: true,
                dependency: true,
            },
        });

        if (!dependency) {
            return { success: false, error: "Dependency not found" };
        }

        await prisma.featureDependency.delete({
            where: { id: dependency.id },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.DEPENDENCY_REMOVED,
                title: `Dependency removed from "${dependency.feature.name}"`,
                description: `Feature no longer depends on "${dependency.dependency.name}"`,
                entityType: EntityType.FEATURE,
                entityId: dependentFeatureId,
                organizationId: org,
                userId: userId,
            },
        });

        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get dependencies and dependents for a feature
 */
export const getFeatureDependencies = async (featureId: string) => {
    const { org } = await getSession();
    try {
        // Features that this feature depends on (parent features)
        const dependencies = await prisma.featureDependency.findMany({
            where: {
                featureId,
                organizationId: org,
            },
            include: {
                dependency: {
                    include: {
                        assignedTo: true,
                    },
                },
            },
        });

        // Features that depend on this feature (child features)
        const dependents = await prisma.featureDependency.findMany({
            where: {
                dependencyId: featureId,
                organizationId: org,
            },
            include: {
                feature: {
                    include: {
                        assignedTo: true,
                    },
                },
            },
        });

        return { success: true, data: { dependencies, dependents } };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Check for circular dependencies
 */
const checkForCircularDependency = async (parentId: string, dependentFeatureId: string, org: string): Promise<boolean> => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = async (featureId: string): Promise<boolean> => {
        if (recursionStack.has(featureId)) {
            return true; // Circular dependency found
        }
        if (visited.has(featureId)) {
            return false;
        }

        visited.add(featureId);
        recursionStack.add(featureId);

        const dependencies = await prisma.featureDependency.findMany({
            where: {
                featureId,
                organizationId: org,
            },
        });

        for (const dep of dependencies) {
            if (await dfs(dep.dependencyId)) {
                return true;
            }
        }

        recursionStack.delete(featureId);
        return false;
    };

    return await dfs(parentId);
};

// ============================================================================
// FEATURE LINK OPERATIONS
// ============================================================================

/**
 * Get all links for a feature
 */
export const getFeatureLinks = async (featureId: string) => {
    const { org } = await getSession();
    try {
        const links = await prisma.featureLink.findMany({
            where: { featureId, organizationId: org },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: links };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Add a link to a feature
 */
export const addFeatureLink = async (data: { featureId: string; url: string }) => {
    const { org, userId } = await getSession();
    const { featureId, url } = data;

    try {
        // Validate URL format
        try {
            new URL(url);
        } catch {
            return { success: false, error: "Invalid URL format" };
        }

        const link = await prisma.featureLink.create({
            data: {
                featureId,
                url,
                organizationId: org,
            },
            include: {
                feature: true,
            },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.LINK_ADDED,
                title: `Link added to "${link.feature.name}"`,
                description: `New link: ${url}`,
                entityType: EntityType.FEATURE,
                entityId: featureId,
                organizationId: org,
                userId: userId,
            },
        });

        return { success: true, data: link };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a link from a feature
 */
export const deleteFeatureLink = async (linkId: string) => {
    const { org, userId } = await getSession();
    try {
        const link = await prisma.featureLink.findFirst({
            where: { id: linkId, organizationId: org },
            include: {
                feature: true,
            },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        await prisma.featureLink.delete({
            where: { id: linkId },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.LINK_REMOVED,
                title: `Link removed from "${link.feature.name}"`,
                description: `Removed link: ${link.url}`,
                entityType: EntityType.FEATURE,
                entityId: link.featureId,
                organizationId: org,
                userId: userId,
            },
        });

        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

// ============================================================================
// FEATURE VALIDATION AND ANALYSIS
// ============================================================================

/**
 * Validate if a feature can be completed (e.g., moved to LIVE phase)
 */
export const validateFeatureCompletion = async (featureId: string) => {
    const { org } = await getSession();
    try {
        const feature = await prisma.feature.findFirst({
            where: { id: featureId, organizationId: org },
        });

        if (!feature) {
            return { success: false, error: "Feature not found" };
        }

        // Get dependencies
        const dependencies = await prisma.featureDependency.findMany({
            where: { featureId, organizationId: org },
            include: {
                dependency: true,
            },
        });

        // Check if all dependencies are completed (LIVE phase)
        const blockers = dependencies.filter((dep) => dep.dependency.phase !== "LIVE");

        const canComplete = blockers.length === 0;
        const blockerDetails = blockers.map((dep) => ({
            id: dep.dependency.id,
            name: dep.dependency.name,
            phase: dep.dependency.phase,
        }));

        return {
            success: true,
            data: {
                canComplete,
                blockers: blockerDetails,
                totalDependencies: dependencies.length,
                completedDependencies: dependencies.length - blockers.length,
            },
        };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get project-level feature dependency statistics
 */
export const getProjectDependencyStats = async (projectId: string) => {
    const { org } = await getSession();
    try {
        const features = await prisma.feature.findMany({
            where: { projectId, organizationId: org },
            include: {
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
            },
        });

        const totalFeatures = features.length;
        let totalDependencies = 0;
        let blockedFeatures = 0;
        let completableFeatures = 0;
        let featuresWithDependencies = 0;
        let featuresBeingDependedOn = 0;
        let circularDependencies = 0;

        for (const feature of features) {
            const deps = feature.dependencies || [];
            const dependents = feature.dependentOn || [];

            totalDependencies += deps.length;

            if (deps.length > 0) featuresWithDependencies++;
            if (dependents.length > 0) featuresBeingDependedOn++;

            // Check if feature is blocked (any dependency not LIVE)
            const isBlocked = deps.some((dep) => dep.dependency.phase !== "LIVE");
            if (isBlocked) {
                blockedFeatures++;
            } else {
                completableFeatures++;
            }
        }

        // Phase distribution
        const phaseDistribution = features.reduce((acc, feature) => {
            acc[feature.phase] = (acc[feature.phase] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Priority distribution
        const priorityDistribution = features.reduce((acc, feature) => {
            acc[feature.priority] = (acc[feature.priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            success: true,
            data: {
                totalFeatures,
                totalDependencies,
                blockedFeatures,
                completableFeatures,
                featuresWithDependencies,
                featuresBeingDependedOn,
                circularDependencies,
                phaseDistribution,
                priorityDistribution,
                completionRate: totalFeatures > 0 ? (completableFeatures / totalFeatures) * 100 : 0,
                averageDependencies: totalFeatures > 0 ? totalDependencies / totalFeatures : 0,
            },
        };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get features by phase
 */
export const getFeaturesByPhase = async (projectId: string, phase: FeaturePhase) => {
    const { org } = await getSession();
    try {
        const features = await prisma.feature.findMany({
            where: {
                projectId,
                organizationId: org,
                phase,
            },
            include: {
                assignedTo: true,
                parentFeature: true,
                subFeatures: true,
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
                FeatureLink: true,
            },
            orderBy: [
                { priority: "desc" },
                { createdAt: "desc" },
            ],
        });
        return { success: true, data: features };
    } catch (error) {
        return { success: false, error };
    }
};


/**
 * Search features
 */
export const searchFeatures = async (projectId: string, searchTerm: string) => {
    const { org } = await getSession();
    try {
        const features = await prisma.feature.findMany({
            where: {
                projectId,
                organizationId: org,
                OR: [
                    { name: { contains: searchTerm, mode: "insensitive" } },
                    { description: { contains: searchTerm, mode: "insensitive" } },
                ],
            },
            include: {
                assignedTo: true,
                parentFeature: true,
                subFeatures: true,
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
                FeatureLink: true,
            },
            orderBy: [
                { priority: "desc" },
                { createdAt: "desc" },
            ],
        });
        return { success: true, data: features };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get feature dependency graph for a project
 */
export const getFeatureDependencyGraph = async (projectId: string) => {
    const { org } = await getSession();
    try {
        const features = await prisma.feature.findMany({
            where: {
                projectId,
                organizationId: org,
            },
            include: {
                assignedTo: true,
                dependencies: {
                    include: {
                        dependency: true,
                    },
                },
                dependentOn: {
                    include: {
                        feature: true,
                    },
                },
            },
        });

        // Extract dependencies
        const dependencies: { parentId: string; dependentFeatureId: string }[] = [];
        features.forEach((feature) => {
            feature.dependencies.forEach((dep) => {
                dependencies.push({
                    parentId: dep.dependency.id,
                    dependentFeatureId: feature.id,
                });
            });
        });

        return {
            success: true,
            data: {
                features: features.map((feature) => ({
                    id: feature.id,
                    name: feature.name,
                    phase: feature.phase,
                    priority: feature.priority,
                    assignedTo: feature.assignedTo?.id,
                    user: feature.assignedTo ? {
                        name: feature.assignedTo.name,
                        image: feature.assignedTo.image,
                    } : undefined,
                })),
                dependencies,
            },
        };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get feature activity feed
 */
export const getFeatureActivity = async (featureId: string, limit = 50) => {
    const { org } = await getSession();
    try {
        const activities = await prisma.activityFeed.findMany({
            where: {
                entityType: EntityType.FEATURE,
                entityId: featureId,
                organizationId: org,
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                user: true,
            },
        });
        return { success: true, data: activities };
    } catch (error) {
        return { success: false, error };
    }
};