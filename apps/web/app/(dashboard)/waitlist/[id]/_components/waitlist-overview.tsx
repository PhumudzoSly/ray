"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as waitlistEntryActions from "@/actions/waitlist/entries";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Card } from "@workspace/ui/components/card";
import {
  Search,
  MoreHorizontal,
  Mail,
  Trash2,
  Download,
  UserCheck,
  Filter,
  Users,
  Share2,
  CheckCircle,
  Clock,
  Target,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { queryKeys } from "@/lib/query-keys";
import {
  useWaitlistAnalytics,
  type WaitlistAnalyticsData,
  type FilteredWaitlistEntriesData,
} from "@/hooks/use-waitlist-analytics";
import { useDebounce } from "@/hooks/use-debounce";
import { MetricCard } from "@/components/waitlist/analytics-metrics";

// Define the entry type based on the analytics data structure
type WaitlistEntry = WaitlistAnalyticsData["entries"][0];

interface WaitlistOverviewProps {
  waitlistId: string;
}

export default function WaitlistOverview({
  waitlistId,
}: WaitlistOverviewProps) {
  const { data: analytics, isLoading: analyticsLoading } =
    useWaitlistAnalytics(waitlistId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { org } = useSession();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Check if we have active filters (only search and status)
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") ||
        (statusFilter && statusFilter !== "all")
    );
  }, [debouncedSearchQuery, statusFilter]);

  // Only use filtered entries hook when we have active filters
  const { data: filteredData, isLoading: filteredLoading } = useQuery({
    queryKey: queryKeys.filteredWaitlistEntries(
      waitlistId,
      hasActiveFilters ? debouncedSearchQuery : undefined,
      hasActiveFilters && statusFilter !== "all" ? statusFilter : undefined,
      100,
      0
    ),
    queryFn: async () => {
      const result = await waitlistEntryActions.getFilteredWaitlistEntries({
        waitlistId,
        search: debouncedSearchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        limit: 100,
        offset: 0,
      });
      if (!result.success || !result.data) {
        throw new Error("Failed to fetch filtered entries");
      }
      return result.data.entries;
    },
    enabled: hasActiveFilters,
  });

  // Use analytics data when no filters are applied, filtered data when filters are active
  const entries = useMemo(() => {
    let rawEntries;
    if (hasActiveFilters) {
      rawEntries = filteredData?.entries || [];
    } else {
      rawEntries = analytics?.entries || [];
    }

    // Convert Map to array if needed
    if (
      rawEntries &&
      typeof rawEntries === "object" &&
      "map" in rawEntries &&
      typeof rawEntries.map === "function"
    ) {
      // If it's a Map-like object, convert to array
      return Array.from(
        rawEntries.map
          ? rawEntries.map((entry: WaitlistEntry, index: number) => entry)
          : []
      );
    }

    // If it's already an array, return as is
    return Array.isArray(rawEntries) ? rawEntries : [];
  }, [hasActiveFilters, filteredData?.entries, analytics?.entries]);

  const isLoading = analyticsLoading || (hasActiveFilters && filteredLoading);

  // Mutations
  const updateEntryStatusMutation = useMutation({
    mutationFn: waitlistEntryActions.updateEntryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistAnalytics(waitlistId),
      });
      if (hasActiveFilters) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.filteredWaitlistEntries(
            waitlistId,
            debouncedSearchQuery,
            statusFilter !== "all" ? statusFilter : undefined,
            100,
            0
          ),
        });
      }
      // Also invalidate the main waitlists query to update the verified count
      queryClient.invalidateQueries({
        queryKey: ["waitlists", org],
      });
    },
  });

  const deleteWaitlistEntryMutation = useMutation({
    mutationFn: waitlistEntryActions.deleteWaitlistEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistAnalytics(waitlistId),
      });
      if (hasActiveFilters) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.filteredWaitlistEntries(
            waitlistId,
            debouncedSearchQuery,
            statusFilter !== "all" ? statusFilter : undefined,
            100,
            0
          ),
        });
      }
      // Also invalidate the main waitlists query to update the counts
      queryClient.invalidateQueries({
        queryKey: ["waitlists", org],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const handleStatusChange = async (entryId: string, newStatus: string) => {
    try {
      await updateEntryStatusMutation.mutateAsync({
        entryId,
        status: newStatus,
      });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteWaitlistEntryMutation.mutateAsync(entryId);
      toast.success("Entry deleted successfully");
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const handleBulkInvite = async () => {
    try {
      await Promise.all(
        selectedEntries.map((entryId) =>
          updateEntryStatusMutation.mutateAsync({ entryId, status: "invited" })
        )
      );
      toast.success(`Invited ${selectedEntries.length} users`);
      setSelectedEntries([]);
    } catch (error) {
      toast.error("Failed to send invites");
    }
  };

  const handleExportCSV = () => {
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
        entry.referralCount.toString(),
        entry.joinedAt || "",
        entry.utmSource || "",
        entry.utmMedium || "",
        entry.utmCampaign || "",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-entries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "verified":
        return <Badge variant="default">Verified</Badge>;
      case "invited":
        return <Badge variant="outline">Invited</Badge>;
      case "joined":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Joined</Badge>
        );
      case "bounced":
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          {selectedEntries.length > 0 && (
            <Button
              onClick={handleBulkInvite}
              disabled={updateEntryStatusMutation.isPending}
              size="sm"
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              Invite Selected ({selectedEntries.length})
            </Button>
          )}
          <Button onClick={handleExportCSV} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Entries Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  entries.length > 0 &&
                  selectedEntries.length === entries.length
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedEntries(entries.map((e: WaitlistEntry) => e.id));
                  } else {
                    setSelectedEntries([]);
                  }
                }}
              />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Referrals</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry: WaitlistEntry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <Checkbox
                  checked={selectedEntries.includes(entry.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEntries([...selectedEntries, entry.id]);
                    } else {
                      setSelectedEntries(
                        selectedEntries.filter((id) => id !== entry.id)
                      );
                    }
                  }}
                />
              </TableCell>
              <TableCell className="font-medium">{entry.email}</TableCell>
              <TableCell>{entry.name || "-"}</TableCell>
              <TableCell>{getStatusBadge(entry.status)}</TableCell>
              <TableCell>#{entry.position}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  {entry.referralCount}
                </div>
              </TableCell>
              <TableCell>
                {entry.joinedAt
                  ? format(new Date(entry.joinedAt), "MMM d, yyyy")
                  : "-"}
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground capitalize">
                  {entry.utmSource || "direct"}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {entry.status === "verified" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(entry.id, "invited")}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invite
                      </DropdownMenuItem>
                    )}
                    {entry.status === "pending" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(entry.id, "verified")}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Mark Verified
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* No results message */}
      {!isLoading && entries.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No entries found
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No entries have been added to this waitlist yet"}
          </p>
        </div>
      )}
    </div>
  );
}
