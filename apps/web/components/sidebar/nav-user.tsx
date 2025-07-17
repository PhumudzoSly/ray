"use client";

import {
  BadgeCheck,
  Bug,
  ChevronsUpDown,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { signOut } from "@/lib/authClient";
import { getSession } from "@/actions/account/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession } from "@/context/session-context";
import { startTransition } from "react";
import { getInitials } from "@/utils/helpers";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const session = useSession();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group relative w-full overflow-hidden rounded-lg border bg-linear-to-br from-primary/20 to-muted p-1 shadow-lg transition-all duration-200 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-r to-primary/10 from-secondary/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(session.orgName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {session.orgName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session.role === "admin" ? "Administrator" : "Team Member"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground transition-transform duration-200" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg p-2"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0">
              <div className="flex items-center gap-3 rounded-md bg-linear-to-br from-background to-muted p-3">
                <Avatar className="h-10 w-10 rounded-lg border shadow-xs">
                  <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 font-medium">
                    {session.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 gap-1 text-left">
                  <span className="text-sm font-semibold">{session.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
                  href="/switch-org"
                >
                  <Sparkles className="size-4 text-amber-500" />
                  <span>Switch organisation</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                  href="/settings"
                >
                  <Settings className="size-4 text-zinc-500" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                  href="/billing/subscription"
                >
                  <CreditCard className="size-4 text-violet-500" />
                  <span>Billing & Subscription</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                  href="/settings/account"
                >
                  <BadgeCheck className="size-4 text-green-500" />
                  <span>My Account</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                  href="/report-bugs"
                >
                  <Bug className="size-4 text-primary" />
                  <span>Report bugs</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                  href="/support"
                >
                  <HelpCircle className="size-4 text-blue-500" />
                  <span>Support</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={async () => {
                startTransition(async () => {
                  await signOut();
                  router.replace("/auth/sign-in");
                });

                router.refresh();
              }}
              className="w-full cursor-pointer gap-2 rounded-md bg-destructive px-2 py-1.5 text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
