"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Button } from "@workspace/ui/components/button";
import { LayoutGrid, List } from "lucide-react";
import React from "react";
import { FeatureCard } from "@/components/project/features/feature-card";

type ViewMode = "list" | "kanban";

interface Feature {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  phase: string;
  project?: any;
  user?: any;
  startDate?: string;
  endDate?: string;
  estimatedEffort?: number;
  businessValue?: number;
}

const AllFeatures = ({ features }: { features: Feature[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  if (!features.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-semibold">No features found</h2>
          <p className="text-muted-foreground">
            Get started by creating your first feature. Features help you track
            major functionality and development progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 my-4">
        <div className="flex items-center gap-2 ">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            disabled
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="text-center py-8 text-muted-foreground">
          Kanban view coming soon...
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Phase</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[100px]">Assigned</TableHead>
                  <TableHead className="w-[120px]">Start Date</TableHead>
                  <TableHead className="w-[120px]">End Date</TableHead>
                  <TableHead className="w-[100px]">Effort</TableHead>
                  <TableHead className="w-[100px]">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature, index) => (
                  <FeatureCard
                    index={index + 1}
                    key={feature?._id}
                    feature={feature}
                    showProject={true}
                  />
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" className="h-3" />
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default AllFeatures;
