import { QueryClient } from "@tanstack/query-core";
import { cache } from "react";

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 2 * 60 * 1000, // 2 minutes - integrations don't change frequently
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: 2,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          // Enable background refetching for better UX
          refetchInterval: 5 * 60 * 1000, // 5 minutes for integrations
        },
        mutations: {
          retry: 2,
          // Optimistic updates for better perceived performance
          onMutate: async () => {
            // Cancel any outgoing refetches so they don't overwrite optimistic update
            await getQueryClient().cancelQueries({
              queryKey: ["integrations"],
            });
          },
        },
      },
    })
);
export default getQueryClient;
