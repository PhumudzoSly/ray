"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as waitlistActions from "@/actions/waitlist";
import * as waitlistEntryActions from "@/actions/waitlist/entries";
import { api } from "@workspace/backend";
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
import {
  Search,
  MoreHorizontal,
  Mail,
  Trash2,
  Download,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  UserCheck,
  UserX,
  ExternalLink,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import PageHeader from "@/components/shared/page-header";
import { format } from "date-fns";
import Link from "next/link";
import Header from "@/components/shared/header";

export default function WaitlistManagePage() {
  const { id } = useParams();
  const { token } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Mutations
  const updateEntryStatusMutation = useMutation({
    mutationFn: async ({ entryId, status }: { entryId: string; status: string }) =>
      waitlistEntryActions.updateWaitlistEntry(entryId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waitlistEntries", id] }),
  });
  const deleteWaitlistEntryMutation = useMutation({
    mutationFn: async ({ entryId }: { entryId: string }) =>
      waitlistEntryActions.deleteWaitlistEntry(entryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waitlistEntries", id] }),
  });

  // Fetch waitlist data
  const { data: waitlistResult } = useQuery({
    queryKey: ["waitlist", id],
    queryFn: async () => {
      const res = await waitlistActions.getWaitlist(id);
      return res.success ? res.data : null;
    },
    enabled: !!id,
  });
  const waitlist = waitlistResult;

  // Fetch waitlist entries
  const { data: entriesResult } = useQuery({
    queryKey: ["waitlistEntries", id, statusFilter],
    queryFn: async () => {
      const res = await waitlistEntryActions.getAllWaitlistEntries(id);
      return res.success ? res.data : [];
    },
    enabled: !!id,
  });
  const entries = entriesResult || [];

  // Fetch analytics
  const { data: analyticsResult } = useQuery({
    queryKey: ["waitlistAnalytics", id],
    queryFn: async () => {
      const res = await waitlistActions.getWaitlistAnalytics(id);
      return res.success ? res.data : null;
    },
    enabled: !!id,
  });
  const analytics = analyticsResult;

  if (!waitlist) {
    return <div>Loading...</div>;
  }

  const filteredEntries = entries.filter(
    (entry) =>
      entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (entryId: string, newStatus: string) => {
    try {
      await updateEntryStatusMutation.mutateAsync({ entryId, status: newStatus });
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
      ["Email", "Name", "Status", "Position", "Referrals", "Joined Date"],
      ...filteredEntries.map((entry) => [
        entry.email,
        entry.name || "",
        entry.status,
        entry.position.toString(),
        entry.referralCount.toString(),
        format(new Date(entry.createdAt), "yyyy-MM-dd"),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${waitlist.name}-waitlist.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "verified":
        return <Badge variant="default">Verified</Badge>;
      case "invited":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Invited
          </Badge>
        );
      case "joined":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
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
    <>
      <Header
        crumb={[
          { title: "Waitlist", url: "/waitlist" },
          { title: "Manage waitlist", url: `/waitlist/${id}` },
        ]}
      >
        {null}
      </Header>
      <div className="p-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{waitlist.name}</h1>
            <p className="text-muted-foreground mt-1">{waitlist.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Project:</span>
              <span className="text-sm font-medium">
                {waitlist.project?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/wl/${waitlist.slug}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Total Entries
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {analytics.totalEntries}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Total Referrals
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {analytics.totalReferrals}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Recent Signups
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {analytics.recentEntries}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Conversion Rate
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {analytics.conversionRate.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("verified")}>
                  Verified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("invited")}>
                  Invited
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("joined")}>
                  Joined
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            {selectedEntries.length > 0 && (
              <Button onClick={handleBulkInvite} size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Invite Selected ({selectedEntries.length})
              </Button>
            )}
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEntries.length === filteredEntries.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEntries(filteredEntries.map((e) => e._id));
                      } else {
                        setSelectedEntries([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEntries.includes(entry._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEntries([...selectedEntries, entry._id]);
                        } else {
                          setSelectedEntries(
                            selectedEntries.filter((id) => id !== entry._id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">#{entry.position}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{entry.email}</div>
                  </TableCell>
                  <TableCell>
                    <div>{entry.name || "-"}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <div className="text-center">{entry.referralCount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(entry._id, "invited")
                          }
                          disabled={entry.status === "invited"}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(entry._id, "joined")
                          }
                          disabled={entry.status === "joined"}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Mark as Joined
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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
            <div className="text-center py-8 text-muted-foreground">
              No entries found
            </div>
          )}
        </div>
      </div>
    </>
  );
}
