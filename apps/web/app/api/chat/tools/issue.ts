import {
  IssueLabelSchema,
  prisma,
  IssueStatusSchema,
  ImportanceSchema,
} from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getIssues = tool({
  description:
    "Get all issues that belong to the current organization, optionally filtered by project.",
  inputSchema: z.object({
    projectId: z
      .string()
      .optional()
      .describe("The project ID to filter issues by"),
  }),
  execute: async ({ projectId }) => {
    const { org } = await getSession();
    const issues = await prisma.issue.findMany({
      where: {
        organizationId: org,
        ...(projectId && { projectId }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentIssue: {
          select: {
            id: true,
            title: true,
          },
        },
        subIssues: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            subIssues: true,
            dependencies: true,
            dependentOn: true,
          },
        },
      },
    });
    return issues;
  },
});

export const createIssue = tool({
  description: "Create a new issue for the current organization.",
  inputSchema: z.object({
    title: z.string().min(1).max(200).describe("The title of the issue"),
    description: z.string().optional().describe("The description of the issue"),
    projectId: z
      .string()
      .min(1)
      .describe("The project ID this issue belongs to"),
    status: IssueStatusSchema,
    priority: ImportanceSchema,
    label: IssueLabelSchema,
    assignedToId: z
      .string()
      .optional()
      .describe("The user ID to assign this issue to"),
    dueDate: z
      .string()
      .optional()
      .describe("The due date for the issue (ISO string)"),
    isPublic: z.boolean().optional().describe("Whether the issue is public"),
  }),
  execute: async ({
    title,
    description,
    projectId,
    status,
    priority,
    label,
    dueDate,
    isPublic,
  }) => {
    const { org, userId } = await getSession();

    // Verify the project belongs to the organization
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

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        organizationId: org,
        projectId,
        status,
        priority,
        label,
        dueDate: dueDate ? new Date(dueDate) : null,
        isPublic: isPublic ?? false,
      },
    });

    return issue;
  },
});

export const getCurrentIssue = tool({
  description:
    "Get a specific issue by ID that belongs to the current organization.",
  inputSchema: z.object({
    issueId: z.string().min(1).describe("The issue ID"),
  }),
  execute: async ({ issueId }) => {
    const { org } = await getSession();
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        organizationId: org,
      },
      include: {
        project: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentIssue: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        subIssues: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        dependencies: {
          include: {
            dependency: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        dependentOn: {
          include: {
            issue: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        links: true,
        _count: {
          select: {
            subIssues: true,
            dependencies: true,
            dependentOn: true,
          },
        },
      },
    });

    if (!issue) {
      return `Issue with the ID of ${issueId} was not found, the user probably didn't select an issue or provided an invalid ID`;
    }

    return issue;
  },
});

export const updateIssue = tool({
  description:
    "Update an existing issue that belongs to the current organization.",
  inputSchema: z.object({
    issueId: z.string().min(1).describe("The issue ID to update"),
    title: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("The new title of the issue"),
    description: z
      .string()
      .optional()
      .describe("The new description of the issue"),
    status: z
      .enum([
        "BACKLOG",
        "TODO",
        "IN_PROGRESS",
        "IN_REVIEW",
        "DONE",
        "CANCELLED",
      ])
      .optional()
      .describe("The new status of the issue"),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .optional()
      .describe("The new priority of the issue"),
    label: z
      .enum([
        "BUG",
        "FEATURE",
        "IMPROVEMENT",
        "DOCUMENTATION",
        "QUESTION",
        "DUPLICATE",
        "INVALID",
        "WONTFIX",
      ])
      .optional()
      .describe("The new label/type of the issue"),
    assignedToId: z
      .string()
      .optional()
      .describe("The new user ID to assign this issue to"),
    dueDate: z
      .string()
      .optional()
      .describe("The new due date for the issue (ISO string)"),
    achieved: z
      .boolean()
      .optional()
      .describe("Whether the issue has been achieved/completed"),
  }),
  execute: async ({
    issueId,
    title,
    description,
    status,
    priority,
    label,
    assignedToId,
    dueDate,
    achieved,
  }) => {
    const { org } = await getSession();

    // Verify the issue exists and belongs to the organization
    const existingIssue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        organizationId: org,
      },
    });

    if (!existingIssue) {
      throw new Error("Issue not found or doesn't belong to your organization");
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (label !== undefined) updateData.label = label;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (achieved !== undefined) updateData.achieved = achieved;

    const updatedIssue = await prisma.issue.update({
      where: {
        id: issueId,
      },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentIssue: {
          select: {
            id: true,
            title: true,
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedIssue;
  },
});

export const deleteIssue = tool({
  description:
    "Delete an issue that belongs to the current organization. This will also delete all sub-issues.",
  inputSchema: z.object({
    issueId: z.string().min(1).describe("The issue ID to delete"),
  }),
  execute: async ({ issueId }) => {
    const { org } = await getSession();

    // Verify the issue exists and belongs to the organization
    const existingIssue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        organizationId: org,
      },
      include: {
        _count: {
          select: {
            subIssues: true,
          },
        },
      },
    });

    if (!existingIssue) {
      throw new Error("Issue not found or doesn't belong to your organization");
    }

    // Delete the issue (sub-issues will be deleted due to cascade)
    await prisma.issue.delete({
      where: {
        id: issueId,
      },
    });

    return {
      success: true,
      message: `Issue "${existingIssue.title}" and ${existingIssue._count.subIssues} sub-issues have been deleted successfully.`,
    };
  },
});
