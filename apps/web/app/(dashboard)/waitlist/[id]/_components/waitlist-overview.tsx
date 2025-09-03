"use client";

import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useWaitlistTable } from "./use-waitlist-table";
import {
  WaitlistTableToolbar,
  WaitlistTablePagination,
  WaitlistTableSkeleton,
  WaitlistTableNoData,
} from "./waitlist-table-components";

interface WaitlistOverviewProps {
  waitlistId: string;
}

export default function WaitlistOverview({
  waitlistId,
}: WaitlistOverviewProps) {
  const {
    table,
    data,
    isLoading,
    isFetching,
    globalFilter,
    setGlobalFilter,
    statusFilter,
    setStatusFilter,
    selectedEntryIds,
    handleBulkInvite,
    handleExportCSV,
    isUpdating,
  } = useWaitlistTable(waitlistId);

  const handleRowClick = (entry: any) => {
    // Handle row click - could navigate to detail view or open sheet
    console.log("Row clicked:", entry);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Toolbar */}
      <WaitlistTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedEntryIds={selectedEntryIds}
        onBulkInvite={handleBulkInvite}
        onExportCSV={handleExportCSV}
        isUpdating={isUpdating}
      />

      {/* Modern Clean TanStack Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn("transition-colors duration-200")}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching && !table.getRowModel().rows?.length ? (
              <WaitlistTableSkeleton />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "group cursor-pointer hover:bg-muted/50 transition-colors duration-200",
                    row.getIsSelected() && "bg-muted"
                  )}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    // Allow selection checkbox clicks without row selection
                    if (
                      !(e.target as HTMLElement).closest('[role="checkbox"]')
                    ) {
                      handleRowClick(row.original);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="transition-colors duration-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  <WaitlistTableNoData
                    searchQuery={globalFilter}
                    statusFilter={statusFilter}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      <WaitlistTablePagination table={table} data={data as any} />

      {/* Loading indicator for background fetching */}
      {isFetching && table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating...
          </div>
        </div>
      )}
    </div>
  );
}
