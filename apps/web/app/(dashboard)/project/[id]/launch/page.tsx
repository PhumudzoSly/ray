"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@workspace/backend";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Id } from "@workspace/backend";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { LaunchHeader } from "./components/launch-header";
import { LaunchEmptyState } from "./components/launch-empty-state";
import { LaunchOverview } from "./components/launch-overview";
import { LaunchChecklist } from "./components/launch-checklist";
import { LaunchCopy } from "./components/launch-copy";
import { LaunchStrategy } from "./components/launch-strategy";

// Type definitions for launch plan data
interface ChecklistItem {
  _id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "skipped";
  isRequired: boolean;
  category: string;
  order: number;
  dueDate?: string;
}

interface CopyItem {
  platform: string;
  title: string;
  tagline?: string;
  description: string;
  hashtags?: string[];
  isApproved: boolean;
  version: number;
}

interface StrategyPhase {
  _id: string;
  name: string;
  description: string;
  phase: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  targetAudience: string[];
  keyMetrics?: Array<{
    name: string;
    target: string;
  }>;
}

interface LaunchPlan {
  status: string;
  checklistItems?: ChecklistItem[];
  copyItems?: CopyItem[];
  strategyPhases?: StrategyPhase[];
}

export default function ProjectLaunchPage() {
  const params = useParams();
  const id = params.id as Id<"projects">;
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const { token } = useSession();

  // Fetch project data
  const project = useQuery(api.projects.get, { id, token });

  // Fetch launch plan data
  const launchPlan = useQuery(api.launch.index.getByProject, {
    projectId: id,
    token,
  }) as LaunchPlan | undefined;

  // Generate structured launch plan
  const generateLaunchPlan = useAction(api.launch.generator.generate);

  // Update checklist item status
  const updateChecklistStatus = useMutation(api.launch.checklist.updateStatus);

  const handleGenerateLaunchPlan = async () => {
    if (!project) return;

    setIsGenerating(true);
    try {
      await generateLaunchPlan({
        projectId: id,
        token,
      });
      toast.success("Structured launch plan generated successfully!");
    } catch (error) {
      toast.error("Failed to generate launch plan");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChecklistToggle = async (itemId: string, status: string) => {
    try {
      await updateChecklistStatus({
        token,
        itemId: itemId as Id<"launchChecklistItems">,
        status: status as any,
      });
      toast.success("Checklist item updated!");
    } catch (error) {
      toast.error("Failed to update checklist item");
    }
  };

  if (!project) {
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

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {!launchPlan ? (
            <LaunchEmptyState
              isGenerating={isGenerating}
              onGenerate={handleGenerateLaunchPlan}
            />
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
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
          )}
        </div>
      </div>
    </div>
  );
}
