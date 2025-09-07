import { getSingleIdea } from "@/actions/idea";
import { FolderOpen, ListCheck, Users } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-xs px-6 py-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-muted rounded-lg">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

const OverviewStats = async ({ id }: { id: string }) => {
  const idea = await getSingleIdea(id);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={FolderOpen}
        title="Projects"
        value={idea?._count?.projects || 0}
      />
      <StatCard
        icon={Users}
        title="Competitors"
        value={idea?._count?.Competitor || 0}
      />
      <StatCard
        icon={ListCheck}
        title="Actions"
        value={idea?._count?.actionItems || 0}
      />
    </div>
  );
};

export default OverviewStats;
