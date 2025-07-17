"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProject } from "@/actions/project";
import { getLaunchPlan, generateLaunchPlan } from "@/actions/launch/plan";
import { updateLaunchChecklistItem } from "@/actions/launch/checklist-items";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { LaunchHeader } from "./components/launch-header";
import { LaunchEmptyState } from "./components/launch-empty-state";
import { LaunchOverview } from "./components/launch-overview";
import { LaunchChecklist } from "./components/launch-checklist";
import { LaunchCopy } from "./components/launch-copy";
import { LaunchStrategy } from "./components/launch-strategy";
import { Separator } from "@workspace/ui/components/separator";

export default function ProjectLaunchPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const { token } = useSession();

  // Fetch project data
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });

  // Fetch launch plan data
  const { data: launchPlan, isLoading: isLaunchPlanLoading, refetch: refetchLaunchPlan } = useQuery({
    queryKey: ["launchPlan", id],
    queryFn: () => getLaunchPlan(id),
    enabled: !!id,
    select: (res) => res?.success ? res.data : undefined,
  });

  // Generate structured launch plan
  const generateLaunchPlanMutation = useMutation({
    mutationFn: async () => {
      return await generateLaunchPlan({ projectId: id });
    },
    onSuccess: () => {
      toast.success("Structured launch plan generated successfully!");
      refetchLaunchPlan();
    },
    onError: () => {
      toast.error("Failed to generate launch plan");
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // Update checklist item status
  const updateChecklistStatusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: string }) => {
      return await updateLaunchChecklistItem(itemId, { status });
    },
    onSuccess: () => {
      toast.success("Checklist item updated!");
      refetchLaunchPlan();
    },
    onError: () => {
      toast.error("Failed to update checklist item");
    },
  });

  const handleGenerateLaunchPlan = async () => {
    if (!project) return;
    setIsGenerating(true);
    generateLaunchPlanMutation.mutate();
  };

  const handleChecklistToggle = async (itemId: string, status: string) => {
    updateChecklistStatusMutation.mutate({ itemId, status });
  };

  if (isProjectLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <LaunchHeader
        project={project}
        launchPlan={launchPlan}
        isGenerating={isGenerating}
        onGenerateLaunchPlan={handleGenerateLaunchPlan}
      />
      <Separator className="my-4" />
      <div className="flex-1 overflow-y-auto">
        {isLaunchPlanLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !launchPlan ? (
          <LaunchEmptyState
            isGenerating={isGenerating}
            onGenerate={handleGenerateLaunchPlan}
          />
        ) : (
          <div className="container mx-auto px-6 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="copy">Launch Copy</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <LaunchOverview
                  checklistItems={launchPlan.checklistItems || []}
                  copyItems={launchPlan.copyItems || []}
                  launchStatus={launchPlan.status}
                />
              </TabsContent>

              <TabsContent value="checklist" className="mt-6">
                <LaunchChecklist
                  checklistItems={launchPlan.checklistItems || []}
                  onToggleItem={handleChecklistToggle}
                />
              </TabsContent>

              <TabsContent value="copy" className="mt-6">
                <LaunchCopy copyItems={launchPlan.copyItems || []} />
              </TabsContent>

              <TabsContent value="strategy" className="mt-6">
                <LaunchStrategy
                  strategyPhases={launchPlan.strategyPhases || []}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
