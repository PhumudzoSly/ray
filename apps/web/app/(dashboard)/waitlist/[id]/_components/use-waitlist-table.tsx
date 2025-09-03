"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { queryKeys } from "@/lib/query-keys";
import * as waitlistEntryActions from "@/actions/waitlist/entries";
import { useSession } from "@/context/session-context";
import { useDebounce } from "@/hooks/use-debounce";
import {
  createWaitlistTableColumns,
  type WaitlistEntry,
} from "./waitlist-table-columns";
import { toast } from "sonner";

export const useWaitlistTable = (waitlistId: string) => {
  const { org } = useSession();
  const queryClient = useQueryClient();

  // Table state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "position", desc: false },
  ]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Debounce search query
  const debouncedSearchQuery = useDebounce(globalFilter, 300);

  // Check if we have active filters
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") ||
        (statusFilter && statusFilter !== "all")
    );
  }, [debouncedSearchQuery, statusFilter]);

  // Data fetching
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: queryKeys.filteredWaitlistEntries(
      waitlistId,
      debouncedSearchQuery || undefined,
      statusFilter !== "all" ? statusFilter : undefined,
      pagination.pageIndex + 1, // Convert to 1-based page
      pagination.pageSize,
      sorting[0]?.id,
      sorting[0]?.desc ? "desc" : "asc"
    ),
    queryFn: async () => {
      const result = await waitlistEntryActions.getFilteredWaitlistEntries({
        waitlistId,
        search: debouncedSearchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      });
      if (!result.success || !result.data) {
        throw new Error("Failed to fetch waitlist entries");
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData, // New v5 API for keepPreviousData
    staleTime: 30000, // 30 seconds
  });

  // Mutations
  const updateEntryStatusMutation = useMutation({
    mutationFn: waitlistEntryActions.updateEntryStatus,
    onSuccess: () => {
      // Invalidate current query
      queryClient.invalidateQueries({
        queryKey: queryKeys.filteredWaitlistEntries(
          waitlistId,
          debouncedSearchQuery || undefined,
          statusFilter !== "all" ? statusFilter : undefined,
          pagination.pageIndex + 1,
          pagination.pageSize,
          sorting[0]?.id,
          sorting[0]?.desc ? "desc" : "asc"
        ),
      });
      // Also invalidate analytics
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistAnalytics(waitlistId),
      });
      // And main waitlists query
      queryClient.invalidateQueries({
        queryKey: ["waitlists", org],
      });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const deleteWaitlistEntryMutation = useMutation({
    mutationFn: waitlistEntryActions.deleteWaitlistEntry,
    onSuccess: () => {
      // Invalidate current query
      queryClient.invalidateQueries({
        queryKey: queryKeys.filteredWaitlistEntries(
          waitlistId,
          debouncedSearchQuery || undefined,
          statusFilter !== "all" ? statusFilter : undefined,
          pagination.pageIndex + 1,
          pagination.pageSize,
          sorting[0]?.id,
          sorting[0]?.desc ? "desc" : "asc"
        ),
      });
      // Also invalidate analytics
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistAnalytics(waitlistId),
      });
      // And main waitlists query
      queryClient.invalidateQueries({
        queryKey: ["waitlists", org],
      });
      toast.success("Entry deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete entry");
    },
  });

  // Action handlers
  const handleStatusChange = async (entryId: string, status: string) => {
    await updateEntryStatusMutation.mutateAsync({ entryId, status });
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteWaitlistEntryMutation.mutateAsync(entryId);
  };

  const handleBulkInvite = async () => {
    const selectedIds = Object.keys(rowSelection).filter(
      (id) => rowSelection[id]
    );
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((entryId) =>
          updateEntryStatusMutation.mutateAsync({ entryId, status: "invited" })
        )
      );
      toast.success(`Invited ${selectedIds.length} users`);
      setRowSelection({});
    } catch (error) {
      toast.error("Failed to send invites");
    }
  };

  const handleExportCSV = () => {
    const entries = (data as any)?.entries || [];
    const csvData = [
      [
        "Email",
        "Name",
        "Status",
        "Position",
        "Referrals",
        "Joined Date",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
      ],
      ...entries.map((entry: WaitlistEntry) => [
        entry.email,
        entry.name || "",
        entry.status,
        entry.position.toString(),
        entry._count.referrals.toString(),
        entry.joinedAt || "",
        entry.utmSource || "",
        entry.utmMedium || "",
        entry.utmCampaign || "",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-entries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Create columns with handlers
  const columns = createWaitlistTableColumns(
    handleStatusChange,
    handleDeleteEntry
  );

  // Create table instance
  const table = useReactTable({
    data: (data as any)?.entries || [],
    columns,
    pageCount: (data as any)?.pagination?.totalPages ?? -1,
    state: {
      pagination,
      sorting,
      globalFilter,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: true,
  });

  const selectedEntryIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id]
  );

  return {
    table,
    data,
    isLoading,
    isFetching,
    error,
    pagination,
    sorting,
    globalFilter,
    setGlobalFilter,
    statusFilter,
    setStatusFilter,
    rowSelection,
    selectedEntryIds,
    handleStatusChange,
    handleDeleteEntry,
    handleBulkInvite,
    handleExportCSV,
    isUpdating: updateEntryStatusMutation.isPending,
    isDeleting: deleteWaitlistEntryMutation.isPending,
  };
};
