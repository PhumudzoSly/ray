"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";

interface FeatureMatrixTableProps {
  features?: string[] | null;
  tiers?: {
    id: string;
    tierName: string;
    tierFeatures: string[];
  }[] | null;
}

export function FeatureMatrixTable({ features = [], tiers = [] }: FeatureMatrixTableProps) {
  if (!features || features.length === 0 || !tiers || tiers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No feature matrix data available
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Feature</TableHead>
            {tiers.map(tier => (
              <TableHead key={tier.id} className="text-center">
                {tier.tierName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature, featureIndex) => (
            <TableRow key={featureIndex}>
              <TableCell className="font-medium">{feature}</TableCell>
              {tiers.map(tier => {
                const hasFeature = tier.tierFeatures.includes(feature);
                return (
                  <TableCell key={tier.id} className="text-center">
                    {hasFeature ? (
                      <Badge variant="default" className="mx-auto">✓</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}