"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import {
  CheckCircle2,
  CircleDot,
  Loader2,
  PencilIcon,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Card } from "@workspace/ui/components/card";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ideaActions from "@/actions/idea";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";

export type IdeaStatus =
  | "INVALIDATED"
  | "VALIDATED"
  | "FAILED"
  | "IN_PROGRESS"
  | "LAUNCHED";

const statusConfig = {
  INVALIDATED: {
    label: "Invalidated",
    icon: CircleDot,
    description: "Idea has not been validated with potential customers",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  VALIDATED: {
    label: "Validated",
    icon: CheckCircle2,
    description: "Idea has been validated with potential customers",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    description: "Idea validation failed or was abandoned",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Loader2,
    description: "Idea is currently being developed",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  LAUNCHED: {
    label: "Launched",
    icon: CheckCircle2,
    description: "Idea has been launched to market",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
};

const IdeaStatus = ({
  status,
  id,
  refetch,
}: {
  status: IdeaStatus;
  id: string;
  refetch: any;
}) => {
  const [currentStatus, setCurrentStatus] = useState<IdeaStatus>(status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const config = statusConfig[status];
  const initConfig = statusConfig[status];

  const queryClient = useQueryClient();
  const changeStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) =>
      ideaActions.changeStatus(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries(); // Optionally, scope to idea queries
    },
  });

  async function handleSubmit() {
    if (currentStatus === status) {
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await toast.promise(
        changeStatusMutation.mutateAsync({
          id,
          status: currentStatus,
        }),
        {
          error: "Failed to update idea status",
          loading: "Updating idea status",
          success: "Idea status updated",
        }
      );
      setIsOpen(false);
      await refetch();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 transition-all hover:bg-transparent",
            initConfig.color,
            initConfig.bgColor
          )}
        >
          <PencilIcon className="h-4 w-4" />
          <span>{initConfig.label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-full",
                config.bgColor,
                config.borderColor,
                "border-2"
              )}
            >
              <PencilIcon className={cn("h-6 w-6", config.color)} />
            </div>
            <span>Update Idea Status</span>
          </DialogTitle>
          <DialogDescription className="text-center pt-2 pb-4">
            Make sure this aligns with where your idea is during the validation
            or development stage.
          </DialogDescription>
        </DialogHeader>

        <Card className="p-0 bg-transparent border-0 space-y-4">
          <div className="space-y-4">
            <div
              className={cn(
                "p-2 rounded-lg border",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-center gap-2">
                <config.icon className={cn("h-4 w-4", config.color)} />
                <span className={cn("font-medium", config.color)}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              New Status
            </label>
            <Select
              value={currentStatus}
              onValueChange={(e: IdeaStatus) => setCurrentStatus(e)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select idea validation status" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {Object.entries(statusConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <value.icon
                        // @ts-ignore
                        className={cn("h-4 w-4", statusConfig[key].color)}
                      />
                      <span>{value.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="flex-col space-y-3 gap-2 sm:flex-col sm:gap-2">
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isSubmitting || currentStatus === status}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaStatus;
