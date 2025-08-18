"use client";

import { getCompetitorValidation } from "@/actions/idea/validation-competitors";
import { useQuery } from "@tanstack/react-query";

export const ideaKeys = {
  all: ["ideas"] as const,
  details: () => [...ideaKeys.all, "detail"] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,
  competitors: (id: string) => [...ideaKeys.detail(id), "competitors"] as const,
};

export const useGetCompetitorValidation = (ideaId: string) => {
  return useQuery({
    queryKey: ideaKeys.competitors(ideaId),
    queryFn: () => getCompetitorValidation({ ideaId }),
    enabled: !!ideaId, // Ensure the query only runs when ideaId is available
  });
};
