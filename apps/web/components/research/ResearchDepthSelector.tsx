"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ResearchValidationButton } from "./ResearchValidationButton";
import type { ResearchDepth } from "@/types/research";
import { RESEARCH_DEPTHS } from "@/lib/config/researchConfig";

interface ResearchDepthSelectorProps {
  ideaId: string;
  disabled?: boolean;
}

export function ResearchDepthSelector({
  ideaId,
  disabled = false,
}: ResearchDepthSelectorProps) {
  const [selectedDepth, setSelectedDepth] = useState<ResearchDepth>("STANDARD");

  const depthOptions: Array<{
    depth: ResearchDepth;
    title: string;
    description: string;
    duration: string;
    phases: number;
    cost: string;
  }> = [
    {
      depth: "QUICK",
      title: "Quick Scan",
      description: "Basic market overview and competitive landscape",
      duration: "2-5 minutes",
      phases: RESEARCH_DEPTHS.QUICK.phases.length,
      cost: `$${RESEARCH_DEPTHS.QUICK.costEstimate.toFixed(2)}`,
    },
    {
      depth: "STANDARD",
      title: "Standard Analysis",
      description: "Comprehensive market, competitive, and customer analysis",
      duration: "5-10 minutes",
      phases: RESEARCH_DEPTHS.STANDARD.phases.length,
      cost: `$${RESEARCH_DEPTHS.STANDARD.costEstimate.toFixed(2)}`,
    },
    {
      depth: "DEEP",
      title: "Deep Research",
      description: "Detailed analysis including business model and financials",
      duration: "10-15 minutes",
      phases: RESEARCH_DEPTHS.DEEP.phases.length,
      cost: `$${RESEARCH_DEPTHS.DEEP.costEstimate.toFixed(2)}`,
    },
    {
      depth: "EXHAUSTIVE",
      title: "Exhaustive Study",
      description:
        "Complete analysis with risk assessment and technical feasibility",
      duration: "15-30 minutes",
      phases: RESEARCH_DEPTHS.EXHAUSTIVE.phases.length,
      cost: `$${RESEARCH_DEPTHS.EXHAUSTIVE.costEstimate.toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Research Depth</h3>
        <p className="text-sm text-gray-600">
          Select how comprehensive you want your SaaS validation research to be.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {depthOptions.map((option) => (
          <Card
            key={option.depth}
            className={`cursor-pointer transition-all ${
              selectedDepth === option.depth
                ? "ring-2 ring-blue-500 border-blue-500"
                : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedDepth(option.depth)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{option.title}</CardTitle>
                <Badge variant="secondary">{option.cost}</Badge>
              </div>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{option.duration}</span>
                <span>{option.phases} phases</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          <strong>Selected:</strong>{" "}
          {depthOptions.find((o) => o.depth === selectedDepth)?.title}
          <br />
          <span className="text-xs">
            This will conduct real web research using Exa for up-to-date market
            data
          </span>
        </div>
        <ResearchValidationButton
          ideaId={ideaId}
          depth={selectedDepth}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
