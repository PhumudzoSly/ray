"use client";

import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateOrganizationName } from "@/actions/account/user";
import { useRouter } from "next/navigation";

interface OrganizationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  storeId: string;
}

export function OrganizationSettingsDialog({
  open,
  onOpenChange,
  currentName,
  storeId,
}: OrganizationSettingsDialogProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Keep input in sync when dialog opens or currentName changes
  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast.error("Organization name cannot be empty");
      return;
    }

    if (name === currentName) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    const result = await updateOrganizationName(storeId, name.trim());
    setIsLoading(false);
    router.refresh();

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Organization name updated successfully");
    onOpenChange(false);
  };
  // Minimal UI: compute disabled state inline in the button

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename organization</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="org-name">Name</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Organization name"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setName(currentName);
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateName}
            disabled={isLoading || !name.trim() || name.trim() === currentName}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
