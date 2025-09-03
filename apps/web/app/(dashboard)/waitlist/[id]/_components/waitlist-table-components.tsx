"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Search,
  Download,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { WaitlistEntry } from "./waitlist-table-columns";

// Table Toolbar Component
interface WaitlistTableToolbarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  selectedEntryIds: string[];
  onBulkInvite: () => void;
  onExportCSV: () => void;
  isUpdating: boolean;
}

export const WaitlistTableToolbar = ({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  selectedEntryIds,
  onBulkInvite,
  onExportCSV,
  isUpdating,
}: WaitlistTableToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search entries..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="joined">Joined</SelectItem>
              <SelectItem value="bounced">Bounced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        {selectedEntryIds.length > 0 && (
          <Button
            onClick={onBulkInvite}
            disabled={isUpdating}
            size="sm"
            variant="outline"
          >
            <Mail className="h-4 w-4 mr-2" />
            Invite Selected ({selectedEntryIds.length})
          </Button>
        )}
        <Button onClick={onExportCSV} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};

// Table Pagination Component
interface WaitlistTablePaginationProps {
  table: Table<WaitlistEntry>;
  data?: {
    pagination?: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    entries?: WaitlistEntry[];
    totalCount?: number;
    hasMore?: boolean;
  };
}

export const WaitlistTablePagination = ({ 
  table, 
  data 
}: WaitlistTablePaginationProps) => {
  const pagination = data?.pagination;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {pagination?.totalCount || 0} row(s) selected.
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {(pagination?.page || 1)} of{" "}
          {pagination?.totalPages || 1}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex((pagination?.totalPages || 1) - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Table Skeleton Loader
export const WaitlistTableSkeleton = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b">
          <td className="p-4">
            <Skeleton className="h-4 w-4" />
          </td>
          <td className="p-4">
            <Skeleton className="h-4 w-12" />
          </td>
          <td className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </td>
          <td className="p-4">
            <Skeleton className="h-4 w-8" />
          </td>
          <td className="p-4">
            <Skeleton className="h-4 w-16" />
          </td>
          <td className="p-4">
            <Skeleton className="h-4 w-20" />
          </td>
          <td className="p-4">
            <Skeleton className="h-6 w-16" />
          </td>
          <td className="p-4">
            <Skeleton className="h-8 w-8" />
          </td>
        </tr>
      ))}
    </>
  );
};

// No Data Component
export const WaitlistTableNoData = ({ 
  searchQuery, 
  statusFilter 
}: { 
  searchQuery: string; 
  statusFilter: string; 
}) => {
  const hasFilters = searchQuery || statusFilter !== "all";

  return (
    <div className="text-center py-8">
      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        No entries found
      </h3>
      <p className="text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your search or filter criteria"
          : "No entries have been added to this waitlist yet"}
      </p>
    </div>
  );
};