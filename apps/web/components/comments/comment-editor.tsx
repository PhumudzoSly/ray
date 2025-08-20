"use client";

import * as React from "react";
import { CommentInput, OrganizationMember, UploadedCommentFile } from "./comment-input";
// import type { OrganizationMember } from "@/actions/comments/users";

export interface CommentEditorProps {
  onSubmit: (content: string, attachments: UploadedCommentFile[]) => void;
  organizationMembers: OrganizationMember[];
  placeholder?: string;
  initialContent?: string;
  isEditing?: boolean;
  maxAttachments?: number;
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
}

export function CommentEditor({
  onSubmit,
  organizationMembers,
  placeholder = "Write a comment...",
  initialContent = "",
  isEditing = false,
  maxAttachments = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className,
}: CommentEditorProps) {
  const [content, setContent] = React.useState(initialContent);

  const handleSubmit = (content: string, attachments: UploadedCommentFile[]) => {
    onSubmit(content, attachments);
    setContent(""); // Clear content after submission
  };

  return (
    <CommentInput
      onSubmit={handleSubmit}
      organizationMembers={organizationMembers}
      placeholder={placeholder}
      initialContent={initialContent}
      isEditing={isEditing}
      maxAttachments={maxAttachments}
      maxFileSize={maxFileSize}
      disabled={disabled}
      className={className}
      value={content}
      onChange={setContent}
    />
  );
}
