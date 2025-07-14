"use client";
import * as React from "react";
import { LayoutDashboard, Lightbulb, UsersRound, Bot } from "lucide-react";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { NavMenu } from "./nav-menu";
import { TbListDetails, TbRoad } from "react-icons/tb";
import { BiError } from "react-icons/bi";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { NavProjects } from "./nav-projects";

type NavGroup = {
  name: string;
  url: string;
  icon: React.ElementType;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "warning" | "success" | "error";
  };
};

type NavData = {
  platform: NavGroup[];
  build: NavGroup[];
  grow: NavGroup[];
};

const data: NavData = {
  platform: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Agent",
      url: "/agent",
      icon: Bot,
    },
  ],
  build: [
    {
      name: "Ideas",
      url: "/ideas",
      icon: Lightbulb,
    },
    {
      name: "Projects",
      url: "/project",
      icon: TbListDetails,
    },
    {
      name: "Issues",
      url: "/issues",
      icon: BiError,
    },
    {
      name: "Waitlist",
      url: "/waitlist",
      icon: UsersRound,
    },
    {
      name: "Roadmap",
      url: "/roadmap",
      icon: TbRoad,
    },
  ],
  grow: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  //
  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" asChild>
              <NavUser />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea>
          <div className="grow">
            <NavMenu items={data.platform} title="Platform" />
            <NavMenu items={data.build} title="Build" />
            <NavProjects />
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
