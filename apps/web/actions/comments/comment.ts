"use server";

import { prisma } from "@workspace/backend";
import { revalidatePath } from "next/cache";
import { getSession } from "@/actions/account/user";
import {
  extractMentionedUserIds,
  resolveCommentContent,
} from "@/lib/comments/mentions";
import type {
  CommentEntityType,
  CreateCommentData,
  CommentData,
  CommentAttachmentData,
  CommentReactionData,
  ResolvedUser,
} from "@/types/comments";

/**
 * Creates a new comment on an entity (project, issue, feature, or milestone)
 */
export async function createComment(data: CreateCommentData) {
  try {
    const { userId, org } = await getSession();
    const {
      content,
      entityType,
      entityId,
      attachmentIds = [],
      parentCommentId,
    } = data;

    // Extract mentioned user IDs from content
    const mentionedUserIds = extractMentionedUserIds(content);

    // Validate that the entity exists and user has access
    const entityExists = await validateEntityAccess(entityType, entityId, org);
    if (!entityExists) {
      return { success: false, error: "Entity not found or access denied" };
    }

    // If this is a reply, validate the parent comment
    if (parentCommentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: parentCommentId,
          organizationId: org,
          isDeleted: false,
          parentCommentId: null, // Ensure parent is a top-level comment
        },
        select: { id: true, parentCommentId: true },
      });

      if (!parentComment) {
        return {
          success: false,
          error:
            "Parent comment not found or replies to replies are not allowed",
        };
      }
    }

    // Create the comment with entity relationship
    const entityRelation = getEntityRelation(entityType, entityId);

    const comment = await prisma.comment.create({
      data: {
        content,
        organizationId: org,
        authorId: userId,
        mentionedUserIds,
        parentCommentId,
        ...entityRelation,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Revalidate the entity page
    revalidatePath(`/${entityType}/${entityId}`);

    return { success: true, comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

/**
 * Validates that the entity exists and user has access to it
 */
async function validateEntityAccess(
  entityType: CommentEntityType,
  entityId: string,
  organizationId: string
): Promise<boolean> {
  try {
    switch (entityType) {
      case "project":
        const project = await prisma.project.findFirst({
          where: { id: entityId, organizationId },
          select: { id: true },
        });
        return !!project;

      case "issue":
        const issue = await prisma.issue.findFirst({
          where: { id: entityId, organizationId },
          select: { id: true },
        });
        return !!issue;

      case "feature":
        const feature = await prisma.feature.findFirst({
          where: { id: entityId, organizationId },
          select: { id: true },
        });
        return !!feature;

      case "board":
        const board = await prisma.board.findFirst({
          where: { id: entityId },
          select: { id: true },
        });
        return !!board;

      default:
        return false;
    }
  } catch (error) {
    console.error("Error validating entity access:", error);
    return false;
  }
}

/**
 * Gets comments for a specific entity with pagination
 */
export async function getEntityComments(
  entityType: CommentEntityType,
  entityId: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const { userId, org } = await getSession();

    // Validate that the entity exists and user has access
    const entityExists = await validateEntityAccess(entityType, entityId, org);
    if (!entityExists) {
      return { success: false, error: "Entity not found or access denied" };
    }

    // Build the where clause for the entity
    const entityWhere = getEntityWhere(entityType, entityId);

    const skip = (page - 1) * limit;

    // Get parent comments (top-level) with pagination
    const [parentComments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: {
          organizationId: org,
          isDeleted: false,
          parentCommentId: null, // Only top-level comments
          ...entityWhere,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              originalName: true,
              mimeType: true,
              fileSize: true,
              url: true,
              thumbnailUrl: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          replies: {
            where: {
              isDeleted: false,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              attachments: {
                select: {
                  id: true,
                  fileName: true,
                  originalName: true,
                  mimeType: true,
                  fileSize: true,
                  url: true,
                  thumbnailUrl: true,
                },
              },
              reactions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "asc", // Chronological order as per requirements
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: {
          organizationId: org,
          isDeleted: false,
          parentCommentId: null, // Only count top-level comments for pagination
          ...entityWhere,
        },
      }),
    ]);

    // Get all mentioned users for resolution (including replies)
    const allMentionedUserIds = parentComments.flatMap((comment) => [
      ...comment.mentionedUserIds,
      ...comment.replies.flatMap((reply) => reply.mentionedUserIds),
    ]);
    const uniqueUserIds = [...new Set(allMentionedUserIds)];

    const mentionedUsers =
      uniqueUserIds.length > 0
        ? await prisma.user.findMany({
            where: {
              id: { in: uniqueUserIds },
            },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          })
        : [];

    // Helper function to process a single comment (parent or reply)
    const processComment = (comment: any): CommentData => {
      // Get mentioned users for this comment
      const commentMentionedUsers = mentionedUsers.filter((user) =>
        comment.mentionedUserIds.includes(user.id)
      );

      // Process reactions to group by emoji
      const reactionMap = new Map<
        string,
        {
          count: number;
          users: { id: string; name: string }[];
          hasReacted: boolean;
        }
      >();

      comment.reactions.forEach((reaction: any) => {
        if (!reactionMap.has(reaction.emoji)) {
          reactionMap.set(reaction.emoji, {
            count: 0,
            users: [],
            hasReacted: false,
          });
        }

        const reactionData = reactionMap.get(reaction.emoji)!;
        reactionData.count++;
        reactionData.users.push({
          id: reaction.user.id,
          name: reaction.user.name,
        });

        if (reaction.userId === userId) {
          reactionData.hasReacted = true;
        }
      });

      const reactions: CommentReactionData[] = Array.from(
        reactionMap.entries()
      ).map(([emoji, data]) => ({
        emoji,
        ...data,
      }));

      return {
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        author: comment.author,
        mentionedUsers: commentMentionedUsers,
        attachments: comment.attachments,
        reactions,
        isEdited: comment.isEdited,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        editedAt: comment.editedAt,
        parentCommentId: comment.parentCommentId,
      };
    };

    // Process parent comments and their replies
    const processedComments = parentComments.map((comment) => {
      const processedParent = processComment(comment);

      // Process replies
      const processedReplies = comment.replies.map((reply: any) =>
        processComment(reply)
      );

      return {
        ...processedParent,
        replies: processedReplies,
      };
    });

    const hasMore = skip + parentComments.length < totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      comments: processedComments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { success: false, error: "Failed to fetch comments" };
  }
}

/**
 * Updates an existing comment
 */
export async function updateComment(commentId: string, content: string) {
  try {
    const { userId, org } = await getSession();

    // Check if comment exists and user has permission to edit it
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        organizationId: org,
        authorId: userId, // Only author can edit their own comment
        isDeleted: false,
      },
      select: {
        id: true,
        content: true,
        projectId: true,
        issueId: true,
        featureId: true,
        milestoneId: true,
        boardId: true,
      },
    });

    if (!existingComment) {
      return {
        success: false,
        error: "Comment not found or permission denied",
      };
    }

    // Extract mentioned user IDs from new content
    const mentionedUserIds = extractMentionedUserIds(content);

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        mentionedUserIds,
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            url: true,
            thumbnailUrl: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Determine entity type and ID for revalidation
    let entityType: CommentEntityType;
    let entityId: string;

    if (existingComment.projectId) {
      entityType = "project";
      entityId = existingComment.projectId;
    } else if (existingComment.issueId) {
      entityType = "issue";
      entityId = existingComment.issueId;
    } else if (existingComment.featureId) {
      entityType = "feature";
      entityId = existingComment.featureId;
    } else if (existingComment.boardId) {
      entityType = "board";
      entityId = existingComment.boardId;
    } else {
      throw new Error("Comment is not associated with any entity");
    }

    // Revalidate the entity page
    revalidatePath(`/${entityType}/${entityId}`);

    return { success: true, comment: updatedComment };
  } catch (error) {
    console.error("Error updating comment:", error);
    return { success: false, error: "Failed to update comment" };
  }
}

