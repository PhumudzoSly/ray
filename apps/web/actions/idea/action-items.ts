"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "@/actions/account/user";
import { revalidatePath } from "next/cache";
import {
  ActionItemStatus,
  Importance,
} from "@workspace/backend/prisma/generated/client/client";

export interface CreateActionItemData {
  name: string;
  description?: string;
  status: ActionItemStatus;
  priority: Importance;
  order?: number;
  ideaId: string;
  assigneeId?: string;
}

export interface UpdateActionItemData {
  name?: string;
  description?: string;
  status?: ActionItemStatus;
  priority?: Importance;
  order?: number;
  assigneeId?: string;
  completedAt?: Date | null;
}

export async function createActionItem(data: CreateActionItemData) {
  try {
    const { userId, org } = await getSession();

    if (!userId || !org) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the idea belongs to the user's organization
    const idea = await prisma.idea.findFirst({
      where: {
        id: data.ideaId,
        organizationId: org,
      },
    });

    if (!idea) {
      return { success: false, error: "Idea not found or access denied" };
    }

    // If assignee is provided, verify they're in the same organization
    if (data.assigneeId) {
      const assignee = await prisma.member.findFirst({
        where: {
          userId: data.assigneeId,
          organizationId: org,
        },
      });

      if (!assignee) {
        return { success: false, error: "Assignee not found in organization" };
      }
    }

    const actionItem = await prisma.actionItem.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        order: data.order || 0,
        ideaId: data.ideaId,
        assigneeId: data.assigneeId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        document: true,
      },
    });

    revalidatePath(`/ideas/${data.ideaId}`);
    return { success: true, data: actionItem };
  } catch (error) {
    console.error("Failed to create action item:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create action item",
    };
  }
}

export async function getActionItems(ideaId: string) {
  try {
    const { userId, org } = await getSession();

    if (!userId || !org) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the idea belongs to the user's organization
    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        organizationId: org,
      },
    });

    if (!idea) {
      return { success: false, error: "Idea not found or access denied" };
    }

    const actionItems = await prisma.actionItem.findMany({
      where: {
        ideaId: ideaId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        document: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return { success: true, data: actionItems };
  } catch (error) {
    console.error("Failed to get action items:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get action items",
    };
  }
}

export async function updateActionItem(id: string, data: UpdateActionItemData) {
  try {
    const { userId, org } = await getSession();

    if (!userId || !org) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the action item and verify access
    const existingActionItem = await prisma.actionItem.findFirst({
      where: {
        id: id,
      },
      include: {
        idea: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!existingActionItem || existingActionItem.idea.organizationId !== org) {
      return {
        success: false,
        error: "Action item not found or access denied",
      };
    }

    // If assignee is being updated, verify they're in the same organization
    if (data.assigneeId) {
      const assignee = await prisma.member.findFirst({
        where: {
          userId: data.assigneeId,
          organizationId: org,
        },
      });

      if (!assignee) {
        return { success: false, error: "Assignee not found in organization" };
      }
    }

    // Set completedAt when status changes to COMPLETED
    const updateData = { ...data };
    if (
      data.status === "COMPLETED" &&
      existingActionItem.status !== "COMPLETED"
    ) {
      updateData.completedAt = new Date();
    } else if (data.status && data.status !== "COMPLETED") {
      updateData.completedAt = null;
    }

    const actionItem = await prisma.actionItem.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        document: true,
      },
    });

    revalidatePath(`/ideas/${existingActionItem.ideaId}`);
    return { success: true, data: actionItem };
  } catch (error) {
    console.error("Failed to update action item:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update action item",
    };
  }
}

export async function deleteActionItem(id: string) {
  try {
    const { userId, org } = await getSession();

    if (!userId || !org) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the action item and verify access
    const actionItem = await prisma.actionItem.findFirst({
      where: {
        id: id,
      },
      include: {
        idea: {
          select: {
            organizationId: true,
            id: true,
          },
        },
      },
    });

    if (!actionItem || actionItem.idea.organizationId !== org) {
      return {
        success: false,
        error: "Action item not found or access denied",
      };
    }

    await prisma.actionItem.delete({
      where: { id },
    });

    revalidatePath(`/ideas/${actionItem.ideaId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete action item:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete action item",
    };
  }
}
