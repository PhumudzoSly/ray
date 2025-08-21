"use client";
import { getComposioAccount } from "@/actions/account/composio";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import React, { useState } from "react";
import { toast } from "sonner";

type Integration = {
  variant: "api" | "oauth";
  name: string;
};

const AddIdeaIntegrations = ({ id }: { id: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<string>("");

  const integrations: Integration[] = [
    { variant: "oauth", name: "slack" },
    { variant: "oauth", name: "github" },
    { variant: "oauth", name: "twitter" },
  ];

  const selectedIntegrationData = integrations.find(
    (integration) => integration.name === selectedIntegration
  );

  const handleProceed = async () => {
    if (!selectedIntegrationData) return;

    if (selectedIntegrationData?.variant === "oauth") {
      const finalData = await getComposioAccount({
        userIdentifier: `idea-${id}`,
        authConfigId: selectedIntegrationData.name,
      });
      console.log("FINAL DATA", finalData);

      if (finalData.redirectUrl) {
        window.open(finalData.redirectUrl, "_blank");
      }
    }

    // Close modal after fake server action
    setIsModalOpen(false);
    setApiKey("");
    setSelectedIntegration("");
  };

  return (
    <div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button>🔗 Add</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="integration-select" className="text-right">
                Integration
              </Label>
              <Select
                value={selectedIntegration}
                onValueChange={setSelectedIntegration}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an integration" />
                </SelectTrigger>
                <SelectContent>
                  {integrations.map((integration) => (
                    <SelectItem key={integration.name} value={integration.name}>
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{integration.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({integration.variant})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIntegrationData?.variant === "api" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="api-key" className="text-right">
                  API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleProceed}
                disabled={
                  !selectedIntegration ||
                  (selectedIntegrationData?.variant === "api" && !apiKey.trim())
                }
              >
                Proceed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddIdeaIntegrations;
