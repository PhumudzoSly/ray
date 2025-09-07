import Header from "@/components/shared/header";
import { DeleteCompetitor } from "./_components/delete-competitor";
import { EditCompetitor } from "./_components/edit-competitor";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import CompetitorSidebar from "./_components/sidebar";
import getQueryClient from "@/lib/query/getQueryClient";
import { getCompetitor } from "@/actions/idea/competitor";
import { CompetitorDetails } from "./_components/competitor-details";
import { getSession } from "@/actions/account/user";
import { redis } from "@/lib/redis";
import { UIMessage } from "ai";
import { Suspense } from "react";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

const CompetitorPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const queryClient = getQueryClient();
  const { org, userId } = await getSession();
  const key = `chat:history:competitor:${userId}:org:${org}:${id}`;

  const messages =
    (await redis.get<UIMessage[]>(key)) ||
    (await redis.get<UIMessage[]>(
      `chat:history:competitor:${userId}:org:${org}:${id}`
    )) ||
    [];

  await queryClient.prefetchQuery({
    queryKey: ["competitor", id],
    queryFn: () => getCompetitor({ id }),
  });

  return (
    <>
      <Header
        crumb={[
          {
            title: "Competitor",
            url: "/competitor",
          },
        ]}
      >
        <div className="flex items-center gap-2">
          <EditCompetitor id={id} />
          <DeleteCompetitor id={id} />
        </div>
      </Header>
      <Suspense fallback={<LoadingSpinner variant="card" />}>
        <ExpandedLayoutContainer
          hideScroll
          sidebar={
            <CompetitorSidebar
              org={org}
              userId={userId}
              initialMessages={messages}
              competitorId={id}
            />
          }
        >
          <div>
            <CompetitorDetails id={id} />
          </div>
        </ExpandedLayoutContainer>
      </Suspense>
    </>
  );
};

export default CompetitorPage;
