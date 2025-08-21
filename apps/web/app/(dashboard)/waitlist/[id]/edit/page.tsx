import { notFound } from "next/navigation";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import Header from "@/components/shared/header";
import * as waitlistActions from "@/actions/waitlist";
import WaitlistForm from "../../_components/waitlist-form";

interface EditWaitlistPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWaitlistPage({
  params,
}: EditWaitlistPageProps) {
  const { id: waitlistId } = await params;

  // Prefetch waitlist data on the server
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["waitlist", waitlistId],
    queryFn: async () => {
      const res = await waitlistActions.getWaitlist(waitlistId);
      if (!res.success || !res.data) {
        throw new Error("Waitlist not found");
      }
      return res.data;
    },
  });

  // Get the prefetched data
  const waitlist = queryClient.getQueryData(["waitlist", waitlistId]) as any;
  const emailSyncUsage = queryClient.getQueryData([
    "waitlist-email-sync",
    waitlistId,
  ]) as any;

  if (!waitlist) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header
        crumb={[
          { title: "Waitlists", url: "/waitlist" },
          { title: waitlist.name, url: `/waitlist/${waitlistId}` },
          { title: "Edit" },
        ]}
      >
        <></>
      </Header>
      <WaitlistForm
        mode="edit"
        waitlistId={waitlistId}
        initialData={{
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
          emailSyncEnabled: !!emailSyncUsage,
          integrationId: emailSyncUsage?.integrationId || null,
        }}
      />
    </HydrationBoundary>
  );
}
