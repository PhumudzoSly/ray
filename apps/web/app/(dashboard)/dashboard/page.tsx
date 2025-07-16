import React from "react";
import { Separator } from "@workspace/ui/components/separator";
import Header from "@/components/shared/header";
import { getSession } from "@/actions/account/user";
import { getStats } from "@/actions/dashboard/analytics";
import Stat from "./Stat";
import { Lightbulb, Server } from "lucide-react";

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
        {/* <CreateProjectDialog /> */}
      </div>
      <Separator />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <Stat
          icon={() => <Server color="orange" />}
          message="Saas Ideas"
          title={stats.totalStorage.label}
          value={stats?.totalStorage?.value || 0}
        />
        {/* <Stat
          icon={() => <Users color="pink" />}
          title="Team members"
          message="Total users"
          value={stats?.members?.length || 0}
        />
        <Stat
          icon={() => <Bug className="text-red-400" />}
          title="Active issues"
          message="Total issues"
          value={stats?.issues?.length || 0}
        />
        <Stat
          icon={() => <TbListDetails size={20} className="text-emerald-400" />}
          title="My Projects"
          message="Shared with team"
          value={stats?.projects?.length || 0}
        /> */}
      </div>
    </>
  );
};

export default DashboardPage;
