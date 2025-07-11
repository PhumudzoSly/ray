"use client";
import {
  Building,
  CircleCheck,
  Globe,
  FolderKanban,
  Settings,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useSession } from "@/context/session-context";
import { useSidebarProjects } from "@/hooks/use-sidebar-projects";

export function NavProjects() {
  const session = useSession();
  const {
    data: projects,
    isLoading,
    error,
  } = useSidebarProjects(session?.token || "");

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="space-y-2 px-4 py-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </SidebarGroup>
    );
  }

  if (error) {
    console.error("Error loading projects:", error);
    return null; // or render an error state
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CircleCheck;
      case "in-progress":
        return AlertCircle;
      case "review":
        return Settings;
      case "planning":
        return Building;
      default:
        return FolderKanban;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "in-progress":
        return "text-blue-500";
      case "review":
        return "text-yellow-500";
      case "planning":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <SidebarGroup>
      <div className="flex w-full justify-between items-center">
        <SidebarGroupLabel className="mb-1.5 text-sm text-muted-foreground">
          Recent Projects
        </SidebarGroupLabel>
        <Button
          asChild
          variant={"link"}
          size="sm"
          className="text-xs text-primary"
        >
          <Link href="/projects">View All</Link>
        </Button>
      </div>
      {!projects || projects.length === 0 ? (
        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl">📁</div>
            <h6 className="text-lg font-semibold">Start Building</h6>
            <p className="text-sm text-muted-foreground">
              Create your first project and start building with our powerful
              development tools
            </p>
          </div>
        </Card>
      ) : (
        <SidebarMenu>
          {projects?.map((project, index) => {
            const StatusIcon = getStatusIcon(project.status || "planning");
            return (
              <Collapsible
                key={project._id}
                asChild
                defaultOpen={index === 0}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="hover:bg-muted"
                      tooltip={project.name}
                    >
                      <div className="inline-flex size-6 dark:bg-blue-400/20 bg-transparent dark:opacity-45 items-center justify-center rounded shrink-0">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {project.name}
                        </div>
                        {/* <div className="text-xs text-muted-foreground/70">
                          {formatDistanceToNow(new Date(project.updatedAt), {
                            addSuffix: true,
                          })}
                        </div> */}
                      </div>
                      <StatusIcon
                        className={`h-3 w-3 ${getStatusColor(project.status || "planning")}`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <SidebarMenuSub className="dark:text-muted-foreground text-sm text-muted-foreground">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href={`/project/${project._id}`}>
                            <CircleCheck size={12} className="text-green-500" />
                            <span>Overview</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href={`/project/${project._id}/flow`}>
                            <Globe size={12} className="text-blue-500" />
                            <span>Flow Editor</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href={`/project/${project._id}/issues`}>
                            <AlertCircle
                              size={12}
                              className="text-yellow-500"
                            />
                            <span>Issues</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href={`/project/${project._id}/launch`}>
                            <Building size={12} className="text-gray-500" />
                            <span>Launch Plan</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
