"use client";

import { type JSX } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Check,
  Clock,
  AlertTriangle,
  Rocket,
  Beaker,
  Building,
  Filter,
  Eye,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Progress } from "@workspace/ui/components/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { formatDistanceToNow, format } from "date-fns";
import { TbProgress } from "react-icons/tb";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { useData } from "@/hooks/use-data";
import NoData from "@/components/shared/no-data";
import { Doc } from "@workspace/backend";
import Link from "next/link";

export function IdeasTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");
  const perPage = Number(searchParams.get("per_page") || "10");
  const sort = searchParams.get("sort") || "._creationTime";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";
  const status = searchParams.get("status") || "";
  const industry = searchParams.get("industry") || "";
  const search = searchParams.get("search") || "";

  const {
    data: allIdeas,
    isPending,
    isError,
  } = useData(api.idea.getIdeas, {
    token: useSession().token,
  });

  // Filter ideas based on search params
  const filteredIdeas =
    allIdeas?.filter((idea) => {
      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          idea.name.toLowerCase().includes(searchLower) ||
          idea.description?.toLowerCase().includes(searchLower) ||
          idea.problemSolved?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filter by status
      if (status && idea.status !== status) return false;

      // Filter by industry
      if (industry && idea.industry !== industry) return false;

      return true;
    }) || [];

  // Apply sorting
  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    let comparison = 0;

    switch (sort) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "industry":
        comparison = (a.industry || "").localeCompare(b.industry || "");
        break;
      case "status":
        comparison = (a.status || "").localeCompare(b.status || "");
        break;
      case "._creationTime":
        comparison = (a._creationTime || 0) - (b._creationTime || 0);
        break;
      default:
        // Default sorting by creation time
        comparison = (a._creationTime || 0) - (b._creationTime || 0);
    }

    return order === "asc" ? comparison : -comparison;
  });

  // Apply pagination
  const startIndex = (page - 1) * perPage;
  const paginatedIdeas = sortedIdeas.slice(startIndex, startIndex + perPage);
  const totalPages = Math.ceil(sortedIdeas.length / perPage);

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams);

    if (sort === column) {
      params.set("order", order === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", column);
      params.set("order", "desc");
    }

    router.push(`/ideas?${params.toString()}`);
  };

  const getSortIcon = (column: string) => {
    if (sort !== column) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return order === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const getStatusInfo = (
    idea: Doc<"idea">
  ): { icon: JSX.Element; badge: JSX.Element; progress: number } => {
    const progress = idea.aiOverallValidation?.overallRating || 0;

    switch (idea.status) {
      case "VALIDATED":
        return {
          icon: <Check className="h-4 w-4 text-green-500" />,
          badge: <Badge variant="success">Validated</Badge>,
          progress,
        };
      case "FAILED":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
          badge: <Badge variant="destructive">Failed</Badge>,
          progress,
        };
      case "IN_PROGRESS":
        return {
          icon: <Beaker className="h-4 w-4 text-blue-500" />,
          badge: <Badge variant="default">In Progress</Badge>,
          progress,
        };
      case "LAUNCHED":
        return {
          icon: <Rocket className="h-4 w-4 text-purple-500" />,
          badge: (
            <Badge
              variant="success"
              className="bg-purple-500/10 text-purple-500 border-purple-500/20"
            >
              Launched
            </Badge>
          ),
          progress,
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-muted-foreground" />,
          badge: <Badge variant="secondary">Unvalidated</Badge>,
          progress,
        };
    }
  };

  if (isPending) {
    return <IdeasTableSkeleton />;
  }

  if (filteredIdeas?.length === 0) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <NoData />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <p className="text-muted-foreground">Failed to load ideas</p>
          <Button variant="outline" onClick={() => router.refresh()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40px] [&:has([role=checkbox])]:pl-3">
              #
            </TableHead>
            <TableHead className="min-w-[200px] max-w-[360px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("name")}
              >
                Name {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("industry")}
              >
                <Building color="orange" /> Industry {getSortIcon("industry")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[80px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("status")}
              >
                <Filter color="cyan" /> Status {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px]">
              <div className="flex items-center gap-3">
                <TbProgress color="pink" /> Rating
              </div>
            </TableHead>

            <TableHead className="min-w-[130px]">
              <Button
                variant="ghost"
                className="font-medium p-0 hover:bg-transparent"
                onClick={() => handleSort("createdAt")}
              >
                Created {getSortIcon("createdAt")}
              </Button>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedIdeas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <NoData />
              </TableCell>
            </TableRow>
          ) : (
            paginatedIdeas.map((idea, index) => {
              const statusInfo = getStatusInfo(idea);
              return (
                <TableRow
                  key={idea._id}
                  className="group cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/ideas/${idea._id}`)}
                >
                  <TableCell className="[&:has([role=checkbox])]:pl-3">
                    <Badge>{index + 1}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="size-6">{statusInfo.icon}</div>
                      <div>
                        <span className="hover:underline underline-offset-1">
                          {idea.name}
                        </span>
                        <p className="text-muted-foreground text-sm line-clamp-1">
                          {idea.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {idea.industry}
                    </Badge>
                  </TableCell>
                  <TableCell>{statusInfo.badge}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-2">
                      <Progress value={statusInfo.progress} className="h-2" />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {statusInfo.progress}% Score
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-xs">
                          {formatDistanceToNow(new Date(idea._creationTime), {
                            addSuffix: true,
                          })}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(new Date(idea._creationTime), "PPP")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/ideas/${idea._id}`}
                        className={buttonVariants({
                          size: "icon",
                          variant: "outline",
                        })}
                      >
                        <Eye />
                      </Link>
                      <Button variant={"destructive"} size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function IdeasTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[150px]">Progress</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Metrics</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
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
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[80px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-2 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
