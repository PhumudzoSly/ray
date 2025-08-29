"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { resolveCommentContent } from "@/lib/comments/mentions";
import { useSession } from "@/context/session-context";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
  Reply,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import type { CommentData } from "@/types/comments";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  CommentInput,
  type OrganizationMember,
  type UploadedCommentFile,
} from "./comment-input";

export interface CommentItemProps {
  comment: CommentData;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, emoji: string) => void;
  onReply?: (
    content: string,
    attachments: UploadedCommentFile[],
    parentCommentId?: string
  ) => void;
  organizationMembers?: OrganizationMember[];
  className?: string;
}

export function CommentItem({
  comment,
  onEdit,
  onDelete,
  onReaction,
  onReply,
  organizationMembers = [],
  className,
}: CommentItemProps) {
  const session = useSession();

  // Create currentUser object from session context
  const currentUser = {
    id: session.userId,
    name: session.name,
  };
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [isEmojiOpen, setIsEmojiOpen] = React.useState(false);
  const [isReplying, setIsReplying] = React.useState(false);

  const isAuthor = comment.authorId === currentUser.id;
  const canEdit = isAuthor && onEdit;
  const canDelete = isAuthor && onDelete;
  const canReply = !comment.parentCommentId && onReply; // Only allow replies to top-level comments

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleDelete = () => {
    if (
      onDelete &&
      window.confirm("Are you sure you want to delete this comment?")
    ) {
      onDelete(comment.id);
    }
  };

  const handleReply = () => {
    setIsReplying(true);
  };

  const handleReplySubmit = async (
    content: string,
    attachments: UploadedCommentFile[]
  ) => {
    if (onReply) {
      await onReply(content, attachments, comment.id);
      setIsReplying(false);
    }
  };

  const handleReplyCancel = () => {
    setIsReplying(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Function to render mentions in comment content
  const renderMentions = (content: string) => {
    if (!comment.mentionedUsers || comment.mentionedUsers.length === 0) {
      return content;
    }

    // Use the resolveCommentContent utility to replace user:{id} with @UserName
    const resolvedContent = resolveCommentContent(
      content,
      comment.mentionedUsers
    );

    // Split content by @mentions and render with proper styling
    const mentionPattern = new RegExp(
      `(@(${comment.mentionedUsers.map((u) => escapeRegExp(u.name)).join("|")}))`,
      "g"
    );
    const parts = resolvedContent.split(mentionPattern);

    const userNames = new Set(comment.mentionedUsers.map((u) => u.name));

    return parts
      .filter((part) => part !== undefined && !userNames.has(part))
      .map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={index}
            className="text-blue-600 font-medium bg-blue-50 px-1 rounded"
          >
            {part}
          </span>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const EMOJI_OPTIONS = [
    "👍",
    "❤️",
    "🎉",
    "🚀",
    "👏",
    "🔥",
    "😄",
    "🙌",
    "👀",
    "😕",
    "💯",
    "✅",
    "❌",
    "⭐",
    "🧠",
    "📝",
  ];

  function formatFileSize(bytes: number) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  return (
    <div
      className={cn("flex gap-3 py-4 transition-all duration-200", className)}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage
          src={comment?.author?.image || undefined}
          alt={comment?.author?.name}
        />
        <AvatarFallback className="text-xs">
          {getInitials(comment?.author?.name || "")}
        </AvatarFallback>
      </Avatar>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">
            {comment?.author?.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-muted-foreground/70 italic">
              (edited{" "}
              {comment.editedAt ? formatTimestamp(comment.editedAt) : ""})
            </span>
          )}

          {/* Actions Menu */}
          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Comment options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment Body */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 text-sm border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={editContent.trim() === comment.content}
              >
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {renderMentions(comment.content)}
          </div>
        )}

        {/* Attachments */}
        {comment.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {comment.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-primary hover:underline"
                    title={attachment.originalName}
                  >
                    {attachment.originalName}
                  </a>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    ({formatFileSize(attachment.fileSize)} ·{" "}
                    {attachment.mimeType})
                  </span>
                </div>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Open attachment"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Reactions and Actions */}
        <div className="flex items-center gap-1 mt-2">
          {comment.reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => onReaction?.(comment.id, reaction.emoji)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors",
                reaction.hasReacted
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </button>
          ))}

          <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border bg-muted border-border text-muted-foreground hover:bg-muted/80"
                aria-label="Add reaction"
              >
                <Plus className="h-3 w-3" />
                React
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" align="start">
              <div className="grid grid-cols-6 gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    className="px-1 py-0.5 text-sm hover:bg-muted rounded"
                    onClick={() => {
                      onReaction?.(comment.id, emoji);
                      setIsEmojiOpen(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reply Button - Only show for top-level comments */}
          {canReply && (
            <button
              onClick={handleReply}
              className="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200"
              aria-label="Reply to comment"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          )}
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-3 pl-4 border-l-2 border-muted">
            <CommentInput
              onSubmit={handleReplySubmit}
              organizationMembers={organizationMembers}
              placeholder={`Reply to ${comment.author?.name}...`}
              className="mb-2"
            />
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="outline" onClick={handleReplyCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-6 space-y-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="relative">
                  <div className="absolute -left-6 top-4 w-4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <CommentItem
                    comment={reply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReaction={onReaction}
                    organizationMembers={organizationMembers}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
