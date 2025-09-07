"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Button } from "@workspace/ui/components/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ExpandedLayoutContainerProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  hideScroll?: boolean;
}

export function ExpandedLayoutContainer({
  children,
  sidebar,
  hideScroll = false,
}: ExpandedLayoutContainerProps) {
  const isLargeScreen = useMediaQuery("(min-width: 1280px)");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on non-xl screens and expand on xl screens
  useEffect(() => {
    setIsCollapsed(!isLargeScreen);
  }, [isLargeScreen]);

  return (
    <div
      className={cn(
        "w-full relative",
        "grid xl:grid-cols-[1fr_400px]", // Only show sidebar on xl screens
        isCollapsed && "grid-cols-[1fr_0px]" // Collapsed state
      )}
      style={{ height: "calc(100vh - 54px)" }}
    >
      <ScrollArea className="w-full" style={{ height: "calc(100vh - 54px)" }}>
        {children}
      </ScrollArea>

      {/* Show toggle button on all screens except xl */}
      {!isLargeScreen && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "fixed z-50 bottom-4 right-4 h-10 w-10 rounded-full shadow-lg border-2",
            !isCollapsed &&
              "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      <div
        className={cn(
          "transition-all border-l border-border duration-300 ease-in-out relative",
          "fixed xl:relative", // Fixed position below xl, relative on xl
          "top-16 xl:top-0 right-0", // Account for app bar height on mobile
          "h-[calc(100vh-54px)]", // Adjust height to account for app bar
          "bg-background xl:bg-transparent", // Background below xl
          "z-40 xl:z-auto", // Higher z-index below xl
          isCollapsed ? "w-0" : "w-full xl:w-[400px] overflow-hidden",
          hideScroll ? "overflow-y-hidden" : "overflow-y-auto"
        )}
      >
        <div
          className={cn(
            isCollapsed ? "opacity-0 invisible" : "opacity-100 visible",
            hideScroll ? "overflow-y-hidden" : "overflow-y-auto",
            "shadow-lg xl:shadow-none" // Add shadow below xl screens
          )}
        >
          {sidebar}
        </div>
      </div>
    </div>
  );
}
