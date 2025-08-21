import { Suspense } from "react";
import { IntegrationsClient } from "./integrations-client";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IntegrationsClient success={success} error={error} />
    </Suspense>
  );
}
