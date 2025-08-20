"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createComment,
  getEntityComments,
  updateComment,
  deleteComment,
} from "@/actions/comments/comment";
import {
  addCommentReaction,
  removeCommentReaction,
} from "@/actions/comments/reactions";
import { createCommentAttachment } from "@/actions/comments/attachments";
import { getOrganizationMembers } from "@/actions/comments/users";
import type {
  CommentEntityType,
  CommentData,
  OrganizationMember,
} from "@/types/comments";
import type { UploadedCommentFile } from "@/components/comments/comment-input";

export interface UseCommentsOptions {
  entityType: CommentEntityType;
  entityId: string;
  enabled?: boolean;
}

export interface CreateCommentOptions {
  content: string;
  attachments?: UploadedCommentFile[];
  parentCommentId?: string;
}

export interface UpdateCommentOptions {
  commentId: string;
  content: string;
}

export interface ReactionOptions {
  commentId: string;
  emoji: string;
}

export function useComments({
  entityType,
  entityId,
  enabled = true,
}: UseCommentsOptions) {
  const queryClient = useQueryClient();
  const queryKey = ["comments", entityType, entityId] as const;
  const membersQueryKey = ["organization-members"] as const;

  // Query for comments with pagination
  const commentsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getEntityComments(entityType, entityId, 1);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch comments");
      }
      return result;
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for organization members
  const membersQuery = useQuery({
    queryKey: membersQueryKey,
    queryFn: async () => {
      const result = await getOrganizationMembers();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch organization members");
      }
      return result;
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Load more comments mutation
  const loadMoreMutation = useMutation({
    mutationFn: async () => {
      const currentData = queryClient.getQueryData(queryKey) as any;
      if (!currentData?.pagination?.hasMore) {
        throw new Error("No more comments to load");
      }

      const nextPage = currentData.pagination.page + 1;
      const result = await getEntityComments(entityType, entityId, nextPage);
      if (!result.success) {
        throw new Error(result.error || "Failed to load more comments");
      }
      return result;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.success || !newData?.success) return old;

        return {
          ...old,
          comments: [...(old.comments || []), ...(newData.comments || [])],
          pagination: newData.pagination,
        };
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to load more comments");
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (options: CreateCommentOptions) => {
      const { content, attachments = [], parentCommentId } = options;

      // Create the comment first
      const result = await createComment({
        content,
        entityType,
        entityId,
        attachmentIds: [],
        parentCommentId,
      });

      if (!result.success || !result.comment) {
        throw new Error(result.error || "Failed to create comment");
      }

      // Handle attachments if any
      if (attachments.length > 0) {
        const commentId = result.comment.id;
        const uploadedAttachments = attachments.filter(
          (a) => a && a.url && a.key
        );

        if (uploadedAttachments.length > 0) {
          const attachmentResults = await Promise.all(
            uploadedAttachments.map((file) =>
              createCommentAttachment({
                commentId,
                url: file.url,
                fileName: file.key ?? file.name,
                originalName: file.name,
                mimeType: file.type,
                fileSize: file.size,
              })
            )
          );

          const failedAttachments = attachmentResults.filter(
            (r) => !r?.success
          );
          if (failedAttachments.length > 0) {
            toast.error("Some attachments could not be saved");
          }
        }
      }

      return result;
    },
    onSuccess: () => {
      // Refetch comments after successful creation
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create comment");
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: UpdateCommentOptions) => {
      const result = await updateComment(commentId, content);
      if (!result.success) {
        throw new Error(result.error || "Failed to update comment");
      }
      return result;
    },
    onSuccess: () => {
      // Refetch comments after successful update
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const result = await deleteComment(commentId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete comment");
      }
      return result;
    },
    onSuccess: () => {
      // Refetch comments after successful deletion
      queryClient.invalidateQueries({ queryKey });
      toast.success("Comment deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  // Reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async ({ commentId, emoji }: ReactionOptions) => {
      // Check if user already reacted with this emoji
      const currentData = queryClient.getQueryData(queryKey) as any;
      let hasReacted = false;
      
      // Search through all comments and their replies to find the reaction
      const findReactionInComments = (comments: any[]): boolean => {
        for (const comment of comments) {
          if (comment.id === commentId) {
            const reaction = comment.reactions?.find((r: any) => r.emoji === emoji);
            return reaction?.hasReacted || false;
          }
          // Check replies recursively
          if (comment.replies && comment.replies.length > 0) {
            const foundInReplies = findReactionInComments(comment.replies);
            if (foundInReplies !== undefined) return foundInReplies;
          }
        }
        return false;
      };
      
      if (currentData?.comments) {
        hasReacted = findReactionInComments(currentData.comments);
      }
      
      let result;
      if (hasReacted) {
        // Remove reaction if user already reacted
        result = await removeCommentReaction(commentId, emoji);
      } else {
        // Add reaction if user hasn't reacted
        result = await addCommentReaction(commentId, emoji);
      }
      
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle reaction");
      }
      return result;
    },
    onSuccess: () => {
      // Refetch comments after successful reaction toggle
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle reaction");
    },
  });

  return {
    // Query data
    comments: (commentsQuery.data?.comments as CommentData[]) || [],
    pagination: commentsQuery.data?.pagination,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    organizationMembers:
      (membersQuery.data?.members as OrganizationMember[]) || [],

    // Mutations
    createComment: createCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    toggleReaction: reactionMutation.mutate,
    loadMore: loadMoreMutation.mutate,

    // Mutation states
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isReacting: reactionMutation.isPending,
    isLoadingMore: loadMoreMutation.isPending,

    // Computed properties
    hasMore: commentsQuery.data?.pagination?.hasMore || false,

    // Refetch function
    refetch: commentsQuery.refetch,
  };
}
