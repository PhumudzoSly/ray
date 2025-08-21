"use client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Edit, Trash } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { getComposioAccount } from "@/actions/account/composio";
import { deleteComposioAccount } from "@/actions/account/composio";

const EditIntegration = ({
  type,
  variant,
  id,
}: {
  type: string;
  variant: "api" | "oauth";
  id: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleButtonClick = () => {
    if (variant === "api") {
      setIsModalOpen(true);
    } else {
      runDemoFunction();
    }
  };

  const runDemoFunction = async () => {
    const data = toast.promise(
      getComposioAccount({
        userIdentifier: `idea-${id}`,
        authConfigId: type,
      }),
      {
        success: "Sign in to continue",
        loading: "Creating new integration",
        error: "Failed to update integration",
      }
    );

    const finalData = await data.unwrap();
    console.log("FINAL DATA", finalData);

    if (finalData.redirectUrl) {
      window.open(finalData.redirectUrl, "_blank");
    }
  };

  const handleApiKeySubmit = () => {
    // Handle API key submission - replace with actual implementation
    console.log(`API Key for ${type}:`, apiKey);
    setIsModalOpen(false);
    setApiKey("");
  };

  return (
    <>
      <Button size="icon" onClick={handleButtonClick}>
        <Edit size={16} />
      </Button>

      {variant === "api" && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enter API Key for {type}</DialogTitle>
              <DialogDescription>
                Please enter your API key for {type} to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="api-key" className="text-right">
                  API Key
                </label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter your API key"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApiKeySubmit}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export const DeleteIntegration = ({ id }: { id: string }) => {
  return (
    <Button
      onClick={() =>
        toast.promise(deleteComposioAccount({ id }), {
          error: "Failed to delete integration",
          loading: "Deleting integration",
          success: "Integration deleted",
        })
      }
      size="icon"
      variant="error"
    >
      <Trash />
    </Button>
  );
};

export default EditIntegration;
