"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { FaMagic } from "react-icons/fa";
import { toast } from "sonner";
import { runWorkflow } from "@/lib/upstash";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";

const AIDiscovery = ({ ideaId }: { ideaId: string }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [userInstructions, setUserInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIDiscoveryWithInstructions = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      const body = {
        ideaId,
        ...(userInstructions.trim() && {
          userInstructions: userInstructions.trim(),
        }),
      };

      await toast.promise(runWorkflow({ url: "/idea/competitors", body }), {
        loading: "Booting agent....",
        success: "Ray agent is researching competitors...",
        error: "Failed to boot agent",
      });

      setIsAIModalOpen(false);
      setUserInstructions("");
    } catch (error) {
      console.error("Error running AI discovery:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIModalOpen = () => {
    setIsAIModalOpen(true);
  };

  return (
    <div>
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleAIModalOpen} variant="fancy" className="gap-2">
            <FaMagic className="h-4 w-4" />
            AI Discovery
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold">
              AI Competitor Discovery
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Help the AI discover relevant competitors by providing additional
              context about your market focus and competitive landscape.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="space-y-3">
              <Label htmlFor="instructions" className="text-sm font-medium">
                Additional Instructions
              </Label>
              <Textarea
                id="instructions"
                placeholder="Focus on direct competitors, emerging startups, enterprise solutions, specific geographic markets..."
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                className="min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Optional but recommended for better results
                </span>
                <span className="text-xs text-muted-foreground">
                  {userInstructions.length}/500
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAIModalOpen(false);
                setUserInstructions("");
              }}
              disabled={isGenerating}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAIDiscoveryWithInstructions}
              disabled={isGenerating}
              variant="fancy"
              className="px-6"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Discovering...
                </>
              ) : (
                <>
                  <FaMagic className="mr-2" />
                  Discover Competitors
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIDiscovery;
