"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import WaitlistForm from "../../_components/waitlist-form";
import * as waitlistActions from "@/actions/waitlist";

interface EditWaitlistFormProps {
  mode: "edit";
  waitlistId: string;
  initialData: {
    name: string;
    slug: string;
    description: string;
    projectId: string;
    projectName?: string;
    isPublic: boolean;
    allowNameCapture: boolean;
    showPosition: boolean;
    showSocialProof: boolean;
    customMessage: string;
  };
}

export default function EditWaitlistForm({
  waitlistId,
  initialData,
}: EditWaitlistFormProps) {
  // Use the prefetched data from the server
  const {
    data: waitlist,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["waitlist", waitlistId],
    queryFn: async () => {
      const res = await waitlistActions.getWaitlist(waitlistId);
      if (!res.success || !res.data) {
        throw new Error("Waitlist not found");
      }
      return res.data;
    },
    initialData, // Use the prefetched data
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !waitlist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Waitlist Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The waitlist you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button onClick={() => window.history.back()}>
            Back to Waitlists
          </Button>
        </div>
      </div>
    );
  }

  return WaitlistForm({
    mode: "edit",
    waitlistId,
    initialData: {
      name: waitlist.name,
      slug: waitlist.slug,
      description: waitlist.description,
      projectId: waitlist.projectId,
      projectName: waitlist.project?.name,
      isPublic: waitlist.isPublic,
      allowNameCapture: waitlist.allowNameCapture,
      showPosition: waitlist.showPosition,
      showSocialProof: waitlist.showSocialProof,
      customMessage: waitlist.customMessage || "",
    },
  });
}