/**
 * Soft deletes a comment (sets isDeleted flag)
 */
export async function deleteComment(commentId: string) {
  try {
    const { userId, org, role } = await getSession();

    // Check if comment exists and user has permission to delete it
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        organizationId: org,
        isDeleted: false,
      },
      select: {
        id: true,
        authorId: true,
        projectId: true,
        issueId: true,
        featureId: true,
        boardId: true,
      },
    });

    if (!existingComment) {
      return { success: false, error: "Comment not found" };
    }

    // Check permissions: author can delete their own comment, admin can delete any comment
    const canDelete =
      existingComment.authorId === userId ||
      role === "admin" ||
      role === "owner";

    if (!canDelete) {
      return { success: false, error: "Permission denied" };
    }

    // Soft delete the comment
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    // Determine entity type and ID for revalidation
    let entityType: CommentEntityType;
    let entityId: string;

    if (existingComment.projectId) {
      entityType = "project";
      entityId = existingComment.projectId;
    } else if (existingComment.issueId) {
      entityType = "issue";
      entityId = existingComment.issueId;
    } else if (existingComment.featureId) {
      entityType = "feature";
      entityId = existingComment.featureId;
    } else if (existingComment.boardId) {
      entityType = "board";
      entityId = existingComment.boardId;
    } else {
      throw new Error("Comment is not associated with any entity");
    }

    // Revalidate the entity page
    revalidatePath(`/${entityType}/${entityId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

/**
 * Gets the appropriate entity where clause for Prisma queries
 */
function getEntityWhere(entityType: CommentEntityType, entityId: string) {
  switch (entityType) {
    case "project":
      return { projectId: entityId };
    case "issue":
      return { issueId: entityId };
    case "feature":
      return { featureId: entityId };
    case "board":
      return { boardId: entityId };
    default:
      throw new Error(`Invalid entity type: ${entityType}`);
  }
}

/**
 * Gets the appropriate entity relation object for Prisma create
 */
function getEntityRelation(entityType: CommentEntityType, entityId: string) {
  switch (entityType) {
    case "project":
      return { projectId: entityId };
    case "issue":
      return { issueId: entityId };
    case "feature":
      return { featureId: entityId };
    case "board":
      return { boardId: entityId };
    default:
      throw new Error(`Invalid entity type: ${entityType}`);
  }
}
