import React from "react";
import OverviewStats from "./_overview/stats";
import { ActionItems } from "@/components/idea/action-items/action-items";
import getQueryClient from "@/lib/query/client";
import { getActionItems } from "@/actions/idea/action-items";
import { getSingleIdea } from "@/actions/idea";

const IdeaOverview = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const query = getQueryClient();

  await Promise.all([
    query.prefetchQuery({
      queryKey: ["actionItems", id],
      queryFn: async () => {
        return await getActionItems(id);
      },
    }),
    query.prefetchQuery({
      queryKey: ["idea", id],
      queryFn: async () => {
        return await getSingleIdea(id);
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="p-4">
        <OverviewStats id={id} />
      </div>

      <div className="p-4 overflow-x-auto">
        <ActionItems ideaId={id} />
      </div>
    </div>
  );
};

export default IdeaOverview;
