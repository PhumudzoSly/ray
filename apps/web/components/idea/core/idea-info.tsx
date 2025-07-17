"use client";
import moment from "moment";
import { toast } from "sonner";
import IdeaStatus from "./status";
import { Menu } from "lucide-react";
import { BarChart2, Building2, Shield, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { useState } from "react";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { Button } from "@workspace/ui/components/button";
import IdeaEditModal from "./idea-edit-modal";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";

const IdeaInfo = ({ id }: { id: string }) => {
  //

  const { token } = useSession();
  const { data: idea, isPending } = api.idea.getSingleIdea({
    id: id as Id<"idea">,
    token,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleUpdateField = async (field: string, value: string) => {
    try {
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const confirm = useConfirm();
  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete idea?",
      description:
        "This action will permanently remove your idea and everything related to it.",
    });
    if (isConfirmed) {
    }
  };

  if (isPending) return <LoadingSpinner />;

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header with Title and Status */}
      <div className="flex justify-between w-full flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-start justify-between w-full">
          <div>
            <InlineEditField
              value={`${idea?.name}` || ""}
              onSave={(value) => handleUpdateField("name", value)}
              className="text-2xl font-medium hover:bg-transparent focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 rounded px-2 -ml-2"
            />
            <div className="text-muted-foreground text-sm">
              Added {moment(idea?._creationTime).fromNow()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {idea?.status && (
              <IdeaStatus refetch={() => { }} id={id} status={idea.status} />
            )}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEditModalOpen(true)}
              >
                Edit Idea
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 py-6 text-sm text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Building2 className="h-4 w-4 text-indigo-500" />
              {idea?.industry}
            </TooltipTrigger>
            <TooltipContent>Industry classification</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Shield className="h-4 w-4 text-blue-500" />
              {idea?.internal ? "Internal idea" : "Client/external idea"}
            </TooltipTrigger>
            <TooltipContent>Idea ownership type</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              {idea?.openSource ? "Open source" : "Closed source"}
            </TooltipTrigger>
            <TooltipContent>Source code accessibility</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Edit Idea Modal */}
      {idea && (
        <IdeaEditModal
          id={id}
          idea={idea}
          isOpen={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={() => { }}
        />
      )}
    </div>
  );
};

export default IdeaInfo;
