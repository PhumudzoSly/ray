"use client";
import React from "react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@workspace/ui/components/dropdown-menu";
import {
  Plus,
  Lightbulb,
  FileText,
  Users,
  Zap,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

export const QuickActions = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Primary Action - Create Project */}
      <CreateProjectDialog />

      {/* Quick Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Create New</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href="/ideas/new">
              <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
              <span>New Idea</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                I
              </Badge>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/issues/new">
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              <span>New Issue</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                Shift+I
              </Badge>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Organize</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href="/settings/organization">
              <Users className="mr-2 h-4 w-4 text-purple-500" />
              <span>Invite Members</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
