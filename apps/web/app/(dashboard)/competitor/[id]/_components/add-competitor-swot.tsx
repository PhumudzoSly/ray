"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompetitorSwot } from "@/actions/idea/competitor";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { SwotTypeSelector } from "@/components/ui/selectors/swot-type-selector";
import { SwotImpactSelector } from "@/components/ui/selectors/swot-impact-selector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SwotType } from "@/components/ui/selectors/swot-type-selector";
import { Importance } from "@/components/ui/selectors/swot-impact-selector";

export function AddCompetitorSwot({ competitorId }: AddCompetitorSwotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<NewSwotEntry>({
    type: "Strength",
    swotAnalysis: "",
    impact: "MEDIUM",
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCompetitorSwot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competitorSwots", competitorId],
      });
      setIsOpen(false);
      setNewEntry({ type: "Strength", swotAnalysis: "", impact: "MEDIUM" });
      toast.success("SWOT entry created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create SWOT entry");
      console.error(error);
    },
  });

  function handleCreate() {
    if (!newEntry.swotAnalysis.trim()) {
      toast.error("Please enter SWOT analysis");
      return;
    }

    createMutation.mutate({
      swot: {
        competitorId,
        type: newEntry.type,
        swotAnalysis: newEntry.swotAnalysis,
        impact: newEntry.impact,
      },
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New SWOT Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
            <SwotTypeSelector
              swotType={newEntry.type}
              onChange={(value) => setNewEntry({ ...newEntry, type: value })}
            />
            <SwotImpactSelector
              impact={newEntry.impact}
              onChange={(value) => setNewEntry({ ...newEntry, impact: value })}
            />
          </div>
          <div>
            <Label htmlFor="analysis">Analysis</Label>
            <Textarea
              id="analysis"
              placeholder="Enter SWOT analysis details..."
              value={newEntry.swotAnalysis}
              onChange={(e) =>
                setNewEntry({ ...newEntry, swotAnalysis: e.target.value })
              }
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Types
export interface AddCompetitorSwotProps {
  competitorId: string;
}

export interface NewSwotEntry {
  type: SwotType;
  swotAnalysis: string;
  impact: Importance;
}
