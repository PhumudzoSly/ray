"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "@/actions/account/user";

export interface CreateCommentAttachmentData {
  commentId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  originalName: string;
}

/**
 * Creates a comment attachment record
 * Note: This is a placeholder implementation. In a real app, you'd integrate with
 * your file upload service (UploadThing, S3, etc.)
 */
export async function createCommentAttachment(
  data: CreateCommentAttachmentData
) {
  try {
    const { userId, org } = await getSession();

    // Verify the comment exists and user has access
    const comment = await prisma.comment.findFirst({
      where: {
        id: data.commentId,
        organizationId: org,
      },
      select: { id: true },
    });

    if (!comment) {
      return { success: false, error: "Comment not found or access denied" };
    }

    const attachment = await prisma.commentAttachment.create({
      data: {
        commentId: data.commentId,
        fileName: data.fileName,
        originalName: data.originalName,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        url: data.url,
        organizationId: org,
        uploadedById: userId,
      },
    });

    return { success: true, attachment };
  } catch (error) {
    console.error("Error creating comment attachment:", error);
    return { success: false, error: "Failed to create attachment" };
  }
}

/**
 * Deletes a comment attachment
 */
export async function deleteCommentAttachment(attachmentId: string) {
  try {
    const { userId, org } = await getSession();

    // Verify the attachment exists and user has permission
    const attachment = await prisma.commentAttachment.findFirst({
      where: {
        id: attachmentId,
        organizationId: org,
        uploadedById: userId, // Only uploader can delete
      },
    });

    if (!attachment) {
      return {
        success: false,
        error: "Attachment not found or permission denied",
      };
    }

    await prisma.commentAttachment.delete({
      where: { id: attachmentId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment attachment:", error);
    return { success: false, error: "Failed to delete attachment" };
  }
}
