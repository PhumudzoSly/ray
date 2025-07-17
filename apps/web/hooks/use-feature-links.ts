import { useSession } from "@/context/session-context";
import { QueryClient, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeatureLinks, addFeatureLink, deleteFeatureLink } from "@/actions/project/features";

export function useFeatureLinks(featureId: string) {
  const session = useSession();
  const queryClient = useQueryClient();

  // Fetch links
  const { data: linksResult, isPending } = useQuery({
    queryKey: ["featureLinks", featureId],
    queryFn: () => getFeatureLinks(featureId),
    enabled: !!featureId,
  });
  const links = linksResult?.success ? linksResult.data : [];

  // Mutation for creating a link
  const { mutateAsync: createLinkMutation, isPending: isCreating } = useMutation({
    mutationFn: async ({ url, featureId }: { url: string; featureId: string }) => {
      return await addFeatureLink({ featureId, url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureLinks", featureId] });
    },
  });

  // Mutation for deleting a link
  const { mutateAsync: deleteLinkMutation, isPending: isDeleting } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await deleteFeatureLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureLinks", featureId] });
    },
  });

  const createLink = async ({ url, featureId }: { url: string; featureId: string }) => {
    if (!session?.token) return;
    try {
      const result = await createLinkMutation({ url, featureId });
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
