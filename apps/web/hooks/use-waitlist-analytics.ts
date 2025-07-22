import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getWaitlistAnalytics } from "@/actions/waitlist";
import { getFilteredWaitlistEntries } from "@/actions/waitlist/entries";

export interface WaitlistAnalyticsData {
  // Basic counts
  totalEntries: number;
  totalReferrals: number;
  verifiedCount: number;
  invitedCount: number;
  joinedCount: number;
  activeReferrers: number;
  recentEntries: number;
  recentVerifications: number;

  // Breakdowns
  utmSources: Record<string, number>;
  statusBreakdown: Record<string, number>;

  // Rates and percentages
  verificationRate: number;
  invitationRate: number;
  joinRate: number;
  overallConversionRate: number;
  avgReferralsPerUser: number;

  // Raw entries
  entries: Array<{
    id: string;
    email: string;
    name?: string;
    status: string;
    position: number;
    referralCount: number;
    verifiedAt?: string;
    invitedAt?: string;
    joinedAt?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    createdAt: string;
  }>;
}

export function useWaitlistAnalytics(waitlistId: string) {
  return useQuery({
    queryKey: queryKeys.waitlistAnalytics(waitlistId),
    queryFn: async (): Promise<WaitlistAnalyticsData> => {
      const result = await getWaitlistAnalytics(waitlistId);
      if (!result.success) {
        throw new Error("Failed to fetch analytics");
      }
      return result.data as WaitlistAnalyticsData;
    },
  });
}

export interface FilteredWaitlistEntriesData {
  entries: Array<{
    id: string;
    email: string;
    name?: string;
    status: string;
    position: number;
    referralCount: number;
    verifiedAt?: string;
    invitedAt?: string;
    joinedAt?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    createdAt: string;
  }>;
  totalCount: number;
  hasMore: boolean;
}

export function useFilteredWaitlistEntries(
  waitlistId: string,
  search?: string,
  status?: string,
  limit?: number,
  offset?: number
) {
  return useQuery({
    queryKey: queryKeys.filteredWaitlistEntries(waitlistId, search, status, limit, offset),
    queryFn: async (): Promise<FilteredWaitlistEntriesData> => {
      const result = await getFilteredWaitlistEntries({
        waitlistId,
        search,
        status,
        limit,
        offset,
      });
      if (!result.success) {
        throw new Error("Failed to fetch filtered entries");
      }
      return result.data as FilteredWaitlistEntriesData;
    },
    enabled: !!waitlistId,
  });
}

// Helper functions for common analytics operations
export const createConversionMetrics = (analytics: WaitlistAnalyticsData) => [
  {
    title: "Verification Rate",
    value: analytics.verificationRate,
    suffix: "%",
    description: `+${analytics.recentVerifications} verified this week`,
  },
  {
    title: "Invitation Rate",
    value: analytics.invitationRate,
    suffix: "%",
    description: `${analytics.invitedCount} users invited`,
  },
  {
    title: "Join Rate",
    value: analytics.joinRate,
    suffix: "%",
    description: `${analytics.joinedCount} actually joined`,
  },
];

export const createReferralMetrics = (analytics: WaitlistAnalyticsData) => [
  {
    title: "Total Referrals",
    value: analytics.totalReferrals,
    description: "All-time referral count",
  },
  {
    title: "Avg per User",
    value: analytics.avgReferralsPerUser.toFixed(1),
    description: "Average referrals per user",
  },
  {
    title: "Active Referrers",
    value: analytics.activeReferrers,
    description: "Users who made referrals",
  },
];

export const createGrowthInsights = (analytics: WaitlistAnalyticsData) => [
  {
    title: "Total Sign-ups",
    value: analytics.totalEntries,
  },
  {
    title: "Email Verified",
    value: `${analytics.verificationRate}%`,
  },
  {
    title: "Viral Coefficient",
    value: analytics.avgReferralsPerUser.toFixed(1),
  },
  {
    title: "Overall Conversion",
    value: `${analytics.overallConversionRate.toFixed(1)}%`,
  },
];
