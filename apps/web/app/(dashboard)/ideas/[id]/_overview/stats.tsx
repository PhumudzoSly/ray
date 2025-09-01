import { getSingleIdea } from "@/actions/idea";
import Stat from "@/app/(dashboard)/dashboard/Stat";
import { ListOrdered } from "lucide-react";
import React from "react";

const OverviewStats = async ({ id }: { id: string }) => {
  const idea = await getSingleIdea(id);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Stat
        icon={ListOrdered}
        title="Projects"
        message=""
        value={idea?._count?.projects || 0}
      />
      <Stat
        message=""
        icon={ListOrdered}
        title="Competitors"
        value={idea?._count?.Competitor || 0}
      />
    </div>
  );
};

export default OverviewStats;
