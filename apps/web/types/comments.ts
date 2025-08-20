export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface ResolvedUser {
  id: string;
  name: string;
  image?: string | null;
}

export type CommentEntityType = "project" | "issue" | "feature" | "board";

export interface CreateCommentData {
  content: string;
  entityType: CommentEntityType;
  entityId: string;
  attachmentIds?: string[];
  parentCommentId?: string;
}

export interface CommentData {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  mentionedUsers: ResolvedUser[];
  attachments: CommentAttachmentData[];
  reactions: CommentReactionData[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
  parentCommentId: string | null;
  replies?: CommentData[];
}

export interface CommentAttachmentData {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

export interface CommentReactionData {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users: {
    id: string;
    name: string;
  }[];
}
