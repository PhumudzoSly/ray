"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useWaitlistAnalytics } from "@/hooks/use-waitlist-analytics";
import { MetricCard } from "@/components/waitlist/analytics-metrics";

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

  // Mutations
  const updateEntryStatusMutation = useMutation({
    mutationFn: waitlistEntryActions.updateEntryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistAnalytics(waitlistId),
      });
    },
  });

  const deleteWaitlistEntryMutation = useMutation({
    mutationFn: waitlistEntryActions.deleteWaitlistEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlistAnalytics(waitlistId),
      });
    },
  });

  if (analyticsLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Filter entries based on search and status
  const filteredEntries = analytics.entries.filter((entry) => {
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
      ...filteredEntries.map((entry) => [
        entry.email,
        entry.name || "",
        entry.status,
        entry.position.toString(),
        entry.referralCount.toString(),
        entry.joinedAt || "",
        entry.utmSource || "",
        entry.utmMedium || "",
        entry.utmCampaign || "",
        "",
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
      {/* Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          title="Total Entries"
          value={analytics.totalEntries}
          subtitle={`+${analytics.recentEntries} this week`}
        />

        <MetricCard
          icon={CheckCircle}
          title="Verified"
          value={analytics.verifiedCount}
          subtitle={`${analytics.verificationRate}% verified`}
        />

        <MetricCard
          icon={Share2}
          title="Referrals"
          value={analytics.totalReferrals}
          subtitle={`${analytics.avgReferralsPerUser.toFixed(1)} avg per user`}
        />

        <MetricCard
          icon={Target}
          title="Conversion"
          value={`${analytics.overallConversionRate.toFixed(1)}%`}
          subtitle={`${analytics.joinedCount} joined`}
        />
      </div>

      {/* Controls */}
      <Card className="p-4">
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
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-input bg-background px-3 py-2 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="invited">Invited</option>
                <option value="joined">Joined</option>
                <option value="bounced">Bounced</option>
              </select>
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
      </Card>

      {/* Entries Table */}
      <Card>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredEntries.length > 0 &&
                      selectedEntries.length === filteredEntries.length
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
              {filteredEntries.map((entry) => (
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
                            onClick={() =>
                              handleStatusChange(entry.id, "invited")
                            }
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invite
                          </DropdownMenuItem>
                        )}
                        {entry.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(entry.id, "verified")
                            }
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
        </div>
      </Card>
    </div>
  );
}
