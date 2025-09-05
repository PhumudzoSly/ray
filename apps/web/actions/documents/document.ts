"use server";

import { DocumentOptionalDefaults, prisma } from "@workspace/backend";
import { revalidatePath } from "next/cache";

type DocumentEntityType =
  | "project"
  | "issue"
  | "feature"
  | "milestone"
  | "competitor"
  | "competitorSwot"
  | "competitiveMove"
  | "roadmapItem"
  | "actionItem";

/**
 * Get document content by entity type and id.
 */
export async function getEntityDocumentContent({
  entityType,
  entityId,
}: {
  entityType: DocumentEntityType;
  entityId: string;
}): Promise<
  { success: true; document: any } | { success: false; error: string }
> {
  if (!entityType || !entityId)
    return { success: false, error: "Missing entity reference" };

  try {
    // Build unique where selector based on entity type
    const where =
      entityType === "project"
        ? { projectId: entityId }
        : entityType === "issue"
          ? { issueId: entityId }
          : entityType === "feature"
            ? { featureId: entityId }
            : entityType === "milestone"
              ? { milestoneId: entityId }
              : entityType === "competitor"
                ? { competitorId: entityId }
                : entityType === "competitorSwot"
                  ? { competitorSwotId: entityId }
                  : entityType === "roadmapItem"
                    ? { roadmapItemId: entityId }
                    : entityType === "competitiveMove"
                      ? { competitiveMoveId: entityId }
                      : entityType === "actionItem"
                        ? { actionItemId: entityId }
                        : { roadmapItemId: entityId };

    const document = await prisma.document.findFirst({
      where,
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    return { success: true, document };
  } catch (error) {
    console.error("Failed to get entity document content:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get entity document content",
    };
  }
}

/**
 * Save document content by entity type and id. Creates the document if it does not exist yet.
 * Uses the unique relation fields (projectId, issueId, featureId, milestoneId) on Document.
 */
export async function saveEntityDocumentContent({
  entityType,
  entityId,
  content,
}: {
  entityType: DocumentEntityType;
  entityId: string;
  content: any;
}): Promise<
  { success: true; document: any } | { success: false; error: string }
> {
  if (!entityType || !entityId)
    return { success: false, error: "Missing entity reference" };

  try {
    // Build unique where selector based on entity type
    const where =
      entityType === "project"
        ? { projectId: entityId }
        : entityType === "issue"
          ? { issueId: entityId }
          : entityType === "feature"
            ? { featureId: entityId }
            : entityType === "milestone"
              ? { milestoneId: entityId }
              : entityType === "competitor"
                ? { competitorId: entityId }
                : entityType === "competitorSwot"
                  ? { competitorSwotId: entityId }
                  : entityType === "roadmapItem"
                    ? { roadmapItemId: entityId }
                    : entityType === "competitiveMove"
                      ? { competitiveMoveId: entityId }
                      : entityType === "actionItem"
                        ? { actionItemId: entityId }
                        : { roadmapItemId: entityId };

    // First, try to find existing document
    const existingDocument = await prisma.document.findFirst({ where });

    let document;

    if (existingDocument) {
      // Update existing document
      document = await prisma.document.update({
        where: { id: existingDocument.id },
        data: {
          content,
          version: existingDocument.version + 1,
        },
      });
    } else {
      // Create new document
      const createData = {
        content,
        version: 1,
        ...(entityType === "project"
          ? { projectId: entityId }
          : entityType === "issue"
            ? { issueId: entityId }
            : entityType === "feature"
              ? { featureId: entityId }
              : entityType === "milestone"
                ? { milestoneId: entityId }
                : entityType === "competitor"
                  ? { competitorId: entityId }
                  : entityType === "competitorSwot"
                    ? { competitorSwotId: entityId }
                    : entityType === "roadmapItem"
                      ? { roadmapItemId: entityId }
                      : entityType === "competitiveMove"
                        ? { competitiveMoveId: entityId }
                        : entityType === "actionItem"
                          ? { actionItemId: entityId }
                          : { roadmapItemId: entityId }),
      };

      document = await prisma.document.create({
        data: createData,
      });
    }

    return { success: true, document };
  } catch (error) {
    console.error("Failed to save entity document content:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save entity document content",
    };
  }
}
