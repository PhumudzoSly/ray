import React from "react";
import { Separator } from "@workspace/ui/components/separator";
import Header from "@/components/shared/header";
import { getSession } from "@/actions/account/user";
import { getStats } from "@/actions/dashboard/analytics";
import Stat, { AdvancedStat } from "./Stat";
import {
  HardDrive,
  AlertTriangle,
  Map,
  Users,
  FolderOpen,
  Lightbulb,
  Zap,
  Target,
  CheckSquare,
  GitBranch,
} from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { ActivityChart } from "./activity-chart";
import { IssuesSummary } from "./issues-summary";

const DashboardPage = async () => {
  const session = await getSession();
  const stats = await getStats();

  return (
    <>
      <Header crumb={[{ title: "Dashboard", url: "/dashboard" }]}>
        {null}
      </Header>

      <div className="flex items-center flex-wrap gap-4 justify-between p-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Hi, {session?.name?.split(" ")[0]}. What are we building today?
          </p>
        </div>
        <CreateProjectDialog />
      </div>
      <Separator />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <Stat
          icon={HardDrive}
          message="currently used"
          title={stats.totalStorage.label}
          value={parseFloat(stats?.totalStorage?.value.toFixed(1)) || 0}
          iconColor="text-blue-500"
        />
        <Stat
          icon={AlertTriangle}
          message="active"
          title={stats.totalIssues.label}
          value={parseFloat(stats?.totalIssues?.value.toFixed(1)) || 0}
          iconColor="text-orange-500"
        />
        <Stat
          icon={Map}
          message="across all projects"
          title={stats.totalRoadmaps.label}
          value={parseFloat(stats?.totalRoadmaps?.value.toFixed(1)) || 0}
          iconColor="text-green-500"
        />
        <Stat
          icon={Users}
          message="total subscribers"
          title={stats.totalWaitlists.label}
          value={parseFloat(stats?.totalWaitlists?.value.toFixed(1)) || 0}
          iconColor="text-cyan-500"
        />
      </div>

      {/* Advanced Organization-Wide Stats */}
      <div className="px-4 pb-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Completion Overview</h3>
          <p className="text-sm text-muted-foreground">
            Completion rates and progress across all your projects
          </p>
        </div>

        <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
          {/* <IssuesSummary /> */}
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
            <AdvancedStat
              title="Projects"
              total={stats.advancedStats.projects.total}
              completed={stats.advancedStats.projects.completed}
              completionRate={stats.advancedStats.projects.completionRate}
              icon={FolderOpen}
              iconColor="text-blue-600"
            />

            <AdvancedStat
              title="Ideas"
              total={stats.advancedStats.ideas.total}
              completed={stats.advancedStats.ideas.completed}
              completionRate={stats.advancedStats.ideas.completionRate}
              icon={Lightbulb}
              iconColor="text-yellow-500"
            />

            <AdvancedStat
              title="Features"
              total={stats.advancedStats.features.total}
              completed={stats.advancedStats.features.completed}
              completionRate={stats.advancedStats.features.completionRate}
              icon={Zap}
              iconColor="text-amber-500"
            />

            <AdvancedStat
              title="Milestones"
              total={stats.advancedStats.milestones.total}
              completed={stats.advancedStats.milestones.completed}
              completionRate={stats.advancedStats.milestones.completionRate}
              icon={Target}
              iconColor="text-red-500"
            />
            <div className="md:col-span-2">{/* <ActivityChart /> */}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
