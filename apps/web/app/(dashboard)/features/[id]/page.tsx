import { getSession } from "@/actions/account/user";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import FeatureSidebar from "./components/feature-sidebar";
import FeatureDetails from "./components/feature-details";
import { redirect } from "next/navigation";
import { getFeatureById } from "@/actions/project/features";
import Header from "@/components/shared/header";
import { NewFeature } from "@/components/project/features/new-feature";

const SingleFeaturePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { token } = await getSession();

  // Fetch feature using server action
  const featureResult = await getFeatureById(id);
  const feature = featureResult.success ? featureResult.data : null;

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
        {null}
      </Header>
      <ExpandedLayoutContainer
        sidebar={<FeatureSidebar featureId={id} />}
      >
        <div className="py-4 px-6">
          <FeatureDetails id={id} />
        </div>
      </ExpandedLayoutContainer>
    </div>
  );
};

export default SingleFeaturePage;
