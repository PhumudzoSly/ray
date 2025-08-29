"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { editCompetitor, getCompetitor } from "@/actions/idea/competitor";
import getQueryClient from "@/lib/query/client";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import { Edit } from "lucide-react";

export const EditCompetitor = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = getQueryClient();

  const { data: competitor } = useQuery({
    queryKey: ["competitor", id],
    queryFn: () => getCompetitor({ id }),
  });

  const handleSubmit = async (formData: FormData) => {
    if (!competitor) return;

    setIsLoading(true);
    try {
      const data = {
        ideaId: competitor.ideaId,
        name: formData.get("name") as string,
        website: (formData.get("website") as string) || null,
        description: (formData.get("description") as string) || null,
        targetAudience: (formData.get("targetAudience") as string) || null,
        headquarters: (formData.get("headquarters") as string) || null,
        employeeCount: (formData.get("employeeCount") as string) || null,
        foundedYear: formData.get("foundedYear")
          ? parseInt(formData.get("foundedYear") as string)
          : null,

        marketShare: formData.get("marketShare")
          ? parseFloat(formData.get("marketShare") as string)
          : null,


        threatLevel: formData.get("threatLevel") as
          | "LOW"
          | "MEDIUM"
          | "HIGH"
          | "CRITICAL",
      };

      await editCompetitor({ id, data });

      queryClient.invalidateQueries({
        queryKey: ["competitor", id],
      });

      toast.success("Competitor updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update competitor");
      console.error("Error updating competitor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!competitor) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Competitor</DialogTitle>
          <DialogDescription>
            Update the competitor information and metrics.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={competitor.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={competitor.website || ""}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={competitor.description || ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Textarea
              id="targetAudience"
              name="targetAudience"
              defaultValue={competitor.targetAudience || ""}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters</Label>
              <Input
                id="headquarters"
                name="headquarters"
                defaultValue={competitor.headquarters || ""}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Employee Count</Label>
              <Input
                id="employeeCount"
                name="employeeCount"
                defaultValue={competitor.employeeCount || ""}
                placeholder="100-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                name="foundedYear"
                type="number"
                defaultValue={competitor.foundedYear || ""}
                placeholder="2020"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threatLevel">Threat Level</Label>
              <Select name="threatLevel" defaultValue={competitor.threatLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>



          <div className="space-y-4">
            <h4 className="text-sm font-medium">Performance Metrics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marketShare">Market Share (%)</Label>
                <Input
                  id="marketShare"
                  name="marketShare"
                  type="number"
                  step="0.1"
                  defaultValue={competitor.marketShare || ""}
                  placeholder="15.5"
                />
              </div>

            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Competitor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
