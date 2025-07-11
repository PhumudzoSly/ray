import { getSession } from "@/actions/account/user";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import FeatureSidebar from "./components/feature-sidebar";
import FeatureDetails from "./components/feature-details";
import { redirect } from "next/navigation";
import { preloadQuery } from "convex/nextjs";
import { Id } from "@workspace/backend";
import { api } from "@workspace/backend";
import Header from "@/components/shared/header";
import { NewFeature } from "@/components/project/features/new-feature";

const SingleFeaturePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { token } = await getSession();

  const feature = preloadQuery(api.issue.feature.getFeatureById, {
    token,
    id: id as Id<"feature">,
  });

  if (!feature) {
    return redirect("/dashboard");
  }

  return (
    <div>
      <Header
        crumb={[
          { title: "Projects", url: "/project" },
          { title: "Feature", url: `/features/${id}` },
        ]}
      >
        <NewFeature parentFeatureId={id as Id<"feature">} />
      </Header>
      <ExpandedLayoutContainer
        sidebar={<FeatureSidebar featureId={id as Id<"feature">} />}
      >
        <div className="py-4 px-6">
          <FeatureDetails id={id} />
        </div>
      </ExpandedLayoutContainer>
    </div>
  );
};

export default SingleFeaturePage;
