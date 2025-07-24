"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Input } from "@workspace/ui/components/input";
import { updateFeatureRequest } from "@/actions/roadmap/feature-requests";
import { Eye, Filter } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import NoData from "@/components/shared/no-data";
import { FeatureRequestsFilters } from "./feature-requests-filters";
import { FeatureRequestPrioritySelector } from "@/components/ui/selectors/feature-request-priority-selector";
import { FeatureRequestStatusSelector } from "@/components/ui/selectors/feature-request-status-selector";
import { FeatureRequestCategorySelector } from "@/components/ui/selectors/feature-request-category-selector";
import { Separator } from "@workspace/ui/components/separator";

interface FeatureRequestsTableProps {
  featureRequests: any[];
  onViewRequest: (request: any) => void;
  roadmapId: string;
}

export function FeatureRequestsTable({
  featureRequests,
  onViewRequest,
  roadmapId,
}: FeatureRequestsTableProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    category: "",
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateFeatureRequest(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["featureRequests", roadmapId],
      });

      // Snapshot the previous value
      const previousFeatureRequests = queryClient.getQueryData([
        "featureRequests",
        roadmapId,
      ]);

      // Optimistically update the feature request in the list
      queryClient.setQueryData(["featureRequests", roadmapId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((fr: any) =>
            fr.id === id ? { ...fr, ...data } : fr
          ),
        };
      });

      // Also update the individual feature request data if it exists
      queryClient.setQueryData(["featureRequest", id], (old: any) =>
        old ? { ...old, ...data } : old
      );

      // Return a context object with the snapshotted value
      return { previousFeatureRequests };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFeatureRequests) {
        queryClient.setQueryData(
          ["featureRequests", roadmapId],
          context.previousFeatureRequests
        );
      }
      toast.error("Failed to update feature request");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["featureRequests", roadmapId],
      });
    },
  });

  // Filter feature requests based on search and filters
  const filteredRequests = featureRequests.filter((request) => {
    const matchesSearch =
      !filters.search ||
      request.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.description
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      request.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesPriority =
      !filters.priority || request.priority === filters.priority;
    const matchesCategory =
      !filters.category || request.category === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleInlineEdit = (id: string, field: string, value: string) => {
    updateMutation.mutate({
      id,
      data: { [field]: value },
    });
  };

  if (featureRequests.length === 0) {
    return (
      <NoData
        title="No Feature Requests"
        description="No feature requests have been submitted for this roadmap yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Feature Requests</h2>
            <p className="text-muted-foreground">
              Manage and review feature requests from your community
            </p>
          </div>
        </div>

        {/* Filters */}
        <FeatureRequestsFilters onFiltersChange={setFilters} />
      </div>
      <Separator />
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredRequests.length} of {featureRequests.length} feature
        requests
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Filter className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No requests match your filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {request.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <FeatureRequestCategorySelector
                      category={request.category}
                      onChange={(value) =>
                        handleInlineEdit(request.id, "category", value)
                      }
                      disabled={false}
                    />
                  </TableCell>
                  <TableCell>
                    <FeatureRequestStatusSelector
                      status={request.status}
                      onChange={(value) =>
                        handleInlineEdit(request.id, "status", value)
                      }
                      disabled={false}
                    />
                  </TableCell>
                  <TableCell>
                    <FeatureRequestPrioritySelector
                      priority={request.priority}
                      onChange={(value) =>
                        handleInlineEdit(request.id, "priority", value)
                      }
                      disabled={false}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {request.name || "Anonymous"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewRequest(request)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
