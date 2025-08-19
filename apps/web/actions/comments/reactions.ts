"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "@/actions/account/user";
import { revalidatePath } from "next/cache";

/**
 * Adds a reaction to a comment
 */
export async function addCommentReaction(commentId: string, emoji: string) {
  try {
    const { userId, org } = await getSession();

    // Verify the comment exists and user has access
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        organizationId: org,
        isDeleted: false,
      },
      select: {
        id: true,
        projectId: true,
        issueId: true,
        featureId: true,
        milestoneId: true,
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found or access denied" };
    }

    // Check if user already reacted with this emoji
    const existingReaction = await prisma.commentReaction.findUnique({
      where: {
        commentId_userId_emoji: {
          commentId,
          userId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      return {
        success: false,
        error: "You have already reacted with this emoji",
      };
    }

    // Add the reaction
    await prisma.commentReaction.create({
      data: {
        commentId,
        userId,
        emoji,
        organizationId: org,
      },
    });

    // Determine entity type and ID for revalidation
    let entityPath = "";
    if (comment.projectId) {
      entityPath = `/project/${comment.projectId}`;
    } else if (comment.issueId) {
      entityPath = `/issues/${comment.issueId}`;
    } else if (comment.featureId) {
      entityPath = `/features/${comment.featureId}`;
    } else if (comment.milestoneId) {
      entityPath = `/milestones/${comment.milestoneId}`;
    }

    if (entityPath) {
      revalidatePath(entityPath);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding comment reaction:", error);
    return { success: false, error: "Failed to add reaction" };
  }
}

/**
 * Removes a reaction from a comment
 */
export async function removeCommentReaction(commentId: string, emoji: string) {
  try {
    const { userId, org } = await getSession();

    // Verify the comment exists and user has access
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        organizationId: org,
        isDeleted: false,
      },
      select: {
        id: true,
        projectId: true,
        issueId: true,
        featureId: true,
        milestoneId: true,
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found or access denied" };
    }

    // Remove the reaction
    const deletedReaction = await prisma.commentReaction.deleteMany({
      where: {
        commentId,
        userId,
        emoji,
        organizationId: org,
      },
    });

    if (deletedReaction.count === 0) {
      return { success: false, error: "Reaction not found" };
    }

    // Determine entity type and ID for revalidation
    let entityPath = "";
    if (comment.projectId) {
      entityPath = `/project/${comment.projectId}`;
    } else if (comment.issueId) {
      entityPath = `/issues/${comment.issueId}`;
    } else if (comment.featureId) {
      entityPath = `/features/${comment.featureId}`;
    } else if (comment.milestoneId) {
      entityPath = `/milestones/${comment.milestoneId}`;
    }

    if (entityPath) {
      revalidatePath(entityPath);
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing comment reaction:", error);
    return { success: false, error: "Failed to remove reaction" };
  }
}
