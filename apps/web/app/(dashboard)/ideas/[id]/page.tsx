import React from "react";
import OverviewStats from "./_overview/stats";

const IdeaOverview = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div>
      <div className="p-4">
        <OverviewStats id={id} />
      </div>
    </div>
  );
};

export default IdeaOverview;
