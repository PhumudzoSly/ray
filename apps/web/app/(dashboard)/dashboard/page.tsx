"use client";
import React from "react";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { QuickActions } from "./components/quick-actions";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Separator } from "@workspace/ui/components/separator";
import Stat from "./Stat";
import { Bug, Lightbulb, List, ListChecks, Users } from "lucide-react";
import { TbListDetails } from "react-icons/tb";
import Header from "@/components/shared/header";

const DashboardPage = () => {
  const { name, token } = useSession();

  const { data: stats, isPending: isStatsPending } = useData(
    api.dashboard.getStats,
    {
      token,
    }
  );

  if (isStatsPending)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <Header crumb={[{ title: "Dashboard", url: "/dashboard" }]}>
        {null}
      </Header>

      <div className="flex items-center flex-wrap gap-4 justify-between p-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Hi, {name.split(" ")[0]}. What are we building today?
          </p>
        </div>
        <CreateProjectDialog />
      </div>
      <Separator />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <Stat
          icon={() => <Lightbulb color="orange" />}
          message="Saas Ideas"
          title="Core business ideas"
          value={stats?.ideas?.length || 0}
        />
        <Stat
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
        />
      </div>
    </>
  );
};

export default DashboardPage;
