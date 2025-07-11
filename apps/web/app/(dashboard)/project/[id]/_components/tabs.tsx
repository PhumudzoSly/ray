"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";

interface Tab {
  title: string;
  href: string;
}

interface ProjectTabsProps {
  projectId: string;
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname();

  const tabsMenu = [
    {
      title: "Overview",
      href: `/project/${projectId}`,
    },
    {
      title: "Features",
      href: `/project/${projectId}/features`,
    },
    {
      title: "Milestones",
      href: `/project/${projectId}/milestones`,
    },
    {
      title: "Waitlist",
      href: `/waitlist?project=${projectId}`,
    },
    {
      title: "Assets & Files",
      href: `/project/${projectId}/assets`,
    },
    {
      title: "Launch AI",
      href: `/project/${projectId}/launch`,
    },
  ];

  return (
    <div className="w-full border-b border-t">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex flex-wrap w-full gap-4 p-4">
          {tabsMenu.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted hover:text-muted-foreground"
                )}
              >
                {tab.title}
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
