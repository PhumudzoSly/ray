"use client";

import { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import type { ResearchDepth } from "@/types/research";
import { RESEARCH_DEPTHS } from "@/lib/config/researchConfig";
import { Zap, BarChart2, Search, Layers } from "lucide-react";

interface ResearchDepthSelectorProps {
  ideaId: string;
  disabled?: boolean;
  selectedDepth?: ResearchDepth;
  onDepthChange?: (depth: ResearchDepth) => void;
  showButton?: boolean;
}

export function ResearchDepthSelector({
  ideaId,
  disabled = false,
  selectedDepth: externalSelectedDepth,
  onDepthChange,
  showButton = true,
}: ResearchDepthSelectorProps) {
  const [internalSelectedDepth, setInternalSelectedDepth] =
    useState<ResearchDepth>("STANDARD");

  // Use external state if provided, otherwise use internal state
  const selectedDepth = externalSelectedDepth ?? internalSelectedDepth;

  const handleDepthChange = (depth: ResearchDepth) => {
    if (onDepthChange) {
      onDepthChange(depth);
    } else {
      setInternalSelectedDepth(depth);
    }
  };

  const depthOptions: Array<{
    depth: ResearchDepth;
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      depth: "QUICK",
      title: "Quick Scan",
      description: "Basic search with limited tools and platforms",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      depth: "STANDARD",
      title: "Standard Analysis",
      description: "More comprehensive search with additional tools",
      icon: <BarChart2 className="h-4 w-4" />,
    },
    {
      depth: "DEEP",
      title: "Deep Research",
      description:
        "Takes more time with expanded search tools and platforms like Reddit",
      icon: <Search className="h-4 w-4" />,
    },
    {
      depth: "EXHAUSTIVE",
      title: "Exhaustive Study",
      description:
        "Takes the most time with all search tools and platforms including Reddit, X, and more",
      icon: <Layers className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {showButton && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Choose Research Depth</h3>
          <p className="text-sm text-gray-600">
            Select how comprehensive you want your SaaS validation research to
            be.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {depthOptions.map((option) => (
          <div
            key={option.depth}
            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all ${
              selectedDepth === option.depth
                ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
            onClick={() => !disabled && handleDepthChange(option.depth)}
          >
            <div className="flex-shrink-0">{option.icon}</div>
            <div className="flex-grow">
              <div className="font-medium">{option.title}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </div>
            </div>
            {selectedDepth === option.depth && (
              <Badge variant="secondary" className="ml-auto">
                Selected
              </Badge>
            )}
          </div>
        ))}
      </div>

      {showButton && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            <strong>Selected:</strong>{" "}
            {depthOptions.find((o) => o.depth === selectedDepth)?.title}
            <br />
            <span className="text-xs">
              This will conduct real web research for up-to-date market data
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
