import React from "react";
import { getSingleIdea } from "@/actions/idea";
import UpdateIdea from "@/components/idea/core/edit-idea";
import { Button } from "@workspace/ui/components/button";
import DeleteIdea from "@/components/idea/core/delete-idea";
import { Separator } from "@workspace/ui/components/separator";
import moment from "moment";
import { Building2, Shield, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import StatusSelector from "@/components/idea/core/status";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { getInitials } from "@/utils/helpers";

const IdeaSidebar = async ({ id }: { id: string }) => {
  const idea = await getSingleIdea(id);
  if (!idea) return null;

  return (
    <div className="divide-y">
      <div className="p-4 flex items-center gap-4 justify-between">
        <h1 className="text-lg font-bold">Manage</h1>
        <div className="flex items-center gap-4">
          <UpdateIdea id={id} idea={idea}>
            <Button variant="outline" className="w-full">
              Edit
            </Button>
          </UpdateIdea>
          <DeleteIdea id={id} />
        </div>
      </div>
      <Separator />
      <TooltipProvider>
        <div className="grid grid-cols-[120px_1fr] gap-y-6 p-4">
          {idea.owner && (
            <h3 className="text-sm font-medium text-muted-foreground">
              Added by
            </h3>
          )}
          {idea.owner && (
            <div className="text-sm flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {getInitials(idea?.owner?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p>{idea?.owner?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {idea?.owner?.email}
                </p>
              </div>
            </div>
          )}

          <h3 className="text-sm font-medium text-muted-foreground">Added</h3>
          <p className="text-sm text-muted-foreground">
            {moment(idea.createdAt).format("MMMM Do, YYYY")}
          </p>

          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <StatusSelector id={id} status={idea?.status} />
          <h3 className="text-sm font-medium text-muted-foreground">
            Industry
          </h3>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Building2 className="h-4 w-4 text-indigo-500" />
              {idea?.industry}
            </TooltipTrigger>
            <TooltipContent>Industry classification</TooltipContent>
          </Tooltip>

          <h3 className="text-sm font-medium text-muted-foreground">
            Ownership
          </h3>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Shield className="h-4 w-4 text-blue-500" />
              {idea?.internal ? "Internal idea" : "Client/external idea"}
            </TooltipTrigger>
            <TooltipContent>Idea ownership type</TooltipContent>
          </Tooltip>

          <h3 className="text-sm font-medium text-muted-foreground">
            Accessibility
          </h3>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              {idea?.openSource ? "Open source" : "Closed source"}
            </TooltipTrigger>
            <TooltipContent>Source code accessibility</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default IdeaSidebar;
