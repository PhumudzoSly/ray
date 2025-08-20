import {
  FeaturePhaseSchema,
  ImportanceSchema,
  prisma,
} from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getFeatures = tool({
  description: "Get all features that belong to the current organization.",
  inputSchema: z.object({
    projectId: z.string().optional().describe("Filter features by project ID"),
  }),
  execute: async ({ projectId }) => {
    const { org } = await getSession();

    const features = await prisma.feature.findMany({
      where: {
        organizationId: org,
        ...(projectId && { projectId }),
      },
      include: {
        project: true,
        subFeatures: true,
        milestone: true,
        parentFeature: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return features;
  },
});

export const createFeature = tool({
  description: "Create a new feature for the current organization.",
  inputSchema: z.object({
    name: z.string().min(1).max(200).describe("The name of the feature"),
    description: z
      .string()
      .optional()
      .describe("The description of the feature"),
    projectId: z
      .string()
      .optional()
      .describe("The project ID this feature belongs to"),
    phase: FeaturePhaseSchema.optional().describe(
      "The current phase of the feature"
    ),
    priority: ImportanceSchema.optional().describe(
      "The priority of the feature"
    ),
    estimatedEffort: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Estimated effort in story points or hours"),
  }),
  execute: async ({
    name,
    description,
    projectId,
    phase,
    priority,
    estimatedEffort,
  }) => {
    const { org } = await getSession();

    // Verify the project belongs to the organization if provided
    if (projectId) {
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
    }

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    const feature = await prisma.feature.create({
      data: {
        name,
        description: description ?? "",
        organizationId: org,
        projectId,
        phase: phase ?? FeaturePhaseSchema.Enum.PLANNING,
        priority: priority ?? "MEDIUM",
        estimatedEffort,
      },
    });

    return feature;
  },
});

export const getCurrentFeature = tool({
  description:
    "Get a specific feature by ID that belongs to the current organization.",
  inputSchema: z.object({
    featureId: z.string().min(1).describe("The feature ID"),
  }),
  execute: async ({ featureId }) => {
    const { org } = await getSession();
    const feature = await prisma.feature.findFirst({
      where: {
        id: featureId,
        organizationId: org,
      },
      include: {
        project: true,
        subFeatures: true,
        milestone: true,
        parentFeature: true,
      },
    });

    if (!feature) {
      return `Feature with the ID of ${featureId} was not found, the user probably didn't select a feature or provided an invalid ID`;
    }

    return feature;
  },
});

export const updateFeature = tool({
  description:
    "Update an existing feature that belongs to the current organization.",
  inputSchema: z.object({
    featureId: z.string().min(1).describe("The feature ID to update"),
    name: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("The new name of the feature"),
    description: z
      .string()
      .optional()
      .describe("The new description of the feature"),
    projectId: z
      .string()
      .optional()
      .describe("The new project ID this feature belongs to"),
    phase: FeaturePhaseSchema.optional().describe(
      "The new phase of the feature"
    ),
    priority: ImportanceSchema.optional().describe(
      "The new priority of the feature"
    ),
    isPublic: z
      .boolean()
      .optional()
      .describe("Whether the feature is publicly visible"),
    estimatedEffort: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("New estimated effort in story points or hours"),
    targetDate: z
      .string()
      .optional()
      .describe("New target completion date (ISO string)"),
    tags: z
      .array(z.string())
      .optional()
      .describe("New array of tags for the feature"),
  }),
  execute: async ({
    featureId,
    name,
    description,
    projectId,
    phase,
    priority,
    isPublic,
    estimatedEffort,
    targetDate,
    tags,
  }) => {
    const { org } = await getSession();

    // Verify the feature exists and belongs to the organization
    const existingFeature = await prisma.feature.findFirst({
      where: {
        id: featureId,
        organizationId: org,
      },
    });

    if (!existingFeature) {
      throw new Error(
        "Feature not found or doesn't belong to your organization"
      );
    }

    // Verify the project belongs to the organization if provided
    if (projectId) {
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
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (phase !== undefined) updateData.phase = phase;
    if (priority !== undefined) updateData.priority = priority;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (estimatedEffort !== undefined)
      updateData.estimatedEffort = estimatedEffort;
    if (targetDate !== undefined)
      updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (tags !== undefined) updateData.tags = tags;

    const updatedFeature = await prisma.feature.update({
      where: {
        id: featureId,
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

    return updatedFeature;
  },
});

export const deleteFeature = tool({
  description:
    "Delete a feature that belongs to the current organization. This will also delete all associated votes and comments.",
  inputSchema: z.object({
    featureId: z.string().min(1).describe("The feature ID to delete"),
  }),
  execute: async ({ featureId }) => {
    const { org } = await getSession();

    // Verify the feature exists and belongs to the organization
    const existingFeature = await prisma.feature.findFirst({
      where: {
        id: featureId,
        organizationId: org,
      },
    });

    if (!existingFeature) {
      throw new Error(
        "Feature not found or doesn't belong to your organization"
      );
    }

    // Delete the feature (votes and comments will be deleted due to cascade)
    await prisma.feature.delete({
      where: {
        id: featureId,
      },
    });

    return {
      success: true,
      message: `Feature "${existingFeature.name}" has been deleted successfully.`,
    };
  },
});
