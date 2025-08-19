import { prisma } from "../prisma/prisma";
import type { Document } from "../prisma/generated/client/client";
import { Prisma } from "../prisma/generated/client/client";

export interface CreateDocumentInput {
  title: string;
  content: any; // JSON content from Tiptap
  organizationId: string;
  projectId?: string;
  issueId?: string;
  featureId?: string;
  milestoneId?: string;
  createdById: string;
  isPublic?: boolean;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: any; // JSON content from Tiptap
  lastEditedById: string;
  isPublic?: boolean;
}

export interface DocumentFilters {
  organizationId: string;
  projectId?: string;
  issueId?: string;
  featureId?: string;
  milestoneId?: string;
  createdById?: string;
  isPublic?: boolean;
}

export class DocumentService {
  /**
   * Create a new document
   */
  static async createDocument(input: CreateDocumentInput): Promise<Document> {
    try {
      const document = await prisma.document.create({
        data: {
          title: input.title,
          content: input.content,
          organizationId: input.organizationId,
          projectId: input.projectId,
          issueId: input.issueId,
          featureId: input.featureId,
          milestoneId: input.milestoneId,
          createdById: input.createdById,
          lastEditedById: input.createdById,
          isPublic: input.isPublic ?? false,
        },
        include: {
          organization: true,
          project: true,
          issue: true,
          feature: true,
          milestone: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          lastEditedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return document;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("A document with this configuration already exists");
        }
        if (error.code === "P2003") {
          throw new Error("Invalid reference to organization, project, issue, feature, or milestone");
        }
      }
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get a document by ID
   */
  static async getDocumentById(id: string, organizationId: string): Promise<Document | null> {
    try {
      const document = await prisma.document.findFirst({
        where: {
          id,
          organizationId,
        },
        include: {
          organization: true,
          project: true,
          issue: true,
          feature: true,
          milestone: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          lastEditedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return document;
    } catch (error) {
      throw new Error(`Failed to get document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Update a document
   */
  static async updateDocument(id: string, organizationId: string, input: UpdateDocumentInput): Promise<Document> {
    try {
      const document = await prisma.document.update({
        where: {
          id,
          organizationId,
        },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.content && { content: input.content }),
          lastEditedById: input.lastEditedById,
          ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
          version: {
            increment: 1,
          },
        },
        include: {
          organization: true,
          project: true,
          issue: true,
          feature: true,
          milestone: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          lastEditedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return document;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Document not found or you don't have permission to update it");
        }
      }
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string, organizationId: string): Promise<void> {
    try {
      await prisma.document.delete({
        where: {
          id,
          organizationId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Document not found or you don't have permission to delete it");
        }
      }
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * List documents with filters
   */
  static async listDocuments(
    filters: DocumentFilters,
    options: {
      page?: number;
      limit?: number;
      orderBy?: "createdAt" | "updatedAt" | "title";
      orderDirection?: "asc" | "desc";
    } = {}
  ): Promise<{ documents: Document[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, orderBy = "updatedAt", orderDirection = "desc" } = options;
    const skip = (page - 1) * limit;

    try {
      const where: Prisma.DocumentWhereInput = {
        organizationId: filters.organizationId,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.issueId && { issueId: filters.issueId }),
        ...(filters.featureId && { featureId: filters.featureId }),
        ...(filters.milestoneId && { milestoneId: filters.milestoneId }),
        ...(filters.createdById && { createdById: filters.createdById }),
        ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),
      };

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          include: {
            organization: true,
            project: true,
            issue: true,
            feature: true,
            milestone: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            lastEditedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            [orderBy]: orderDirection,
          },
          skip,
          take: limit,
        }),
        prisma.document.count({ where }),
      ]);

      return {
        documents,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Failed to list documents: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get document by project and generate ID if needed
   */
  static async getOrCreateProjectDocument(
    projectId: string,
    organizationId: string,
    createdById: string,
    title: string = "Project Documentation"
  ): Promise<Document> {
    try {
      // Try to find existing document for this project
      let document = await prisma.document.findFirst({
        where: {
          projectId,
          organizationId,
          title,
        },
        include: {
          organization: true,
          project: true,
          issue: true,
          feature: true,
          milestone: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          lastEditedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // If no document exists, create one
      if (!document) {
        document = await this.createDocument({
          title,
          content: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: title }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "Start writing your project documentation here..." }],
              },
            ],
          },
          organizationId,
          projectId,
          createdById,
          isPublic: false,
        });
      }

      return document;
    } catch (error) {
      throw new Error(`Failed to get or create project document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}