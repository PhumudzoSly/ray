import { getAllIntegrations } from "@/actions/integration";
import { IntegrationsClient } from "./integrations-client";
import getQueryClient from "@/lib/query/getQueryClient";
import { Suspense } from "react";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const result = await getAllIntegrations();
      if (result.success) return result.data;
      throw new Error("Failed to load integrations");
    },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IntegrationsClient successMessage={success} errorMessage={error} />
    </Suspense>
  );
}
