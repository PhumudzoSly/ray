"use client";
import React, { useState, useEffect, ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Separator } from "@workspace/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { usePathname } from "next/navigation";
import { ModeToggle } from "../shared/mode-switcher";
import { NotificationBell } from "../ui/notification-bell";
import { Badge } from "@workspace/ui/components/badge";

const Appbar = ({ children }: { children: ReactNode }) => {
  //

  const pathname = usePathname();
  const [title, setTitle] = useState("Dashboard");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    //  Get the pagename from local storage every 100 milliseconds
    const interval = setInterval(() => {
      const pagename = localStorage.getItem("pageName");
      if (pagename) {
        setTitle(pagename);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!isReady || typeof window === "undefined") return null;

  if (
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname === "/join" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/switch-org") ||
    pathname.startsWith("/join")
  )
    return <main className="bg-transparent">{children}</main>;

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset className="overflow-hidden flex flex-col ">
        <main className="flex-1 overflow-hidden min-h-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Appbar;
