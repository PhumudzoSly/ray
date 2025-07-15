import React, { ReactNode } from "react";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import Link from "next/link";
import { InboxPopover } from "./inbox";

type HeaderProps = {
  crumb: {
    title: string;
    url?: string;
  }[];
  children: ReactNode;
};

const Header = ({ children, crumb }: HeaderProps) => {
  return (
    <header className="flex pr-3.5  h-14 shrink-0 w-full justify-between border-b border-border items-center gap-2 sticky top-0 bg-card z-50">
      <div className="flex items-center gap-2 rounded-2xl px-4">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
        <Badge variant="info" className="hidden md:block">
          Beta
        </Badge>
        <Breadcrumb>
          <BreadcrumbList>
            {crumb.map((c, index) => {
              // On mobile, only show the last item
              const isLastItem = index === crumb.length - 1;
              const shouldShowOnMobile = isLastItem;

              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem
                    className={!shouldShowOnMobile ? "hidden md:block" : ""}
                  >
                    <Link href={c.url || "#"}>{c.title}</Link>
                  </BreadcrumbItem>
                  {index < crumb.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        {children}
        <InboxPopover />
        {/* <NotificationBell /> */}
        {/* <ModeToggle /> */}
      </div>
    </header>
  );
};

export default Header;
