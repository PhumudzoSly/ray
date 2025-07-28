import { getSession } from "@/actions/account/user";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import FeatureSidebar from "./components/feature-sidebar";
import FeatureDetails from "./components/feature-details";
import { redirect } from "next/navigation";
import {
  getFeatureById,
  validateFeatureCompletion,
  getFeatureHierarchy,
} from "@/actions/project/features";
import Header from "@/components/shared/header";
import getQueryClient from "@/lib/query/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import Hydrate from "@/lib/query/hydrate.client";

const SingleFeaturePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  // Pre-fetch feature data on the server
  const queryClient = getQueryClient();

  // Pre-fetch all data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["feature", id],
      queryFn: () => getFeatureById(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["featureValidation", id],
      queryFn: () => validateFeatureCompletion(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["featureHierarchy", id],
      queryFn: () => getFeatureHierarchy(id),
    }),
  ]);

  // Fetch feature to check if it exists
  const featureResult = await getFeatureById(id);
  const feature = featureResult.success ? featureResult.data : null;

  if (!feature) {
    return redirect(
      process.env.NODE_ENV === "production" ? "/stay-tuned" : "/dashboard"
    );
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <div>
        <Header
          crumb={[
            { title: "Projects", url: "/project" },
            { title: "Feature", url: `/features/${id}` },
          ]}
        >
          {null}
        </Header>
        <ExpandedLayoutContainer sidebar={<FeatureSidebar featureId={id} />}>
          <div className="py-4 px-6">
            <FeatureDetails id={id} />
          </div>
        </ExpandedLayoutContainer>
      </div>
    </Hydrate>
  );
};

export default SingleFeaturePage;
