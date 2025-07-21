"use client";
import * as React from "react";
import {
  LayoutDashboard,
  Lightbulb,
  UsersRound,
  Bot,
  Inbox,
  MessageCircleCode,
  InfoIcon,
  Lock,
  List,
  Users,
  MessageCircle,
  LinkIcon,
} from "lucide-react";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { NavMenu } from "./nav-menu";
import { TbListDetails, TbProgressCheck, TbRoad } from "react-icons/tb";
import { BiError } from "react-icons/bi";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";

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
      name: "Inbox",
      url: "/inbox",
      icon: MessageCircle,
      badge: {
        text: "Coming Soon",
        variant: "success",
      },
    },
    {
      name: "Ideas",
      url: "/ideas",
      icon: Lightbulb,
    },
  ],
  build: [
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
    {
      name: "Milestones",
      url: "/milestones",
      icon: TbProgressCheck,
    },
    {
      name: "Feedback",
      url: "/feedback",
      icon: Inbox,
      badge: {
        text: "Coming Soon",
        variant: "warning",
      },
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
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-4">
                <img
                  src="/icon.png"
                  className="h-9 w-9 bg-white object-contain aspect-square transition-transform duration-200"
                  alt=""
                />
                <Badge>Beta</Badge>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea>
          <div className="grow">
            <NavMenu items={data.platform} title="Platform" />
            <Separator />
            <NavMenu items={data.build} title="Build" />
            <Separator />
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-4 p-3">
          <Link
            href="/settings/teams"
            className="flex  text-xs items-center gap-2"
          >
            <Users className="text-muted-foreground" size={15} /> Teams
          </Link>
          <Link
            href="/settings/integrations"
            className="flex  text-xs items-center gap-2"
          >
            <LinkIcon className="text-muted-foreground" size={15} />{" "}
            Integrations
          </Link>
          <Link
            href="/settings/api-keys"
            className="flex  text-xs items-center gap-2"
          >
            <Lock className="text-muted-foreground" size={15} /> API Keys
          </Link>
          <Link
            href="https://docs.rayai.dev"
            className="flex  text-xs items-center gap-2"
          >
            <List className="text-muted-foreground" size={15} /> Documentation
          </Link>
          <Link href="/support" className="flex  text-xs items-center gap-2">
            <InfoIcon className="text-muted-foreground" size={15} /> Help &
            Support
          </Link>
          <NavUser />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
