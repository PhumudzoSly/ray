import {
  ProjectPlatformSchema,
  ProjectStatusSchema,
  prisma,
} from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getProjects = tool({
  description:
    "Get all projects that belong to the current organization, optionally filtered by status or platform.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("The user's query requires getting all projects?"),
  }),
  execute: async () => {
    const { org } = await getSession();
    const projects = await prisma.project.findMany({
      where: {
        organizationId: org,
      },
      include: {
        idea: true,
        createdBy: true,
        features: true,
        waitlists: true,
        issues: true,
        publicRoadmaps: true,
        milestones: true,
      },
    });
    return projects;
  },
});

export const createProject = tool({
  description: "Create a new project for the current organization.",
  inputSchema: z.object({
    name: z.string().min(1).max(200).describe("The name of the project"),
    description: z
      .string()
      .optional()
      .describe("The description of the project"),
    platform: ProjectPlatformSchema,
    ai: z.string().optional().describe("AI technology used in the project"),
    orm: z.string().optional().describe("ORM used in the project"),
    database: z.string().optional().describe("Database used in the project"),
    auth: z.string().optional().describe("Authentication method used"),
    framework: z.string().optional().describe("Framework used in the project"),
    infrastructure: z.string().optional().describe("Infrastructure setup"),
    dueDate: z
      .string()
      .optional()
      .describe("The due date for the project (ISO string)"),
    status: ProjectStatusSchema.optional(),
    ideaId: z
      .string()
      .optional()
      .describe("The idea ID this project is based on"),
  }),
  execute: async ({
    name,
    description,
    platform,
    ai,
    orm,
    database,
    auth,
    framework,
    infrastructure,
    dueDate,
    status,
    ideaId,
  }) => {
    const { org, userId } = await getSession();

    // Verify the idea belongs to the organization if provided
    if (ideaId) {
      const idea = await prisma.idea.findFirst({
        where: {
          id: ideaId,
          organizationId: org,
        },
      });

      if (!idea) {
        throw new Error(
          "Idea not found or doesn't belong to your organization"
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        platform,
        ai,
        orm,
        database,
        auth,
        framework,
        infrastructure,
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
        ideaId,
        organizationId: org,
        createdById: userId,
      },
    });

    return project;
  },
});

export const getCurrentProject = tool({
  description:
    "Get a specific project by ID that belongs to the current organization.",
  inputSchema: z.object({
    projectId: z.string().min(1).describe("The project ID"),
  }),
  execute: async ({ projectId }) => {
    const { org } = await getSession();
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: org,
      },
      include: {
        idea: true,
        createdBy: true,
        features: true,
        waitlists: true,
        issues: true,
        publicRoadmaps: true,
        milestones: true,
      },
    });

    if (!project) {
      return `Project with the ID of ${projectId} was not found, the user probably didn't select a project or provided an invalid ID`;
    }

    return project;
  },
});

export const updateProject = tool({
  description:
    "Update an existing project that belongs to the current organization.",
  inputSchema: z.object({
    projectId: z.string().min(1).describe("The project ID to update"),
    name: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("The new name of the project"),
    description: z
      .string()
      .optional()
      .describe("The new description of the project"),
    platform: ProjectPlatformSchema.optional().describe(
      "The new platform of the project"
    ),
    ai: z.string().optional().describe("AI technology used in the project"),
    orm: z.string().optional().describe("ORM used in the project"),
    database: z.string().optional().describe("Database used in the project"),
    auth: z.string().optional().describe("Authentication method used"),
    framework: z.string().optional().describe("Framework used in the project"),
    infrastructure: z.string().optional().describe("Infrastructure setup"),
    dueDate: z
      .string()
      .optional()
      .describe("The new due date for the project (ISO string)"),
    status: ProjectStatusSchema.optional().describe(
      "The new status of the project"
    ),
  }),
  execute: async ({
    projectId,
    name,
    description,
    platform,
    ai,
    orm,
    database,
    auth,
    framework,
    infrastructure,
    dueDate,
    status,
  }) => {
    const { org } = await getSession();

    // Verify the project exists and belongs to the organization
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: org,
      },
    });

    if (!existingProject) {
      throw new Error(
        "Project not found or doesn't belong to your organization"
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (platform !== undefined) updateData.platform = platform;
    if (ai !== undefined) updateData.ai = ai;
    if (orm !== undefined) updateData.orm = orm;
    if (database !== undefined) updateData.database = database;
    if (auth !== undefined) updateData.auth = auth;
    if (framework !== undefined) updateData.framework = framework;
    if (infrastructure !== undefined)
      updateData.infrastructure = infrastructure;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) updateData.status = status;

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: updateData,
      include: {
        idea: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedProject;
  },
});

export const deleteProject = tool({
  description:
    "Delete a project that belongs to the current organization. This will also delete all associated issues, features, milestones, assets, roadmaps, and waitlists.",
  inputSchema: z.object({
    projectId: z.string().min(1).describe("The project ID to delete"),
  }),
  execute: async ({ projectId }) => {
    const { org } = await getSession();

    // Verify the project exists and belongs to the organization
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: org,
      },
      include: {
        _count: {
          select: {
            issues: true,
            features: true,
            milestones: true,
            assets: true,
            publicRoadmaps: true,
            waitlists: true,
          },
        },
      },
    });

    if (!existingProject) {
      throw new Error(
        "Project not found or doesn't belong to your organization"
      );
    }

    // Delete the project (all related items will be deleted due to cascade)
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return {
      success: true,
      message: `Project "${existingProject.name}" and all associated data have been deleted successfully. This included ${existingProject._count.issues} issues, ${existingProject._count.features} features, ${existingProject._count.milestones} milestones, ${existingProject._count.assets} assets, ${existingProject._count.publicRoadmaps} roadmaps, and ${existingProject._count.waitlists} waitlists.`,
    };
  },
});
