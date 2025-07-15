import React, { useState } from "react";
import {
  MessageCircle,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Reply,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Separator } from "@workspace/ui/components/separator";
import { CommentReactions } from "./comment-reactions";
import { CommentForm } from "./comment-form";
import { toast } from "sonner";

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  reactions: Record<string, any[]>;
  reactionCount: number;
  isEdited: boolean;
  editedAt?: number;
  createdAt: number;
  parentCommentId?: string;
  rootCommentId?: string;
}

interface CommentsThreadProps {
  entityType: "project" | "issue" | "feature" | "asset" | "milestone";
  entityId: string;
  emptyMessage?: string;
}

export const CommentsThread: React.FC<CommentsThreadProps> = ({
  entityType,
  entityId,
  emptyMessage = "No comments yet",
}) => {
  const { token } = useSession();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);

  // Get available reactions
  const { data: availableReactions } = useData(
    api.comments.getAvailableReactions,
    {}
  );

  // Build the query args based on entity type
  const queryArgs = React.useMemo(() => {
    const args: any = { token, limit: 200 };
    switch (entityType) {
      case "project":
        args.projectId = entityId;
        break;
      case "issue":
        args.issueId = entityId;
        break;
      case "feature":
        args.featureId = entityId;
        break;
      case "asset":
        args.assetId = entityId;
        break;
      case "milestone":
        args.milestoneId = entityId;
        break;
    }
    return args;
  }, [token, entityType, entityId]);

  const {
    data: comments,
    isPending,
    refetch,
  } = useData(api.comments.getComments, queryArgs);

  const handleCreateComment = async (
    content: string,
    parentCommentId?: string
  ) => {
    try {
      const mutationArgs: any = { token, content };
      if (parentCommentId) {
        mutationArgs.parentCommentId = parentCommentId;
      }

      switch (entityType) {
        case "project":
          mutationArgs.projectId = entityId;
          break;
        case "issue":
          mutationArgs.issueId = entityId;
          break;
        case "feature":
          mutationArgs.featureId = entityId;
          break;
        case "asset":
          mutationArgs.assetId = entityId;
          break;
        case "milestone":
          mutationArgs.milestoneId = entityId;
          break;
      }

      await api.comments.createComment(mutationArgs);
      refetch();
      setReplyingTo(null);
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error("Error creating comment:", error);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await api.comments.updateComment({ token, commentId, content });
      refetch();
      setEditingComment(null);
      toast.success("Comment updated");
    } catch (error) {
      toast.error("Failed to update comment");
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.comments.deleteComment({ token, commentId });
      refetch();
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error("Error deleting comment:", error);
    }
  };

  const handleAddReaction = async (commentId: string, emoji: string) => {
    try {
      await api.comments.addReaction({ token, commentId, emoji });
      refetch();
    } catch (error) {
      toast.error("Failed to add reaction");
      console.error("Error adding reaction:", error);
    }
  };

  const handleRemoveReaction = async (commentId: string, emoji: string) => {
    try {
      await api.comments.removeReaction({ token, commentId, emoji });
      refetch();
    } catch (error) {
      toast.error("Failed to remove reaction");
      console.error("Error removing reaction:", error);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group comments by root comment for nested display
  const groupedComments = React.useMemo(() => {
    if (!comments) return [];

    const rootComments = comments.filter((c) => !c.parentCommentId);
    const replyComments = comments.filter((c) => c.parentCommentId);

    return rootComments.map((root) => ({
      ...root,
      replies: replyComments.filter(
        (reply) => reply.rootCommentId === root._id
      ),
    }));
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Comments</h3>
        {comments && comments.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {comments.length}
          </Badge>
        )}
      </div>

      {/* Add new comment */}
      <CommentForm
        onSubmit={(content) => handleCreateComment(content)}
        placeholder="Add a comment..."
        submitLabel="Comment"
      />

      {/* Comments list */}
      {groupedComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MessageCircle className="h-8 w-8 mb-3 opacity-50" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={() => setReplyingTo(comment._id)}
              onEdit={() => setEditingComment(comment._id)}
              onDelete={() => handleDeleteComment(comment._id)}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              isEditing={editingComment === comment._id}
              onUpdateEdit={(content) =>
                handleUpdateComment(comment._id, content)
              }
              onCancelEdit={() => setEditingComment(null)}
            />
          ))}
        </div>
      )}

      {/* Reply forms */}
      {replyingTo && (
        <div className="ml-8 border-l-2 border-border pl-4">
          <CommentForm
            onSubmit={(content) => handleCreateComment(content, replyingTo)}
            placeholder="Write a reply..."
            submitLabel="Reply"
            onCancel={() => setReplyingTo(null)}
          />
        </div>
      )}
    </div>
  );
};

interface CommentItemProps {
  comment: Comment & { replies?: Comment[] };
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
  isEditing: boolean;
  onUpdateEdit: (content: string) => void;
  onCancelEdit: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  isEditing,
  onUpdateEdit,
  onCancelEdit,
}) => {
  const { token } = useSession();
  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).userId
    : null;

  const isAuthor = currentUserId === comment.author._id;

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.image} alt={comment.author.name} />
          <AvatarFallback className="text-xs">
            {comment.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-muted/30 rounded-lg p-3">
            {/* Comment header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {comment.author.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                )}
              </div>

              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit3 className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Comment content */}
            {isEditing ? (
              <CommentForm
                initialValue={comment.content}
                onSubmit={onUpdateEdit}
                onCancel={onCancelEdit}
                submitLabel="Update"
                autoFocus
              />
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </div>
            )}

            {/* Reactions */}
            {comment.reactionCount > 0 && (
              <div className="mt-3">
                <CommentReactions
                  reactions={comment.reactions}
                  onAddReaction={(emoji) => onAddReaction(comment._id, emoji)}
                  onRemoveReaction={(emoji) =>
                    onRemoveReaction(comment._id, emoji)
                  }
                  availableReactions={availableReactions}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReply}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            <CommentReactions
              reactions={comment.reactions}
              onAddReaction={(emoji) => onAddReaction(comment._id, emoji)}
              onRemoveReaction={(emoji) => onRemoveReaction(comment._id, emoji)}
              showAddButton
              compact
              availableReactions={availableReactions}
            />
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-3">
          <Separator className="w-px h-full bg-border/60" />
          {comment.replies.map((reply) => (
            <div key={reply._id} className="flex gap-3">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={reply.author.image} alt={reply.author.name} />
                <AvatarFallback className="text-xs">
                  {reply.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="bg-muted/20 rounded-lg p-2">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {reply.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(reply.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                      {reply.isEdited && (
                        <span className="text-xs text-muted-foreground">
                          (edited)
                        </span>
                      )}
                    </div>

                    {currentUserId === reply.author._id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit()}>
                            <Edit3 className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete()}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </div>

                  {reply.reactionCount > 0 && (
                    <div className="mt-2">
                      <CommentReactions
                        reactions={reply.reactions}
                        onAddReaction={(emoji) =>
                          onAddReaction(reply._id, emoji)
                        }
                        onRemoveReaction={(emoji) =>
                          onRemoveReaction(reply._id, emoji)
                        }
                        compact
                        availableReactions={availableReactions}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
