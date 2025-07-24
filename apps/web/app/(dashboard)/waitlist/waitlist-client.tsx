"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllWaitlists, deleteWaitlist } from "@/actions/waitlist";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Badge } from "@workspace/ui/components/badge";
import {
  Settings,
  Plus,
  Trash2,
  Users,
  CheckCircle,
  Share2,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  Mail,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@workspace/ui/components/separator";
import PageHeader from "@/components/shared/page-header";
import { useSession } from "@/context/session-context";
import { NoData } from "@/components/shared";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

export default function WaitlistClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { org } = useSession();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const page = Number(searchParams.get("page") || "1");
  const perPage = Number(searchParams.get("per_page") || "10");
  const sort = searchParams.get("sort") || "name";
  const order = (searchParams.get("order") as "asc" | "desc") || "asc";
  const search = searchParams.get("search") || "";

  // Use the prefetched data from React Query
  const { data: waitlistsResponse, isLoading } = useQuery({
    queryKey: ["waitlists", org],
    queryFn: () => getAllWaitlists(),
    select: (res) => (res?.success ? res.data : []),
  });

  // Delete waitlist mutation
  const deleteWaitlistMutation = useMutation({
    mutationFn: deleteWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlists", org] });
      toast.success("Waitlist deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete waitlist");
    },
  });

  const waitlists = waitlistsResponse || [];

  const handleDeleteWaitlist = async (
    waitlistId: string,
    waitlistName: string
  ) => {
    const isConfirmed = await confirm({
      title: "Delete Waitlist",
      description: `Are you sure you want to delete "${waitlistName}"? This action cannot be undone and will remove all associated entries.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (isConfirmed) {
      deleteWaitlistMutation.mutate(waitlistId);
    }
  };

  // Filter waitlists based on search params
  const filteredWaitlists = waitlists.filter((waitlist: any) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        waitlist.name.toLowerCase().includes(searchLower) ||
        waitlist.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Apply sorting
  const sortedWaitlists = [...filteredWaitlists].sort((a: any, b: any) => {
    let comparison = 0;

    switch (sort) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "entries":
        comparison =
          (a.stats?.totalEntries || 0) - (b.stats?.totalEntries || 0);
        break;
      case "verified":
        comparison =
          (a.stats?.verifiedEntries || 0) - (b.stats?.verifiedEntries || 0);
        break;
      case "referrals":
        comparison =
          (a.stats?.totalReferrals || 0) - (b.stats?.totalReferrals || 0);
        break;
      case "created":
        comparison =
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime();
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }

    return order === "asc" ? comparison : -comparison;
  });

  // Apply pagination
  const startIndex = (page - 1) * perPage;
  const paginatedWaitlists = sortedWaitlists.slice(
    startIndex,
    startIndex + perPage
  );
  const totalPages = Math.ceil(sortedWaitlists.length / perPage);

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams);

    if (sort === column) {
      params.set("order", order === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", column);
      params.set("order", "asc");
    }

    router.push(`/waitlist?${params.toString()}`);
  };

  const getSortIcon = (column: string) => {
    if (sort !== column) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return order === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  if (isLoading) {
    return <WaitlistTableSkeleton />;
  }

  return (
    <div>
      {/* Title and Description Section */}
      <div className="space-y-2 p-4">
        <h1 className="text-3xl font-bold tracking-tight">Waitlists</h1>
        <p className="text-muted-foreground">
          Manage your product waitlists, track signups, and engage with your
          audience before launch.
        </p>
      </div>

      {waitlists && waitlists.length > 0 ? (
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] [&:has([role=checkbox])]:pl-3">
                  #
                </TableHead>
                <TableHead className="min-w-[250px] max-w-[400px]">
                  <Button
                    variant="ghost"
                    className="font-medium p-0 hover:bg-transparent"
                    onClick={() => handleSort("name")}
                  >
                    Waitlist {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <Button
                    variant="ghost"
                    className="font-medium p-0 hover:bg-transparent"
                    onClick={() => handleSort("entries")}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Entries {getSortIcon("entries")}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <Button
                    variant="ghost"
                    className="font-medium p-0 hover:bg-transparent"
                    onClick={() => handleSort("verified")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified {getSortIcon("verified")}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <Button
                    variant="ghost"
                    className="font-medium p-0 hover:bg-transparent"
                    onClick={() => handleSort("referrals")}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Referrals {getSortIcon("referrals")}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[130px]">
                  <Button
                    variant="ghost"
                    className="font-medium p-0 hover:bg-transparent"
                    onClick={() => handleSort("created")}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Created {getSortIcon("created")}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWaitlists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <NoData />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWaitlists.map((waitlist: any, index) => (
                  <TableRow
                    key={waitlist.id}
                    className="group cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/waitlist/${waitlist.id}`)}
                  >
                    <TableCell className="[&:has([role=checkbox])]:pl-3">
                      <Badge>{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="size-6">
                          <Mail className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <span className="hover:underline underline-offset-1">
                            {waitlist.name}
                          </span>
                          <p className="text-muted-foreground text-sm line-clamp-1">
                            {waitlist.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {waitlist.stats?.totalEntries ?? 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          {waitlist.stats?.verifiedEntries ?? 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">
                          {waitlist.stats?.totalReferrals ?? 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-xs">
                            {formatDistanceToNow(
                              new Date(waitlist.createdAt || Date.now()),
                              {
                                addSuffix: true,
                              }
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {format(
                                new Date(waitlist.createdAt || Date.now()),
                                "PPP"
                              )}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/waitlist/${waitlist.id}`}
                          className={buttonVariants({
                            size: "icon",
                            variant: "outline",
                          })}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            handleDeleteWaitlist(waitlist.id, waitlist.name)
                          }
                          disabled={deleteWaitlistMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="mx-auto w-full py-16">
          <NoData />
        </div>
      )}
    </div>
  );
}

function WaitlistTableSkeleton() {
  return (
    <div className="space-y-2">
      {/* Title and Description Section */}
      <div className="p-4">
        <h1 className="text-3xl font-bold tracking-tight">Waitlists</h1>
        <p className="text-muted-foreground">
          Manage your product waitlists, track signups, and engage with your
          audience before launch.
        </p>
      </div>

      <Separator />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[300px]">Waitlist</TableHead>
              <TableHead>Entries</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Referrals</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[250px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[120px]" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
