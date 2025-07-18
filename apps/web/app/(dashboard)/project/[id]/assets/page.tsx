import { Suspense } from "react";
import { notFound } from "next/navigation";
import * as assetActions from "@/actions/project/assets";
import { AssetTypeType, AssetCategoryType } from "@workspace/backend";
import { AssetsClient } from "./_components/assets-client";
import { AssetsSkeleton } from "./_components/assets-skeleton";

interface AssetsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetsPage({ params }: AssetsPageProps) {
  const { id: projectId } = await params;

  if (!projectId) {
    notFound();
  }

  // Fetch initial assets data on the server
  const initialAssets = await assetActions.getProjectAssets({
    projectId,
  });

  return (
    <Suspense fallback={<AssetsSkeleton />}>
      <AssetsClient projectId={projectId} initialAssets={initialAssets} />
    </Suspense>
  );
}
