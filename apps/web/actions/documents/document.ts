"use server";

import { prisma } from "@workspace/backend";
import { revalidatePath } from "next/cache";

export interface DocumentData {
  id: string;
  content: any;
  version: number;
  projectId?: string;
  issueId?: string;
  featureId?: string;
  milestoneId?: string;
}

export async function createDocument({
  content,
  projectId,
  issueId,
  featureId,
  milestoneId,
}: {
  content: any;
  projectId?: string;
  issueId?: string;
  featureId?: string;
  milestoneId?: string;
}) {
  try {
    const document = await prisma.document.create({
      data: {
        content,
        projectId,
        issueId,
        featureId,
        milestoneId,
      },
    });

    revalidatePath("/documents");
    return { success: true, document };
  } catch (error) {
    console.error("Failed to create document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create document",
    };
  }
}

export async function getDocument(documentId: string) {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    return { success: true, document };
  } catch (error) {
    console.error("Failed to get document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get document",
    };
  }
}

export async function updateDocument({
  documentId,
  content,
}: {
  documentId: string;
  content?: any;
}) {
  try {
    // First check if document exists
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      return { success: false, error: "Document not found" };
    }

    const updateData: any = {};

    if (content !== undefined) {
      updateData.content = content;
      updateData.version = existingDocument.version + 1;
    }

    const document = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: updateData,
    });

    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);
    return { success: true, document };
  } catch (error) {
    console.error("Failed to update document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update document",
    };
  }
}

export async function deleteDocument(documentId: string) {
  try {
    // Check if document exists
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      return { success: false, error: "Document not found" };
    }

    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}

export async function listDocuments({
  projectId,
  issueId,
  featureId,
  milestoneId,
  limit = 50,
  offset = 0,
}: {
  projectId?: string;
  issueId?: string;
  featureId?: string;
  milestoneId?: string;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (issueId) where.issueId = issueId;
    if (featureId) where.featureId = featureId;
    if (milestoneId) where.milestoneId = milestoneId;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        take: limit,
        skip: offset,
      }),
      prisma.document.count({ where }),
    ]);

    return { success: true, documents, total };
  } catch (error) {
    console.error("Failed to list documents:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to list documents",
    };
  }
}

export async function saveDocumentContent({
  documentId,
  content,
}: {
  documentId: string;
  content: any;
}): Promise<
  { success: true; document: any } | { success: false; error: string }
> {
  try {
    // Check if document exists
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      return { success: false, error: "Document not found" };
    }

    const document = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        content,
        version: existingDocument.version + 1,
      },
    });

    return { success: true, document };
  } catch (error) {
    console.error("Failed to save document content:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save document content",
    };
  }
}

export type DocumentEntityType = "project" | "issue" | "feature" | "milestone";

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
            : { milestoneId: entityId };

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
            : { milestoneId: entityId };

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
              : { milestoneId: entityId }),
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
