"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react";
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
import type { CommentData } from "@/actions/comments/comment";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

export interface CommentItemProps {
  comment: CommentData;
  currentUser: { id: string };
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, emoji: string) => void;
  className?: string;
}

export function CommentItem({
  comment,
  currentUser,
  onEdit,
  onDelete,
  onReaction,
  className,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [isEmojiOpen, setIsEmojiOpen] = React.useState(false);

  const isAuthor = comment.authorId === currentUser.id;
  const canEdit = isAuthor && onEdit;
  const canDelete = isAuthor && onDelete;

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
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

  const renderMentions = (content: string) => {
    // Highlight mentions using the resolved names from mentionedUsers so we can support spaces
    const names = comment.mentionedUsers?.map((u) => `@${u.name}`) || [];
    if (names.length === 0) return content;

    const pattern = names.map(escapeRegExp).join("|");
    const regex = new RegExp(`(${pattern})`, "g");
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (names.includes(part)) {
        return (
          <span
            key={index}
            className="text-blue-500 mr-1 hover:text-primary/90 font-medium cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div className={cn("flex gap-3 py-4", className)}>
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
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {renderMentions(comment.displayContent)}
          </div>
        )}

        {/* Attachments */}
        {comment.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {comment.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm"
              >
                <span className="text-foreground">
                  {attachment.originalName}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(attachment.fileSize / 1024)} KB)
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
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
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-2 w-56">
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReaction?.(comment.id, emoji);
                      setIsEmojiOpen(false);
                    }}
                    className="h-8 w-8 flex items-center justify-center rounded border hover:bg-accent"
                    aria-label={`React with ${emoji}`}
                  >
                    <span className="text-lg">{emoji}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

// Static content
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
