import { useSession } from "@/context/session-context";
import { useMutation, useQuery } from "convex/react";
import { api, Id } from "@workspace/backend";

export function useFeatureLinks(featureId: string) {
  const session = useSession();
  const links = useQuery(api.issue.feature.getLinks, {
    token: session?.token || "",
    featureId: featureId as Id<"feature">,
  });

  const createMutation = useMutation(api.issue.feature.addLink);
  const deleteMutation = useMutation(api.issue.feature.deleteLink);

  const createLink = async ({
    url,
    featureId,
  }: {
    url: string;
    featureId: string;
  }) => {
    if (!session?.token) return;

    try {
      const result = await createMutation({
        token: session.token,
        featureId: featureId as Id<"feature">,
        link: { url },
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Error creating link:", error);
      return { success: false, error };
    }
  };

  const deleteLink = async ({
    id,
    featureId,
  }: {
    id: string;
    featureId: string;
  }) => {
    if (!session?.token) return;

    try {
      await deleteMutation({
        token: session.token,
        linkId: id as Id<"featureLink">,
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting link:", error);
      return { success: false, error };
    }
  };

  return {
    links: links || [],
    isLoading: links === undefined,
    createLink,
    isCreating: false,
    deleteLink,
    isDeleting: false,
  };
}
