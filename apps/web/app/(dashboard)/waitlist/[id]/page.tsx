import { notFound } from "next/navigation";
import { getWaitlist, getWaitlistAnalytics } from "@/actions/waitlist";
import { getAllWaitlistEntries } from "@/actions/waitlist/entries";
import Header from "@/components/shared/header";
import WaitlistManager from "./_components/waitlist-manager";

interface WaitlistPageProps {
  params: Promise<{ id: string }>;
}

export default async function WaitlistPage({ params }: WaitlistPageProps) {
  const { id } = await params;

  // Fetch waitlist data
  const waitlistResult = await getWaitlist(id);
  if (!waitlistResult.success || !waitlistResult.data) {
    notFound();
  }
  const waitlist = waitlistResult.data;

  // Fetch waitlist entries
  const entriesResult = await getAllWaitlistEntries(id);
  const entries = entriesResult.success ? (entriesResult.data ?? []) : [];

  // Fetch analytics
  const analyticsResult = await getWaitlistAnalytics(id);
  const analytics = analyticsResult.success
    ? (analyticsResult.data ?? {
        totalEntries: 0,
        totalReferrals: 0,
        recentEntries: 0,
      })
    : {
        totalEntries: 0,
        totalReferrals: 0,
        recentEntries: 0,
      };

  return (
    <>
      <Header
        crumb={[
          { title: "Waitlist", url: "/waitlist" },
          { title: "Manage waitlist", url: `/waitlist/${id}` },
        ]}
      >
        {null}
      </Header>
      <WaitlistManager
        waitlistId={id}
        waitlist={waitlist}
        entries={entries}
        analytics={analytics}
      />
    </>
  );
}
