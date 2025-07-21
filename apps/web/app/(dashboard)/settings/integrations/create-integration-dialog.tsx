"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { createIntegration, IntegrationConfig } from "@/actions/integration";
import { toast } from "sonner";

interface CreateIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const integrationTypes = [
  {
    value: "RESEND",
    label: "Resend",
    description: "Modern email API for developers",
  },
  { value: "LOOPS", label: "Loops", description: "Email marketing for SaaS" },
  {
    value: "SENDGRID",
    label: "SendGrid",
    description: "Email delivery service",
  },
  {
    value: "MAILCHIMP",
    label: "Mailchimp",
    description: "Marketing automation platform",
  },
  {
    value: "CONVERTKIT",
    label: "ConvertKit",
    description: "Email marketing for creators",
  },
];

export function CreateIntegrationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateIntegrationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    apiKey: "",
    audienceId: "",
    listId: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config: IntegrationConfig = {
        apiKey: formData.apiKey,
      };

      // Add platform-specific fields
      if (formData.type === "RESEND" && formData.audienceId) {
        config.audienceId = formData.audienceId;
      } else if (
        ["SENDGRID", "MAILCHIMP", "CONVERTKIT"].includes(formData.type) &&
        formData.listId
      ) {
        config.listId = formData.listId;
      }

      const result = await createIntegration({
        name: formData.name,
        type: formData.type as any,
        config,
      });

      if (result.success) {
        onSuccess();
        resetForm();
      } else {
        toast.error("Failed to create integration");
      }
    } catch (error) {
      toast.error("Failed to create integration");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      apiKey: "",
      audienceId: "",
      listId: "",
      isActive: true,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const renderPlatformFields = () => {
    switch (formData.type) {
      case "RESEND":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="re_123456789..."
                value={formData.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from the{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Resend dashboard
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audienceId">Audience ID (Optional)</Label>
              <Input
                id="audienceId"
                placeholder="12345678-1234-1234-1234-123456789012"
                value={formData.audienceId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, audienceId: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to use your default audience
              </p>
            </div>
          </div>
        );
      case "SENDGRID":
      case "MAILCHIMP":
      case "CONVERTKIT":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={formData.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listId">
                {formData.type === "SENDGRID"
                  ? "List ID"
                  : formData.type === "MAILCHIMP"
                    ? "Audience ID"
                    : "Form ID"}
              </Label>
              <Input
                id="listId"
                placeholder="Enter your list/audience/form ID"
                value={formData.listId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, listId: e.target.value })
                }
                required
              />
            </div>
          </div>
        );
      case "LOOPS":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Loops API key"
                value={formData.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from the{" "}
                <a
                  href="https://app.loops.so/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Loops dashboard
                </a>
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Add Email Integration
          </DialogTitle>
          <DialogDescription>
            Connect your email platform to automatically sync waitlist
            subscribers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Resend Integration"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Email Platform</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {integrationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type && renderPlatformFields()}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Integration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
