import { FeatureTable } from "@/components/project/features/feature-table";
import getQueryClient from "@/lib/query/getQueryClient";
import * as featureActions from "@/actions/project/features";
import React from "react";
import { dehydrate } from "@tanstack/react-query";
import Hydrate from "@/lib/query/hydrate.client";

const Features = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const query = getQueryClient();

  await query.prefetchQuery({
    queryKey: ["features", id],
    queryFn: () =>
      featureActions.getFeaturesByProject(id).then((res) => res.data),
  });

  const dehydratedState = dehydrate(query);

  return (
    <Hydrate state={dehydratedState}>
      <FeatureTable projectId={id} />
    </Hydrate>
  );
};

export default Features;
