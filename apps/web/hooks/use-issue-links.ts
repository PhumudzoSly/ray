import { useSession } from "@/context/session-context";
import { QueryClient, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLinks, addLink, deleteLink } from "@/actions/issue";

export function useIssueLinks(issueId: string) {
  const session = useSession();
  const queryClient = useQueryClient();

  // Fetch links
  const { data: linksResult, isPending } = useQuery({
    queryKey: ["issueLinks", issueId],
    queryFn: () => getLinks(issueId),
    enabled: !!issueId,
  });
  const links = linksResult?.success ? linksResult.data : [];

  // Mutation for creating a link
  const { mutateAsync: createLinkMutation, isPending: isCreating } = useMutation({
    mutationFn: async ({ url, issueId }: { url: string; issueId: string }) => {
      return await addLink({ issueId, url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issueLinks", issueId] });
    },
  });

  // Mutation for deleting a link
  const { mutateAsync: deleteLinkMutation, isPending: isDeleting } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await deleteLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issueLinks", issueId] });
    },
  });

  const createLink = async ({ url, issueId }: { url: string; issueId: string }) => {
    if (!session?.token) return;
    try {
      const result = await createLinkMutation({ url, issueId });
      return { success: true, data: result };
    } catch (error) {
      console.error("Error creating link:", error);
      return { success: false, error };
    }
  };

  const deleteLinkFn = async ({ id }: { id: string }) => {
    if (!session?.token) return;
    try {
      await deleteLinkMutation({ id });
      return { success: true };
    } catch (error) {
      console.error("Error deleting link:", error);
      return { success: false, error };
    }
  };

  return {
    links: links || [],
    isLoading: isPending,
    createLink,
    isCreating,
    deleteLink: deleteLinkFn,
    isDeleting,
  };
}
