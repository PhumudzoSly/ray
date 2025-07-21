import React, { ReactNode } from "react";
import { Separator } from "@workspace/ui/components/separator";
import { getSingleIdea } from "@/actions/idea";
import { getSession } from "@/actions/account/user";
import NoData from "@/components/shared/no-data";
import IdeaInfo from "@/components/idea/core/idea-info";
import { IdeaTabs } from "@/components/idea/core/tabs";
import Header from "@/components/shared/header";
import getQueryClient from "@/lib/query/getQueryClient";

const IdeaLayout = async ({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: ReactNode;
}) => {
  //

  const { id } = await params;
  const { token } = await getSession();

  const tabsMenu = [
    {
      title: "Validate",
      href: `/ideas/${id}`,
    },
    {
      title: "Ideation",
      href: `/ideas/${id}/ideation`,
    },
    {
      title: "Market",
      href: `/ideas/${id}/market`,
    },
    {
      title: "Financial Analysis",
      href: `/ideas/${id}/finance`,
    },
    {
      title: "Competitors",
      href: `/ideas/${id}/competitors`,
    },
    {
      title: "Insights",
      href: `/ideas/${id}/insights`,
    },
  ];

  const queryClient = getQueryClient();

  const idea = await getSingleIdea(id);
  await queryClient.prefetchQuery({
    queryKey: ["idea", id],
    queryFn: () => {
      return idea;
    },
  });

  if (!idea) {
    return <NoData />;
  }

  return (
    <div>
      <Header
        crumb={[
          {
            title: "Ideas",
            url: "/ideas",
          },
          {
            title: idea.name,
            url: `/ideas/${id}`,
          },
        ]}
      >
        {null}
      </Header>
      <div className="container">
        <IdeaInfo id={id} />
        <IdeaTabs tabs={tabsMenu} ideaId={id} />
        {children}
      </div>
    </div>
  );
};

export default IdeaLayout;
