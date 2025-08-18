"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";

interface RiskMitigationTableProps {
  riskItems?: {
    id: string;
    category: string;
    description: string;
    impact: number;
    probability: number;
    mitigation: string;
  }[] | null;
}

export function RiskMitigationTable({ riskItems = [] }: RiskMitigationTableProps) {
  // Handle case where there's no risk data
  if (!riskItems || riskItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No risk mitigation data available
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Risk Mitigation Strategies</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Risk</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[100px]">Score</TableHead>
              <TableHead>Mitigation Strategy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riskItems.map((risk) => (
              <TableRow key={risk.id}>
                <TableCell className="font-medium">{risk.description}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    {risk.category}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{(risk.impact * risk.probability * 4).toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">
                    {risk.impact}/5 impact, {risk.probability}/5 probability
                  </div>
                </TableCell>
                <TableCell className="text-sm">{risk.mitigation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}