"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Button } from "@workspace/ui/components/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface LayoutContainerProps {
  children: React.ReactNode;
}

export function LayoutContainer({ children }: LayoutContainerProps) {
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
        "grid xl:grid-cols-[1fr_0px]", // Only show sidebar on xl screens
        isCollapsed && "grid-cols-[1fr_0px]" // Collapsed state
      )}
      style={{ height: "calc(100vh - 0px)" }}
    >
      <div className="w-full overflow-y-auto">{children}</div>
    </div>
  );
}
