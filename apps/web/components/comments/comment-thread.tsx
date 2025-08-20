"use client";

import * as React from "react";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { CommentItem } from "./comment-item";
import { CommentEditor } from "./comment-editor";
import { useComments } from "@/hooks/use-comments";
import type { CommentEntityType } from "@/types/comments";
import type { UploadedCommentFile } from "./comment-input";

export interface CommentThreadProps {
  entityType: CommentEntityType;
  entityId: string;
  className?: string;
}

export function CommentThread({
  entityType,
  entityId,
  className,
}: CommentThreadProps) {
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Use the optimistic comments hook
  const {
    comments,
    pagination,
    isLoading,
    isError,
    error,
    organizationMembers,
    createComment,
    updateComment,
    deleteComment,
    toggleReaction,
    loadMore,
    isCreating,
    isUpdating,
    isDeleting,
    isReacting,
    isLoadingMore,
    hasMore,
    refetch,
  } = useComments({
    entityType,
    entityId,
  });

  // hasMore is already available from useComments hook
  const totalCount = pagination?.totalCount ?? 0;

  // Handle new comment submission with pre-uploaded attachments
  const handleSubmitComment = async (
    content: string,
    attachments: UploadedCommentFile[],
    parentCommentId?: string
  ) => {
    setUploadError(null);
    const uploaded = attachments.filter((a) => a && a.url && a.key);

    if (!content && uploaded.length === 0) return;

    try {
      // Use optimistic mutation for comment creation
      await createComment({
        content,
        attachments: uploaded,
        parentCommentId,
      });
    } catch (e) {
      console.error("Error submitting comment with attachments", e);
      setUploadError(
        "Unexpected error while saving comment. Please try again."
      );
    }
  };

  // Handle comment edit
  const handleEditComment = (commentId: string, content: string) => {
    updateComment({ commentId, content });
  };

  // Handle comment deletion
  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  };

  // Handle reaction with optimistic updates
  const handleReaction = (commentId: string, emoji: string) => {
    toggleReaction({ commentId, emoji });
  };

  // Load more comments
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadMore();
    }
  };

  if (isLoading && comments.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3 w-3" />
          <h3 className="font-medium">Comments</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-3 w-3" />
        <h3 className="font-medium text-sm">
          Comments{" "}
          {totalCount > 0 && (
            <span className="text-gray-500">({totalCount})</span>
          )}
        </h3>
      </div>

      {/* Error Alert */}
      {(isError || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.toString() || "An error occurred"}
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Comment Editor */}
      <CommentEditor
        onSubmit={handleSubmitComment}
        organizationMembers={organizationMembers}
        disabled={false}
        placeholder={`Add a comment to this ${entityType}...`}
      />

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-0">
          <Separator />
          <div className="divide-y divide-gray-100">
            {comments.map((comment, index) => (
              <div key={comment.id} className={cn(index === 0 && "pt-0")}>
                <CommentItem
                  comment={comment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onReaction={handleReaction}
                  onReply={handleSubmitComment}
                  organizationMembers={organizationMembers}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          No comments yet. Be the first to comment.
        </div>
      )}
    </div>
  );
}
