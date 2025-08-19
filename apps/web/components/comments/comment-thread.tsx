"use client";

import * as React from "react";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { CommentItem } from "./comment-item";
import { CommentEditor } from "./comment-editor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  getEntityComments,
  updateComment,
  deleteComment,
  type CommentEntityType,
  type CommentData,
} from "@/actions/comments/comment";
import {
  getOrganizationMembers,
  type OrganizationMember,
} from "@/actions/comments/users";
import { uploadFiles } from "@/lib/uploadthing";
import { createCommentAttachment } from "@/actions/comments/attachments";

export interface CommentThreadProps {
  entityType: CommentEntityType;
  entityId: string;
  organizationId: string;
  currentUser: {
    id: string;
    name: string;
    image?: string;
  };
  className?: string;
}

export function CommentThread({
  entityType,
  entityId,
  organizationId,
  currentUser,
  className,
}: CommentThreadProps) {
  const [allComments, setAllComments] = React.useState<CommentData[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const queryClient = useQueryClient();

  // Query for comments
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    error: commentsError,
    isFetching,
  } = useQuery({
    queryKey: ["comments", entityType, entityId, currentPage],
    queryFn: () => getEntityComments(entityType, entityId, currentPage),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Query for organization members
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["organization-members"],
    queryFn: () => getOrganizationMembers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update comments when data changes
  React.useEffect(() => {
    if (commentsData?.success) {
      if (currentPage === 1) {
        // First page - replace all comments
        setAllComments((commentsData.comments || []) as CommentData[]);
      } else {
        // Subsequent pages - append comments
        setAllComments((prev) => [
          ...prev,
          ...((commentsData.comments || []) as CommentData[]),
        ]);
      }
    }
  }, [commentsData, currentPage]);

  // Reset to first page when entity changes
  React.useEffect(() => {
    setCurrentPage(1);
    setAllComments([]);
  }, [entityType, entityId]);

  const organizationMembers =
    membersData?.success && membersData.members ? membersData.members : [];
  const hasMore = commentsData?.success
    ? commentsData.pagination?.hasMore
    : false;
  const totalCount = commentsData?.success
    ? (commentsData.pagination?.totalCount ?? 0)
    : 0;
  const isLoading = isLoadingComments || isLoadingMembers;
  const error =
    commentsError ||
    (commentsData?.success === false ? commentsData.error : null);

  // Mutations for comment operations
  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      // Reset to first page and invalidate queries
      setCurrentPage(1);
      setAllComments([]);
      queryClient.invalidateQueries({
        queryKey: ["comments", entityType, entityId],
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => updateComment(commentId, content),
    onSuccess: () => {
      // Reset to first page and invalidate queries
      setCurrentPage(1);
      setAllComments([]);
      queryClient.invalidateQueries({
        queryKey: ["comments", entityType, entityId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      // Reset to first page and invalidate queries
      setCurrentPage(1);
      setAllComments([]);
      queryClient.invalidateQueries({
        queryKey: ["comments", entityType, entityId],
      });
    },
  });

  // Handle new comment submission
  const handleSubmitComment = async (content: string, attachments: File[]) => {
    setUploadError(null);
    // Early exit if nothing to post
    if (!content && attachments.length === 0) return;

    try {
      setIsUploading(attachments.length > 0);

      // 1) Upload files first to ensure file integrity
      const uploaded = attachments.length
        ? await uploadFiles("fileUpload", { files: attachments })
        : [];

      // If any file missing url, treat as failure
      const invalid = uploaded.find((u) => !u.url);
      if (invalid) {
        setUploadError("One or more files failed to upload. Please try again.");
        setIsUploading(false);
        return;
      }

      // 2) Create the comment
      const created = await createCommentMutation.mutateAsync({
        content,
        entityType,
        entityId,
        attachmentIds: [],
      });

      if (!created?.success || !created.comment?.id) {
        setUploadError("Failed to create comment. Please try again.");
        setIsUploading(false);
        return;
      }

      // 3) Persist attachment metadata linked to the comment
      if (uploaded.length) {
        const commentId = created.comment.id as string;
        const results = await Promise.all(
          uploaded.map((file) =>
            createCommentAttachment({
              commentId,
              url: file.url,
              fileName: (file as any).key ?? file.name,
              originalName: file.name,
              mimeType: file.type,
              fileSize: file.size,
            })
          )
        );

        const someFailed = results.some((r) => !r?.success);
        if (someFailed) setUploadError("Some attachments could not be saved.");

        // Ensure comments refetch to include attachments just saved
        queryClient.invalidateQueries({
          queryKey: ["comments", entityType, entityId],
        });
      }
    } catch (e) {
      console.error("Error submitting comment with attachments", e);
      setUploadError("Unexpected error while uploading files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle comment edit
  const handleEditComment = async (commentId: string, content: string) => {
    updateCommentMutation.mutate({ commentId, content });
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  // Handle reaction
  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      // Import reaction actions dynamically to avoid circular dependencies
      const { addCommentReaction, removeCommentReaction } = await import(
        "@/actions/comments/reactions"
      );

      // Find the comment and check if user has already reacted
      const comment = allComments.find((c) => c.id === commentId);
      const reaction = comment?.reactions.find((r) => r.emoji === emoji);
      const hasReacted = reaction?.hasReacted || false;

      if (hasReacted) {
        await removeCommentReaction(commentId, emoji);
      } else {
        await addCommentReaction(commentId, emoji);
      }

      // Invalidate and refetch comments to get updated reactions
      queryClient.invalidateQueries({
        queryKey: ["comments", entityType, entityId],
      });
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  // Load more comments
  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading && allComments.length === 0) {
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
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.toString()}</AlertDescription>
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
        disabled={createCommentMutation.isPending || isUploading}
        placeholder={`Add a comment to this ${entityType}...`}
      />

      {/* Comments List */}
      {allComments.length > 0 ? (
        <div className="space-y-0">
          <Separator />
          <div className="divide-y divide-gray-100">
            {allComments.map((comment, index) => (
              <div key={comment.id} className={cn(index === 0 && "pt-0")}>
                <CommentItem
                  comment={comment}
                  currentUser={currentUser}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onReaction={handleReaction}
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
                disabled={isFetching}
              >
                {isFetching ? (
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
