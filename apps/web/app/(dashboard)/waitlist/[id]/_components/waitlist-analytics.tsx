"use client";

import { Loader2, Users, CheckCircle, Share2, Target } from "lucide-react";
import { useWaitlistAnalytics } from "@/hooks/use-waitlist-analytics";
import {
  MetricCard,
  ConversionFunnel,
  TrafficSources,
  StatusDistribution,
  ReferralPerformance,
  GrowthInsights,
} from "@/components/waitlist/analytics-metrics";

interface WaitlistAnalyticsProps {
  waitlistId: string;
}

export default function WaitlistAnalytics({
  waitlistId,
}: WaitlistAnalyticsProps) {
  const { data: analytics, isLoading } = useWaitlistAnalytics(waitlistId);

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          title="Total Entries"
          value={analytics.totalEntries}
          subtitle={`+${analytics.recentEntries} this week`}
        />

        <MetricCard
          icon={CheckCircle}
          title="Verified"
          value={analytics.verifiedCount}
          subtitle={`${analytics.verificationRate}% verified`}
        />

        <MetricCard
          icon={Share2}
          title="Referrals"
          value={analytics.totalReferrals}
          subtitle={`${analytics.avgReferralsPerUser.toFixed(1)} avg per user`}
        />

        <MetricCard
          icon={Target}
          title="Conversion"
          value={`${analytics.overallConversionRate.toFixed(1)}%`}
          subtitle={`${analytics.joinedCount} joined`}
        />
      </div>

      {/* Conversion Funnel */}
      <ConversionFunnel analytics={analytics} />

      {/* Traffic Sources & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrafficSources analytics={analytics} />
        <StatusDistribution analytics={analytics} />
      </div>

      {/* Referral Performance */}
      <ReferralPerformance analytics={analytics} />

      {/* Growth Insights */}
      <GrowthInsights analytics={analytics} />
    </div>
  );
}
