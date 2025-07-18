"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import Header from "@/components/shared/header";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import WaitlistForm from "../../_components/waitlist-form";
import * as waitlistActions from "@/actions/waitlist";

export default function EditWaitlistPage() {
  const params = useParams();
  const waitlistId = params.id as string;

  // Fetch waitlist data
  const { data: waitlist, isLoading } = useQuery({
    queryKey: ["waitlist", waitlistId],
    queryFn: async () => {
      const res = await waitlistActions.getWaitlist(waitlistId);
      return res.success ? res.data : null;
    },
    enabled: !!waitlistId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (waitlist === null) {
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

  const { mainContent, apiDocsContent } = WaitlistForm({
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
      customMessage: waitlist.customMessage,
    },
  });

  return (
    <>
      <Header
        crumb={[
          { title: "Waitlists", url: "/waitlist" },
          { title: waitlist.name, url: `/waitlist/${waitlistId}` },
          { title: "Edit" },
        ]}
      >
        <></>
      </Header>
      <ExpandedLayoutContainer sidebar={apiDocsContent}>
        {mainContent}
      </ExpandedLayoutContainer>
    </>
  );
}
