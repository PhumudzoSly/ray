import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";

export function useIssueLinks(issueId: string) {
  const session = useSession();
  const links = useQuery(api.issue.index.getLinks, {
    token: session?.token || "",
    issueId: issueId as Id<"issues">,
  });

  const createMutation = useMutation(api.issue.index.addLink);
  const deleteMutation = useMutation(api.issue.index.deleteLink);

  const createLink = async ({
    url,
    issueId,
  }: {
    url: string;
    issueId: string;
  }) => {
    if (!session?.token) return;

    try {
      const result = await createMutation({
        token: session.token,
        issueId: issueId as Id<"issues">,
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
    issueId,
  }: {
    id: string;
    issueId: string;
  }) => {
    if (!session?.token) return;

    try {
      await deleteMutation({
        token: session.token,
        linkId: id as Id<"issueLink">,
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
