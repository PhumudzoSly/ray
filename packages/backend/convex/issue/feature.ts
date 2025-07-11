import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { mutation, query, internalMutation } from "../_generated/server";
import { ConvexSession } from "../betterAuth";
import { Id } from "../_generated/dataModel";
import { featurePhase, importance } from "../../schemas/enums";

export const addFeature = mutation({
  args: {
    token: v.string(),
    feature: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      organizationId: v.id("organization"),
      projectId: v.id("projects"),
      parentFeatureId: v.optional(v.id("feature")),
      priority: importance,
      phase: featurePhase,
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
      estimatedEffort: v.optional(v.float64()),
      businessValue: v.optional(v.number()),
      assignedTo: v.optional(v.id("user")),
    }),
  },

  handler: async (ctx, { token, feature }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session || session.activeOrganizationId !== feature.organizationId) {
      throw Error("Unauthorized");
    }

    // If this is a sub-feature, validate that parent exists and belongs to same project
    if (feature.parentFeatureId) {
      const parentFeature = await ctx.db.get(feature.parentFeatureId);
      if (!parentFeature) {
        throw Error("Parent feature not found");
      }
      if (parentFeature.projectId !== feature.projectId) {
        throw Error(
          "Sub-feature must belong to the same project as parent feature"
        );
      }
      if (parentFeature.organizationId !== feature.organizationId) {
        throw Error(
          "Sub-feature must belong to the same organization as parent feature"
        );
      }
    }

    const newFeature = await ctx.db.insert("feature", {
      ...feature,
      organizationId: session.activeOrganizationId as Id<"organization">,
      achieved: false,
    });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Created feature "${feature.name}"`,
      description: feature.description,
      activity: "created",
      entityType: "feature",
      entityId: newFeature.toString(),
      entityName: feature.name,
      projectId: feature.projectId,
      featureId: newFeature,
    });

    // If this is a sub-feature, automatically create dependency on parent
    if (feature.parentFeatureId) {
      await ctx.db.insert("featureDependency", {
        parentId: feature.parentFeatureId,
        dependentFeatureId: newFeature,
      });

      // Track parent relationship activity
      const parentFeature = await ctx.db.get(feature.parentFeatureId);
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: session.activeOrganizationId as Id<"organization">,
        userId: session.userId as Id<"user">,
        title: `Set parent feature for "${feature.name}"`,
        description: `Set "${parentFeature?.name}" as parent feature`,
        activity: "parent_changed",
        entityType: "feature",
        entityId: newFeature.toString(),
        entityName: feature.name,
        projectId: feature.projectId,
        featureId: newFeature,
        metadata: {
          newValue: parentFeature?.name,
        },
      });
    }

    return newFeature;
  },
});

export const getFeatures = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const features = await ctx.db
      .query("feature")
      .withIndex("byOrg", (q) =>
        q.eq("organizationId", session.activeOrganizationId as any)
      )
      .order("desc")
      .collect();

    const finalFeatures = Promise.all(
      features.map(async (feature) => {
        const [user, project, phaseHistory] = await Promise.all([
          feature.assignedTo
            ? ctx.db.get(feature.assignedTo as Id<"user">)
            : null,
          feature.projectId
            ? ctx.db.get(feature.projectId as Id<"projects">)
            : null,
          ctx.db
            .query("featurePhaseHistory")
            .withIndex("byFeature", (q) => q.eq("featureId", feature._id))
            .order("desc")
            .collect(),
        ]);

        return {
          ...feature,
          user,
          project,
          phaseHistory,
        };
      })
    );

    return finalFeatures;
  },
});

export const getFeaturesByProject = query({
  args: { token: v.string(), projectId: v.id("projects") },
  handler: async (ctx, { token, projectId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const features = await ctx.db
      .query("feature")
      .withIndex("byOrgProject", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();

    const finalFeatures = Promise.all(
      features.map(async (feature) => {
        const [user, project, phaseHistory, parentFeature, subFeatures] =
          await Promise.all([
            feature.assignedTo
              ? ctx.db.get(feature.assignedTo as Id<"user">)
              : null,
            feature.projectId
              ? ctx.db.get(feature.projectId as Id<"projects">)
              : null,
            ctx.db
              .query("featurePhaseHistory")
              .withIndex("byFeature", (q) => q.eq("featureId", feature._id))
              .order("desc")
              .collect(),
            feature.parentFeatureId
              ? ctx.db.get(feature.parentFeatureId)
              : null,
            ctx.db
              .query("feature")
              .withIndex("byParentFeature", (q) =>
                q.eq("parentFeatureId", feature._id)
              )
              .collect(),
          ]);

        return {
          ...feature,
          user,
          project,
          phaseHistory,
          parentFeature,
          subFeatureCount: subFeatures.length,
          hasSubFeatures: subFeatures.length > 0,
          isSubFeature: !!feature.parentFeatureId,
        };
      })
    );

    return finalFeatures;
  },
});

export const updateFeature = mutation({
  args: {
    token: v.string(),
    featureId: v.id("feature"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      assignedTo: v.optional(v.union(v.id("user"), v.null())),
      parentFeatureId: v.optional(v.union(v.id("feature"), v.null())),
      milestoneId: v.optional(v.union(v.id("milestones"), v.null())),
      priority: v.optional(importance),
      phase: v.optional(featurePhase),
      startDate: v.optional(v.union(v.string(), v.null())),
      endDate: v.optional(v.union(v.string(), v.null())),
      estimatedEffort: v.optional(v.union(v.float64(), v.null())),
      businessValue: v.optional(v.union(v.number(), v.null())),
    }),
  },
  handler: async (ctx, { token, featureId, updates }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const feature = await ctx.db.get(featureId);
    if (!feature) {
      throw Error("Feature not found");
    }

    // If parentFeatureId is changing, handle dependency updates
    if (updates.parentFeatureId !== undefined) {
      // Remove existing parent dependency if any
      if (feature.parentFeatureId) {
        const existingDependency = await ctx.db
          .query("featureDependency")
          .withIndex("byParent", (q) =>
            q.eq("parentId", feature.parentFeatureId!)
          )
          .filter((q) => q.eq(q.field("dependentFeatureId"), featureId))
          .first();

        if (existingDependency) {
          await ctx.db.delete(existingDependency._id);
        }
      }

      // Add new parent dependency if specified
      if (updates.parentFeatureId) {
        const parentFeature = await ctx.db.get(updates.parentFeatureId);
        if (!parentFeature) {
          throw Error("Parent feature not found");
        }
        if (parentFeature.projectId !== feature.projectId) {
          throw Error(
            "Sub-feature must belong to the same project as parent feature"
          );
        }

        // Check for circular dependency
        const wouldCreateCycle = await ctx.runQuery(
          api.issue.feature.checkCircularDependency,
          {
            token,
            parentId: updates.parentFeatureId,
            dependentFeatureId: featureId,
          }
        );

        if (wouldCreateCycle.wouldCreateCycle) {
          throw Error(
            "Cannot create parent relationship: would create circular dependency"
          );
        }

        await ctx.db.insert("featureDependency", {
          parentId: updates.parentFeatureId,
          dependentFeatureId: featureId,
        });
      }
    }

    // If phase is changing, add to history
    if (updates.phase && updates.phase !== feature.phase) {
      await ctx.db.insert("featurePhaseHistory", {
        featureId,
        from: feature.phase,
        to: updates.phase,
        userId: session.userId as Id<"user">,
      });

      // Track phase change activity
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: feature.organizationId,
        userId: session.userId as Id<"user">,
        title: `Changed phase of feature "${feature.name}"`,
        description: `Changed from "${feature.phase}" to "${updates.phase}"`,
        activity: "phase_changed",
        entityType: "feature",
        entityId: featureId.toString(),
        entityName: feature.name,
        projectId: feature.projectId,
        featureId: featureId,
        metadata: {
          oldValue: feature.phase,
          newValue: updates.phase,
          field: "phase",
        },
      });
    }

    // Track assignment changes
    if (
      updates.assignedTo !== undefined &&
      updates.assignedTo !== feature.assignedTo
    ) {
      const oldUser = feature.assignedTo
        ? await ctx.db.get(feature.assignedTo)
        : null;
      const newUser = updates.assignedTo
        ? await ctx.db.get(updates.assignedTo)
        : null;

      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: feature.organizationId,
        userId: session.userId as Id<"user">,
        title: updates.assignedTo
          ? `Assigned feature "${feature.name}"`
          : `Unassigned feature "${feature.name}"`,
        description: updates.assignedTo
          ? `Assigned to ${newUser?.name || "Unknown user"}`
          : `Unassigned from ${oldUser?.name || "Unknown user"}`,
        activity: updates.assignedTo ? "assigned" : "unassigned",
        entityType: "feature",
        entityId: featureId.toString(),
        entityName: feature.name,
        projectId: feature.projectId,
        featureId: featureId,
        metadata: {
          oldValue: oldUser?.name,
          newValue: newUser?.name,
          field: "assignedTo",
        },
      });
    }

    // Track parent feature changes
    if (
      updates.parentFeatureId !== undefined &&
      updates.parentFeatureId !== feature.parentFeatureId
    ) {
      const oldParent = feature.parentFeatureId
        ? await ctx.db.get(feature.parentFeatureId)
        : null;
      const newParent = updates.parentFeatureId
        ? await ctx.db.get(updates.parentFeatureId)
        : null;

      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: feature.organizationId,
        userId: session.userId as Id<"user">,
        title: `Changed parent feature for "${feature.name}"`,
        description: updates.parentFeatureId
          ? `Set "${newParent?.name}" as parent feature`
          : `Removed "${oldParent?.name}" as parent feature`,
        activity: "parent_changed",
        entityType: "feature",
        entityId: featureId.toString(),
        entityName: feature.name,
        projectId: feature.projectId,
        featureId: featureId,
        metadata: {
          oldValue: oldParent?.name,
          newValue: newParent?.name,
          field: "parentFeatureId",
        },
      });
    }

    // Track milestone changes
    if (
      updates.milestoneId !== undefined &&
      updates.milestoneId !== feature.milestoneId
    ) {
      const oldMilestone = feature.milestoneId
        ? await ctx.db.get(feature.milestoneId)
        : null;
      const newMilestone = updates.milestoneId
        ? await ctx.db.get(updates.milestoneId)
        : null;

      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: feature.organizationId,
        userId: session.userId as Id<"user">,
        title: updates.milestoneId
          ? `Assigned feature "${feature.name}" to milestone`
          : `Unassigned feature "${feature.name}" from milestone`,
        description: updates.milestoneId
          ? `Assigned to milestone "${newMilestone?.name || "Unknown milestone"}"`
          : `Unassigned from milestone "${oldMilestone?.name || "Unknown milestone"}"`,
        activity: updates.milestoneId ? "milestone_assigned" : "milestone_unassigned",
        entityType: "feature",
        entityId: featureId.toString(),
        entityName: feature.name,
        projectId: feature.projectId,
        featureId: featureId,
        metadata: {
          oldValue: oldMilestone?.name,
          newValue: newMilestone?.name,
          field: "milestoneId",
        },
      });
    }

    await ctx.db.patch(featureId, updates as any);

    // Track general update activity for fields that don't have specific tracking
    const fieldsWithSpecificTracking = new Set([
      "phase",
      "assignedTo",
      "parentFeatureId",
      "milestoneId",
    ]);
    const generalUpdateFields = Object.keys(updates).filter(
      (key) =>
        updates[key as keyof typeof updates] !== undefined &&
        !fieldsWithSpecificTracking.has(key)
    );

    if (generalUpdateFields.length > 0) {
      // Get old values for better tracking
      const fieldChanges = generalUpdateFields
        .map((field) => {
          const oldValue = feature[field as keyof typeof feature];
          const newValue = updates[field as keyof typeof updates];
          return {
            field,
            oldValue: oldValue?.toString(),
            newValue: newValue?.toString(),
          };
        })
        .filter((change) => change.oldValue !== change.newValue);

      if (fieldChanges.length > 0) {
        const changedFieldNames = fieldChanges.map((change) => change.field);
        const primaryChange = fieldChanges[0];

        await ctx.runMutation(internal.activities.trackActivity, {
          organizationId: feature.organizationId,
          userId: session.userId as Id<"user">,
          title: `Updated feature "${feature.name}"`,
          description: `Updated ${changedFieldNames.join(", ")}`,
          activity: "updated",
          entityType: "feature",
          entityId: featureId.toString(),
          entityName: feature.name,
          projectId: feature.projectId,
          featureId: featureId,
          metadata: {
            field: changedFieldNames.join(", "),
            oldValue: primaryChange.oldValue,
            newValue: primaryChange.newValue,
          },
        });
      }
    }

    return { success: true, message: "Feature updated successfully" };
  },
});

export const getFeatureById = query({
  args: {
    token: v.string(),
    id: v.id("feature"),
  },
  handler: async (ctx, { token, id }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const feature = await ctx.db.get(id);
    if (!feature) return null;

    const [project, user] = await Promise.all([
      ctx.db.get(feature.projectId as Id<"projects">),
      feature.assignedTo ? ctx.db.get(feature.assignedTo as Id<"user">) : null,
    ]);

    return { ...feature, project, user: user || null };
  },
});

export const changeFeaturePhase = mutation({
  args: {
    token: v.string(),
    featureId: v.id("feature"),
    phase: featurePhase,
  },
  handler: async (ctx, { featureId, phase, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const oldFeature = await ctx.db.get(featureId);

    await ctx.db.patch(featureId, { phase });

    await ctx.db.insert("featurePhaseHistory", {
      featureId,
      from: oldFeature?.phase!,
      to: phase,
      userId: session.userId as Id<"user">,
    });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Changed phase of feature "${oldFeature?.name || "Unknown feature"}"`,
      description: `Changed from "${oldFeature?.phase}" to "${phase}"`,
      activity: "phase_changed",
      entityType: "feature",
      entityId: featureId.toString(),
      entityName: oldFeature?.name || "Unknown feature",
      projectId: oldFeature?.projectId,
      featureId: featureId,
      metadata: {
        oldValue: oldFeature?.phase,
        newValue: phase,
        field: "phase",
      },
    });
  },
});

