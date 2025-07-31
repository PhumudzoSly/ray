"use client";

import { useQuery } from "@tanstack/react-query";
import { getResearchSession } from "@/actions/idea/research";

export function useResearchSession(ideaId: string) {
  return useQuery({
    queryKey: ["research-session", ideaId],
    queryFn: async () => {
      const result = await getResearchSession(ideaId);

      return result.session;
    },
    refetchInterval: (query) => {
      // Refetch every 5 seconds if research is in progress
      const session = query.state.data;
      if (
        session?.status === "IN_PROGRESS" ||
        session?.status === "INITIALIZING"
      ) {
        return 5000;
      }
      return false;
    },
    enabled: !!ideaId,
  });
}
