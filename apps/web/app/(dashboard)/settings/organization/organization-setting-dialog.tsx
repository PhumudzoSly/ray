"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useState } from "react";
import { toast } from "sonner";
import { updateOrganizationName } from "@/actions/account/user";
import { Loader2, Building2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

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

  const hasChanges = name.trim() !== currentName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Organization Settings
              </DialogTitle>
              <DialogDescription className="text-base">
                Manage your organization's basic information and settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="border-0 shadow-none bg-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                General Information
              </CardTitle>
              <CardDescription className="text-sm">
                Basic details about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="org-name" className="text-sm font-medium">
                  Organization Name
                </Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter organization name"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  This name will be visible to all members of your organization
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Warning for changes */}
          {hasChanges && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                You have unsaved changes. Click "Save Changes" to apply them.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setName(currentName);
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading || !name.trim() || !hasChanges}
            onClick={handleUpdateName}
            className="w-full sm:w-auto gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
