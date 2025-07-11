"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@workspace/ui/components/button";
import type * as React from "react";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border lg:border-none">
      <nav
        className={cn(
          "flex flex-row relative h-10 lg:h-full lg:min-h-96 lg:flex-col w-full",
          className
        )}
        {...props}
      >
        <div className="absolute flex flex-row lg:flex-col w-full">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start whitespace-nowrap w-full",
                "mr-2 mb-0 lg:mr-0 lg:mb-2"
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
