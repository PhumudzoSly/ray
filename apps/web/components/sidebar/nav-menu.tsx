"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
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

interface NavItem {
  name: string;
  url: string;
  icon: any;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "warning" | "success" | "error";
  };
  items?: Omit<NavItem, "icon" | "items">[];
}

interface NavMenuProps {
  items: NavItem[];
  title: string;
  collapsible?: boolean;
}

export function NavMenu({ items, title, collapsible = false }: NavMenuProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup
      className={cn(
        "relative",
        collapsible && "group-data-[collapsible=icon]:hidden"
      )}
    >
      <SidebarGroupLabel className="mb-2 text-sm text-muted-foreground">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname.startsWith(item.url);
          const hasSubItems = item.items && item.items.length > 0;

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton isActive={isActive} asChild>
                <Link
                  href={item.url}
                  className={cn(
                    "group relative mb-0.5 flex w-full items-center gap-3 rounded-4xl transition-colors",
                    isActive &&
                      "bg-linear-to-r from-transparent to-primary/20 border-r-8 border-r-primary"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground"
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "font-normal",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-foreground"
                    )}
                  >
                    {item.name}
                  </span>
                  {item.badge && (
                    <Badge
                      variant={item.badge.variant as any}
                      className="ml-auto shrink-0 px-1 py-0.5 text-xs"
                    >
                      {item.badge.text}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
