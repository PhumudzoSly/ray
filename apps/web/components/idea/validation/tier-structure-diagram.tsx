"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

interface TierStructureDiagramProps {
  tiers?:
    | {
        id: string;
        tierName: string;
        tierPrice: number;
        targetSegment: string;
      }[]
    | null;
}

export function TierStructureDiagram({
  tiers = [],
}: TierStructureDiagramProps) {
  if (!tiers || tiers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No pricing tier data available
      </div>
    );
  }

  // Sort tiers by price
  const sortedTiers = [...tiers].sort((a, b) => a.tierPrice - b.tierPrice);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-full">
        {/* Tier blocks */}
        <div className="flex justify-between items-end h-48">
          {sortedTiers.map((tier, index) => (
            <div
              key={tier.id}
              className="flex flex-col items-center relative"
              style={{ width: `${100 / sortedTiers.length}%` }}
            >
              {/* Tier block */}
              <div className="bg-primary text-primary-foreground rounded-t-lg p-3 w-full text-center">
                <div className="font-medium">{tier.tierName}</div>
                <div className="text-sm">${tier.tierPrice.toFixed(2)}</div>
              </div>

              {/* Connector line */}
              {index < sortedTiers.length - 1 && (
                <div className="absolute right-0 top-1/2 w-1/2 h-0.5 bg-muted-foreground transform translate-x-1/2"></div>
              )}

              {/* Target segment label */}
              <div className="mt-2 text-xs text-muted-foreground text-center">
                {tier.targetSegment}
              </div>
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-4">
          <div className="text-xs text-muted-foreground">Basic</div>
          <div className="text-xs text-muted-foreground">Premium</div>
        </div>
      </div>
    </div>
  );
}