export const addFeatureDependency = mutation({
  args: {
    token: v.string(),
    parentId: v.id("feature"),
    dependentFeatureId: v.id("feature"),
  },
  handler: async (ctx, { token, parentId, dependentFeatureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.insert("featureDependency", {
      parentId,
      dependentFeatureId,
    });

    // Get feature names for better activity tracking
    const [parentFeature, dependentFeature] = await Promise.all([
      ctx.db.get(parentId),
      ctx.db.get(dependentFeatureId),
    ]);

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Added dependency to feature "${dependentFeature?.name || "Unknown feature"}"`,
      description: `Added "${parentFeature?.name || "Unknown feature"}" as dependency`,
      activity: "dependency_added",
      entityType: "feature",
      entityId: dependentFeatureId.toString(),
      entityName: dependentFeature?.name || "Unknown feature",
      projectId: dependentFeature?.projectId,
      featureId: dependentFeatureId,
      metadata: {
        newValue: parentFeature?.name,
      },
    });
  },
});

export const removeFeatureDependency = mutation({
  args: {
    token: v.string(),
    parentId: v.id("feature"),
    dependentFeatureId: v.id("feature"),
  },
  handler: async (ctx, { token, parentId, dependentFeatureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const dependency = await ctx.db
      .query("featureDependency")
      .withIndex("byParent", (q) => q.eq("parentId", parentId))
      .filter((q) => q.eq(q.field("dependentFeatureId"), dependentFeatureId))
      .first();

    if (dependency) {
      // Get feature names for better activity tracking before deletion
      const [parentFeature, dependentFeature] = await Promise.all([
        ctx.db.get(parentId),
        ctx.db.get(dependentFeatureId),
      ]);

      await ctx.db.delete(dependency._id);

      // Track activity
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: session.activeOrganizationId as Id<"organization">,
        userId: session.userId as Id<"user">,
        title: `Removed dependency from feature "${dependentFeature?.name || "Unknown feature"}"`,
        description: `Removed "${parentFeature?.name || "Unknown feature"}" as dependency`,
        activity: "dependency_removed",
        entityType: "feature",
        entityId: dependentFeatureId.toString(),
        entityName: dependentFeature?.name || "Unknown feature",
        projectId: dependentFeature?.projectId,
        featureId: dependentFeatureId,
        metadata: {
          oldValue: parentFeature?.name,
        },
      });
    }
  },
});

export const getFeatureDependencies = query({
  args: {
    token: v.string(),
    featureId: v.id("feature"),
  },
  handler: async (ctx, { token, featureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get features this feature depends on (blockers)
    const dependencies = await ctx.db
      .query("featureDependency")
      .withIndex("byDependent", (q) => q.eq("dependentFeatureId", featureId))
      .collect();

    // Get features that depend on this feature (dependents)
    const dependents = await ctx.db
      .query("featureDependency")
      .withIndex("byParent", (q) => q.eq("parentId", featureId))
      .collect();

    const [dependencyFeatures, dependentFeatures] = await Promise.all([
      Promise.all(
        dependencies.map(async (dep) => {
          const feature = await ctx.db.get(dep.parentId);
          const user = feature?.assignedTo
            ? await ctx.db.get(feature.assignedTo as Id<"user">)
            : null;
          return { ...feature, user };
        })
      ),
      Promise.all(
        dependents.map(async (dep) => {
          const feature = await ctx.db.get(dep.dependentFeatureId);
          const user = feature?.assignedTo
            ? await ctx.db.get(feature.assignedTo as Id<"user">)
            : null;
          return { ...feature, user };
        })
      ),
    ]);

    return {
      dependencies: dependencyFeatures.filter(Boolean),
      dependents: dependentFeatures.filter(Boolean),
    };
  },
});

export const checkCircularDependency = query({
  args: {
    token: v.string(),
    parentId: v.id("feature"),
    dependentFeatureId: v.id("feature"),
  },
  handler: async (ctx, { token, parentId, dependentFeatureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Check if adding this dependency would create a circular dependency
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = async (
      featureId: Id<"feature">,
      simulatedDeps: Map<string, string[]>
    ): Promise<boolean> => {
      if (recursionStack.has(featureId)) {
        return true; // Cycle detected
      }

      if (visited.has(featureId)) {
        return false; // Already processed
      }

      visited.add(featureId);
      recursionStack.add(featureId);

      // Get all dependencies of this feature (including simulated one)
      const dependencies = await ctx.db
        .query("featureDependency")
        .withIndex("byDependent", (q) => q.eq("dependentFeatureId", featureId))
        .collect();

      const depParentIds = dependencies.map((dep) => dep.parentId);

      // Add simulated dependency if applicable
      if (simulatedDeps.has(featureId)) {
        depParentIds.push(
          ...simulatedDeps.get(featureId)!.map((id) => id as Id<"feature">)
        );
      }

      for (const parentId of depParentIds) {
        if (await hasCycle(parentId, simulatedDeps)) {
          return true;
        }
      }

      recursionStack.delete(featureId);
      return false;
    };

    // Create a map with the simulated dependency
    const simulatedDeps = new Map<string, string[]>();
    simulatedDeps.set(dependentFeatureId, [parentId]);

    const wouldCreateCycle = await hasCycle(dependentFeatureId, simulatedDeps);

    return { wouldCreateCycle };
  },
});

export const getFeatureDependencyGraph = query({
  args: {
    token: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, { token, projectId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get all features for the project or organization
    const features = projectId
      ? await ctx.db
          .query("feature")
          .withIndex("byOrgProject", (q) => q.eq("projectId", projectId))
          .collect()
      : await ctx.db
          .query("feature")
          .withIndex("byOrg", (q) =>
            q.eq("organizationId", session.activeOrganizationId as any)
          )
          .collect();

    // Get all dependencies
    const allDependencies = await ctx.db.query("featureDependency").collect();

    // Filter dependencies to only include features in our scope
    const featureIds = new Set(features.map((f) => f._id));
    const dependencies = allDependencies.filter(
      (dep) =>
        featureIds.has(dep.parentId) && featureIds.has(dep.dependentFeatureId)
    );

    // Enrich features with user data
    const enrichedFeatures = await Promise.all(
      features.map(async (feature) => {
        const user = feature.assignedTo
          ? await ctx.db.get(feature.assignedTo as Id<"user">)
          : null;
        return { ...feature, user };
      })
    );

    return {
      features: enrichedFeatures,
      dependencies,
    };
  },
});

export const validateFeatureCompletion = query({
  args: {
    token: v.string(),
    featureId: v.id("feature"),
  },
  handler: async (ctx, { token, featureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get all features this feature depends on
    const dependencies = await ctx.db
      .query("featureDependency")
      .withIndex("byDependent", (q) => q.eq("dependentFeatureId", featureId))
      .collect();

    const blockers = [];
    for (const dep of dependencies) {
      const feature = await ctx.db.get(dep.parentId);
      if (feature && feature.phase !== "LIVE") {
        blockers.push(feature);
      }
    }

    return {
      canComplete: blockers.length === 0,
      blockers,
    };
  },
});

export const getProjectDependencyStats = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, { token, projectId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const features = await ctx.db
      .query("feature")
      .withIndex("byOrgProject", (q) => q.eq("projectId", projectId))
      .collect();

    const dependencies = await ctx.db.query("featureDependency").collect();
    const featureIds = new Set(features.map((f) => f._id));
    const projectDependencies = dependencies.filter(
      (dep) =>
        featureIds.has(dep.parentId) && featureIds.has(dep.dependentFeatureId)
    );

    const stats = {
      totalFeatures: features.length,
      totalDependencies: projectDependencies.length,
      featuresWithDependencies: new Set(
        projectDependencies.map((d) => d.dependentFeatureId)
      ).size,
      featuresBeingDependedOn: new Set(
        projectDependencies.map((d) => d.parentId)
      ).size,
      blockedFeatures: 0,
      completableFeatures: 0,
    };

    // Calculate blocked and completable features
    for (const feature of features) {
      const featureDeps = projectDependencies.filter(
        (d) => d.dependentFeatureId === feature._id
      );

      if (featureDeps.length === 0) {
        stats.completableFeatures++;
      } else {
        const blockers = await Promise.all(
          featureDeps.map((d) => ctx.db.get(d.parentId))
        );
        const hasBlockers = blockers.some((b) => b && b.phase !== "LIVE");

        if (hasBlockers) {
          stats.blockedFeatures++;
        } else {
          stats.completableFeatures++;
        }
      }
    }

    return stats;
  },
});

export const getSubFeatures = query({
  args: {
    token: v.string(),
    parentFeatureId: v.id("feature"),
  },
  handler: async (ctx, { token, parentFeatureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const subFeatures = await ctx.db
      .query("feature")
      .withIndex("byParentFeature", (q) =>
        q.eq("parentFeatureId", parentFeatureId)
      )
      .collect();

    const enrichedSubFeatures = await Promise.all(
      subFeatures.map(async (feature) => {
        const [user, project] = await Promise.all([
          feature.assignedTo
            ? ctx.db.get(feature.assignedTo as Id<"user">)
            : null,
          feature.projectId
            ? ctx.db.get(feature.projectId as Id<"projects">)
            : null,
        ]);

        return {
          ...feature,
          user,
          project,
        };
      })
    );

    return enrichedSubFeatures;
  },
});

export const getParentFeature = query({
  args: {
    token: v.string(),
    featureId: v.id("feature"),
  },
  handler: async (ctx, { token, featureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const feature = await ctx.db.get(featureId);
    if (!feature || !feature.parentFeatureId) {
      return null;
    }

    const parentFeature = await ctx.db.get(feature.parentFeatureId);
    if (!parentFeature) {
      return null;
    }

    const [user, project] = await Promise.all([
      parentFeature.assignedTo
        ? ctx.db.get(parentFeature.assignedTo as Id<"user">)
        : null,
      parentFeature.projectId
        ? ctx.db.get(parentFeature.projectId as Id<"projects">)
        : null,
    ]);

    return {
      ...parentFeature,
      user,
      project,
    };
  },
});

export const getFeatureHierarchy = query({
  args: {
    token: v.string(),
    featureId: v.id("feature"),
  },
  handler: async (ctx, { token, featureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const feature = await ctx.db.get(featureId);
    if (!feature) {
      throw Error("Feature not found");
    }

    // Get parent feature if exists
    const parentFeature = feature.parentFeatureId
      ? await ctx.db.get(feature.parentFeatureId)
      : null;

    // Get sub-features
    const subFeatures = await ctx.db
      .query("feature")
      .withIndex("byParentFeature", (q) => q.eq("parentFeatureId", featureId))
      .collect();

    // Enrich with user data
    const enrichedSubFeatures = await Promise.all(
      subFeatures.map(async (subFeature) => {
        const user = subFeature.assignedTo
          ? await ctx.db.get(subFeature.assignedTo as Id<"user">)
          : null;
        return { ...subFeature, user };
      })
    );

    const enrichedParent = parentFeature
      ? {
          ...parentFeature,
          user: parentFeature.assignedTo
            ? await ctx.db.get(parentFeature.assignedTo as Id<"user">)
            : null,
        }
      : null;

    return {
      feature: {
        ...feature,
        user: feature.assignedTo
          ? await ctx.db.get(feature.assignedTo as Id<"user">)
          : null,
      },
      parentFeature: enrichedParent,
      subFeatures: enrichedSubFeatures,
    };
  },
});

export const getTopLevelFeatures = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, { token, projectId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get features that don't have a parent (top-level features)
    const features = await ctx.db
      .query("feature")
      .withIndex("byOrgProject", (q) => q.eq("projectId", projectId))
      .filter((q) => q.eq(q.field("parentFeatureId"), undefined))
      .order("desc")
      .collect();

    const finalFeatures = Promise.all(
      features.map(async (feature) => {
        const [user, project, phaseHistory, subFeatures] = await Promise.all([
          feature.assignedTo
            ? ctx.db.get(feature.assignedTo as Id<"user">)
            : null,
          feature.projectId
            ? ctx.db.get(feature.projectId as Id<"projects">)
            : null,
          ctx.db
            .query("featurePhaseHistory")
            .withIndex("byFeature", (q) => q.eq("featureId", feature._id))
            .order("desc")
            .collect(),
          ctx.db
            .query("feature")
            .withIndex("byParentFeature", (q) =>
              q.eq("parentFeatureId", feature._id)
            )
            .collect(),
        ]);

        return {
          ...feature,
          user,
          project,
          phaseHistory,
          subFeatureCount: subFeatures.length,
          hasSubFeatures: subFeatures.length > 0,
        };
      })
    );

    return finalFeatures;
  },
});

// Feature Link Management Functions
export const getLinks = query({
  args: {
    token: v.string(),
    featureId: v.id("feature"),
  },
  handler: async (ctx, { token, featureId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const links = await ctx.db
      .query("featureLink")
      .withIndex("byFeature", (q) => q.eq("featureId", featureId))
      .collect();

    return links;
  },
});

export const addLink = mutation({
  args: {
    token: v.string(),
    featureId: v.id("feature"),
    link: v.object({
      url: v.string(),
    }),
  },
  handler: async (ctx, { token, featureId, link }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Fetch metadata for the link
    try {
      const response = await fetch(link.url);
      const html = await response.text();

      // Create a simple HTML parser
      const getMetaContent = (content: string, property: string) => {
        const match =
          content.match(
            new RegExp(
              `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
              "i"
            )
          ) ||
          content.match(
            new RegExp(
              `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
              "i"
            )
          );
        return match ? match[1] : null;
      };

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Extract metadata
      const metadata = {
        title: getMetaContent(html, "og:title") || title,
        description:
          getMetaContent(html, "og:description") ||
          getMetaContent(html, "description"),
        image: getMetaContent(html, "og:image"),
        siteName: getMetaContent(html, "og:site_name"),
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`,
      };

      // Insert the link with metadata
      const newLink = await ctx.db.insert("featureLink", {
        ...link,
        featureId,
        metadata: metadata as any,
      });

      // Get feature for activity tracking
      const feature = await ctx.db.get(featureId);

      // Track activity
      if (feature) {
        await ctx.runMutation(internal.activities.trackActivity, {
          organizationId: session.activeOrganizationId as Id<"organization">,
          userId: session.userId as Id<"user">,
          title: `Added link to feature "${feature.name}"`,
          description: `Added link: ${link.url}`,
          activity: "link_added",
          entityType: "feature",
          entityId: featureId.toString(),
          entityName: feature.name,
          projectId: feature.projectId,
          featureId: featureId,
          metadata: {
            newValue: link.url,
          },
        });
      }

      return newLink;
    } catch (error) {
      // If metadata fetching fails, still save the link but without metadata
      const newLink = await ctx.db.insert("featureLink", {
        ...link,
        featureId,
      });

      // Get feature for activity tracking
      const feature = await ctx.db.get(featureId);

      // Track activity
      if (feature) {
        await ctx.runMutation(internal.activities.trackActivity, {
          organizationId: session.activeOrganizationId as Id<"organization">,
          userId: session.userId as Id<"user">,
          title: `Added link to feature "${feature.name}"`,
          description: `Added link: ${link.url}`,
          activity: "link_added",
          entityType: "feature",
          entityId: featureId.toString(),
          entityName: feature.name,
          projectId: feature.projectId,
          featureId: featureId,
          metadata: {
            newValue: link.url,
          },
        });
      }

      return newLink;
    }
  },
});

export const deleteLink = mutation({
  args: {
    token: v.string(),
    linkId: v.id("featureLink"),
  },
  handler: async (ctx, { token, linkId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get link and feature info before deletion for activity tracking
    const link = await ctx.db.get(linkId);
    const feature = link ? await ctx.db.get(link.featureId) : null;

    await ctx.db.delete(linkId);

    // Track activity
    if (feature && link) {
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: session.activeOrganizationId as Id<"organization">,
        userId: session.userId as Id<"user">,
        title: `Removed link from feature "${feature.name}"`,
        description: `Removed link: ${link.url}`,
        activity: "link_removed",
        entityType: "feature",
        entityId: feature._id.toString(),
        entityName: feature.name,
        projectId: feature.projectId,
        featureId: feature._id,
        metadata: {
          oldValue: link.url,
        },
      });
    }
  },
});
