"use client";

import { createColumnHelper, type ColumnMeta } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  MoreHorizontal,
  Mail,
  Trash2,
  UserCheck,
  Share2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { format } from "date-fns";
import crypto from "crypto";
import { cn } from "@/lib/utils";

// Column meta interface
interface WaitlistColumnMeta {
  className?: string;
}

// Define the waitlist entry type
export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string | null;
  status: string;
  position: number;
  _count: {
    referrals: number;
  };
  verifiedAt?: string | null;
  invitedAt?: string | null;
  joinedAt?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  createdAt: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<WaitlistEntry>();

// Utility functions
const generateGravatarUrl = (email: string, size: number = 32) => {
  const hash = crypto
    .createHash("md5")
    .update(email.toLowerCase().trim())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Joined
        </Badge>
      );
    case "bounced":
      return <Badge variant="destructive">Bounced</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Column header with sorting
const DataTableColumnHeader = ({
  column,
  title,
  className,
}: {
  column: any;
  title: string;
  className?: string;
}) => {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          "text-xs font-medium text-muted-foreground uppercase tracking-wide",
          className
        )}
      >
        {title}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 data-[state=open]:bg-accent -ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        {column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-3 w-3" />
        ) : column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-3 w-3" />
        ) : (
          <ChevronsUpDown className="ml-2 h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

// User Avatar Component
const UserAvatar = ({
  email,
  name,
  size = 32,
}: {
  email: string;
  name?: string | null;
  size?: number;
}) => {
  const avatarUrl = generateGravatarUrl(email, size);
  const initials = getInitials(name || email);

  return (
    <Avatar
      className={cn("shrink-0", {
        "h-6 w-6": size <= 24,
        "h-8 w-8": size <= 32,
        "h-10 w-10": size > 32,
      })}
    >
      <AvatarImage
        src={avatarUrl}
        alt={name || email}
        className="object-cover"
      />
      <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
    </Avatar>
  );
};

// Actions component
interface WaitlistEntryActionsProps {
  entry: WaitlistEntry;
  onStatusChange: (entryId: string, status: string) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
}

const WaitlistEntryActions = ({
  entry,
  onStatusChange,
  onDelete,
}: WaitlistEntryActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-muted transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {entry.status === "verified" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(entry.id, "invited");
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Invite
          </DropdownMenuItem>
        )}
        {entry.status === "pending" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(entry.id, "verified");
            }}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Mark Verified
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Create the columns
export const createWaitlistTableColumns = (
  onStatusChange: (entryId: string, status: string) => Promise<void>,
  onDelete: (entryId: string) => Promise<void>
) => [
  // Selection column - narrow left
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    size: 40,
  }),

  // Position column - narrow left with font-mono styling
  columnHelper.accessor("position", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="#" className="w-20" />
    ),
    cell: ({ getValue }) => (
      <div className="w-20 font-mono text-sm text-muted-foreground">
        #{getValue()}
      </div>
    ),
    size: 80,
    enableSorting: true,
    meta: {
      className: "w-20",
    } as WaitlistColumnMeta,
  }),

  // User info column - flexible middle with avatar, name, and email
  columnHelper.display({
    id: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const entry = row.original;

      return (
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <UserAvatar email={entry.email} name={entry.name} size={32} />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="font-medium text-sm truncate">
              {entry.name || "Unnamed User"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {entry.email}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.name || rowA.original.email;
      const nameB = rowB.original.name || rowB.original.email;
      return nameA.localeCompare(nameB);
    },
    minSize: 200,
    size: 300,
    meta: {
      className: "flex-1",
    } as WaitlistColumnMeta,
  }),

  // Referrals column - compact right-aligned
  columnHelper.accessor("_count.referrals", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Referrals"
        className="w-20 justify-end"
      />
    ),
    cell: ({ getValue }) => (
      <div className="flex items-center justify-end gap-1 w-20">
        <Share2 className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{getValue()}</span>
      </div>
    ),
    size: 80,
    enableSorting: false,
    meta: {
      className: "w-20 text-right",
    } as WaitlistColumnMeta,
  }),

  // Source column - compact right-aligned
  columnHelper.accessor("utmSource", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Source"
        className="w-20 justify-end"
      />
    ),
    cell: ({ getValue }) => (
      <div className="w-20 text-right">
        <Badge variant="outline" className="text-xs capitalize">
          {getValue() || "direct"}
        </Badge>
      </div>
    ),
    enableSorting: false,
    size: 80,
    meta: {
      className: "w-20 text-right",
    } as WaitlistColumnMeta,
  }),

  // Date column - compact right-aligned
  columnHelper.accessor("joinedAt", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Joined"
        className="w-28 justify-end"
      />
    ),
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <div className="w-28 text-right text-sm text-muted-foreground">
          {value ? format(new Date(value), "MMM d, yyyy") : "-"}
        </div>
      );
    },
    size: 112,
    enableSorting: true,
    meta: {
      className: "w-28 text-right",
    } as WaitlistColumnMeta,
  }),

  // Status column - compact right-aligned
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
        className="w-24 justify-end"
      />
    ),
    cell: ({ getValue }) => (
      <div className="w-24 flex justify-end">{getStatusBadge(getValue())}</div>
    ),
    filterFn: "equals",
    size: 96,
    enableSorting: true,
    meta: {
      className: "w-24 text-right",
    } as WaitlistColumnMeta,
  }),

  // Actions column - narrow right with square buttons
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <WaitlistEntryActions
          entry={row.original}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </div>
    ),
    enableSorting: false,
    size: 50,
    meta: {
      className: "w-12",
    } as WaitlistColumnMeta,
  }),
];

export { DataTableColumnHeader, UserAvatar, WaitlistEntryActions };
