"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Edit, Lightbulb } from "lucide-react";
import IdeaForm from "./idea-form";

const UpdateIdea = ({
  id,
  idea,
  onOpenChange,
  onSuccess,
  children,
}: {
  id: string;
  idea: any;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // TODO: Implement actual update logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success("Idea updated successfully");
      if (onSuccess) onSuccess();
      setOpen(false);
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      toast.error("Error while updating idea");
      throw error; // Re-throw to let the form component handle the loading state
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Idea
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        <div className="h-full overflow-y-auto">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div>
                <SheetTitle>Edit Idea</SheetTitle>
                <SheetDescription>
                  Update your idea details and configuration
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1">
            <IdeaForm
              mode="edit"
              defaultValues={idea}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              variant="sheet"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UpdateIdea;
