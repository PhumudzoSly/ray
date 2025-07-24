import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getWaitlist, getWaitlistAnalytics } from "@/actions/waitlist";
import { getAllWaitlistEntries } from "@/actions/waitlist/entries";
import getQueryClient from "@/lib/query/getQueryClient";
import { queryKeys } from "@/lib/query-keys";
import Header from "@/components/shared/header";
import WaitlistManager from "./_components/waitlist-manager";
import { Edit2 } from "lucide-react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface WaitlistPageProps {
  params: Promise<{ id: string }>;
}

export default async function WaitlistPage({ params }: WaitlistPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await Promise.all([
    // Prefetch waitlist data
    queryClient.prefetchQuery({
      queryKey: queryKeys.waitlist(id),
      queryFn: async () => {
        const result = await getWaitlist(id);
        if (!result.success || !result.data) {
          throw new Error("Waitlist not found");
        }
        return result.data;
      },
    }),

    // Prefetch waitlist entries
    queryClient.prefetchQuery({
      queryKey: queryKeys.waitlistEntries(id),
      queryFn: async () => {
        const result = await getAllWaitlistEntries(id);
        if (!result.success) {
          throw new Error("Failed to fetch entries");
        }
        return (result.data ?? []).map((entry) => ({
          ...entry,
          name: entry.name ?? undefined,
          userAgent: entry.userAgent ?? undefined,
          utmSource: entry.utmSource ?? undefined,
          utmMedium: entry.utmMedium ?? undefined,
          utmCampaign: entry.utmCampaign ?? undefined,
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
          verifiedAt: entry.verifiedAt
            ? entry.verifiedAt.toISOString()
            : undefined,
          invitedAt: entry.invitedAt
            ? entry.invitedAt.toISOString()
            : undefined,
          joinedAt: entry.joinedAt ? entry.joinedAt.toISOString() : undefined,
        }));
      },
    }),

    // Prefetch analytics
    queryClient.prefetchQuery({
      queryKey: queryKeys.waitlistAnalytics(id),
      queryFn: async () => {
        const result = await getWaitlistAnalytics(id);
        if (!result.success) {
          throw new Error("Failed to fetch analytics");
        }
        return (
          result.data ?? {
            totalEntries: 0,
            totalReferrals: 0,
            recentEntries: 0,
          }
        );
      },
    }),
  ]);
  // Check if waitlist exists (this will be in cache now)
  const waitlistData: any = queryClient.getQueryData(queryKeys.waitlist(id));
  if (!waitlistData) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header
        crumb={[
          { title: "Waitlist", url: "/waitlist" },
          { title: "Manage waitlist", url: `/waitlist/${id}` },
        ]}
      >
        <div className="flex items-center gap-2 ">
          <Button size="icon" asChild>
            <Link
              href={`https://rayai.dev/wl/${waitlistData?.slug as any}`}
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/waitlist/${id}/edit`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </Header>
      <WaitlistManager waitlistId={id} />
    </HydrationBoundary>
  );
}
