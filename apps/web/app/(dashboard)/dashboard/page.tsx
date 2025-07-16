import React from "react";
import { Separator } from "@workspace/ui/components/separator";
import Header from "@/components/shared/header";
import { getSession } from "@/actions/account/user";
import { getStats } from "@/actions/dashboard/analytics";
import Stat from "./Stat";
import { Lightbulb, Server } from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";

const DashboardPage = async () => {

  const session = await getSession()
  const stats = await getStats()

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
          icon={() => <Server color="orange" />}
          message="currently used"
          title={stats.totalStorage.label}
          value={parseFloat(stats?.totalStorage?.value.toFixed(1)) || 0}
        />
        <Stat
          icon={() => <Server color="orange" />}
          message="active"
          title={stats.totalWaitlists.label}
          value={parseFloat(stats?.totalWaitlists?.value.toFixed(1)) || 0}
        />
        <Stat
          icon={() => <Server color="orange" />}
          message="across all projects"
          title={stats.totalRoadmaps.label}
          value={parseFloat(stats?.totalRoadmaps?.value.toFixed(1)) || 0}
        />

      </div>
    </>
  );
};

export default DashboardPage;
