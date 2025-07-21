import { getAllIntegrations } from "@/actions/integration";
import { IntegrationsClient } from "./integrations-client";
import getQueryClient from "@/lib/query/getQueryClient";

export default async function IntegrationsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const result = await getAllIntegrations();
      if (result.success) return result.data;
      throw new Error("Failed to load integrations");
    },
  });

  return <IntegrationsClient />;
}
