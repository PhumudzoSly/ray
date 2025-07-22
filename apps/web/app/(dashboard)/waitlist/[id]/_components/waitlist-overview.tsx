"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as waitlistEntryActions from "@/actions/waitlist/entries";
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
import { getWaitlistAnalytics } from "@/actions/waitlist";
import { getAllWaitlistEntries } from "@/actions/waitlist/entries";

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  status: string;
  position: number;
  referralCount: number;
  createdAt: string;
  verifiedAt?: string;
  invitedAt?: string;
  joinedAt?: string;
  ipAddress: string;
  userAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface WaitlistOverviewProps {
  waitlistId: string;
}

export default function WaitlistOverview({
  waitlistId,
}: WaitlistOverviewProps) {
  // Fetch entries data
  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: queryKeys.waitlistEntries(waitlistId),
    queryFn: async () => {
      const result = await getAllWaitlistEntries(waitlistId);
      if (!result.success) {
        throw new Error("Failed to fetch entries");
      }
      return (result.data ?? []).map((entry) => ({
        ...entry,
        name: entry.name ?? undefined,
        userAgent: entry.userAgent ?? undefined,
        utmSource: entry.utmSource ?? undefined,
        utmMedium: entry.utmMedium ?? undefined,
        utmCampaign: entry.utmCampaign ?? undefined,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
        verifiedAt: entry.verifiedAt
          ? entry.verifiedAt.toISOString()
          : undefined,
        invitedAt: entry.invitedAt ? entry.invitedAt.toISOString() : undefined,
        joinedAt: entry.joinedAt ? entry.joinedAt.toISOString() : undefined,
      }));
    },
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: queryKeys.waitlistAnalytics(waitlistId),
    queryFn: async () => {
      const result = await getWaitlistAnalytics(waitlistId);
      if (!result.success) {
        throw new Error("Failed to fetch analytics");
      }
      return (
        result.data ?? {
          totalEntries: 0,
          totalReferrals: 0,
          recentEntries: 0,
        }
      );
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  if (entriesLoading || analyticsLoading || !entries || !analytics) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Mutations
  const updateEntryStatusMutation = useMutation({
    mutationFn: async ({
      entryId,
      status,
    }: {
      entryId: string;
      status: string;
    }) => waitlistEntryActions.updateWaitlistEntry(entryId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistEntries(waitlistId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistAnalytics(waitlistId),
      });
    },
  });

  const deleteWaitlistEntryMutation = useMutation({
    mutationFn: async ({ entryId }: { entryId: string }) =>
      waitlistEntryActions.deleteWaitlistEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistEntries(waitlistId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistAnalytics(waitlistId),
      });
    },
  });

  // Computed analytics
  const computedAnalytics = useMemo(() => {
    const verifiedCount = entries.filter((e) => e.verifiedAt).length;
    const invitedCount = entries.filter(
      (e) => e.status === "invited" || e.status === "joined"
    ).length;
    const joinedCount = entries.filter((e) => e.status === "joined").length;
    const conversionRate =
      analytics.totalEntries > 0
        ? (joinedCount / analytics.totalEntries) * 100
        : 0;

    // Status breakdown
    const statusBreakdown = entries.reduce(
      (acc, entry) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      verifiedCount,
      invitedCount,
      joinedCount,
      conversionRate,
      statusBreakdown,
    };
  }, [entries, analytics.totalEntries]);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      await deleteWaitlistEntryMutation.mutateAsync({ entryId });
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
        "IP Address",
      ],
      ...filteredEntries.map((entry) => [
        entry.email,
        entry.name || "",
        entry.status,
        entry.position.toString(),
        entry.referralCount.toString(),
        format(new Date(entry.createdAt), "yyyy-MM-dd"),
        entry.utmSource || "",
        entry.utmMedium || "",
        entry.utmCampaign || "",
        entry.ipAddress || "",
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-entries.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "verified":
        return (
          <Badge variant="default">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case "invited":
        return (
          <Badge variant="outline">
            <Mail className="mr-1 h-3 w-3" />
            Invited
          </Badge>
        );
      case "joined":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <UserCheck className="mr-1 h-3 w-3" />
            Joined
          </Badge>
        );
      case "bounced":
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[280px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === "all" ? "All Status" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All ({analytics.totalEntries})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending ({computedAnalytics.statusBreakdown.pending || 0})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("verified")}>
                Verified ({computedAnalytics.statusBreakdown.verified || 0})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("invited")}>
                Invited ({computedAnalytics.statusBreakdown.invited || 0})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("joined")}>
                Joined ({computedAnalytics.statusBreakdown.joined || 0})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {selectedEntries.length > 0 && (
            <Button onClick={handleBulkInvite} size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Invite {selectedEntries.length}
            </Button>
          )}
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={
                    selectedEntries.length === filteredEntries.length &&
                    filteredEntries.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEntries(filteredEntries.map((e) => e.id));
                    } else {
                      setSelectedEntries([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Position
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                Referrals
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Source
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Joined
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry, index) => (
              <TableRow
                key={entry.id}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="pl-4">
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
                <TableCell>
                  <div className="font-mono text-sm font-medium text-muted-foreground">
                    #{entry.position}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{entry.email}</div>
                    {entry.name && (
                      <div className="text-xs text-muted-foreground">
                        {entry.name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(entry.status)}</TableCell>
                <TableCell className="text-center">
                  <div className="font-medium text-sm">
                    {entry.referralCount}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {entry.utmSource ? (
                      <Badge variant="outline" className="text-xs">
                        {entry.utmSource}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Direct
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(entry.createdAt), "MMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(entry.id, "invited")}
                        disabled={entry.status === "invited"}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Invite
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(entry.id, "joined")}
                        disabled={entry.status === "joined"}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Mark as Joined
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredEntries.length === 0 && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">No entries found</p>
          </div>
        )}
      </div>
    </div>
  );
}
