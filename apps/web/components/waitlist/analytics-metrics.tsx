import { Badge } from "@workspace/ui/components/badge";
import {
  TrendingUp,
  Globe,
  Share2,
  CheckCircle,
  Mail,
  UserPlus,
  Target,
  Users,
} from "lucide-react";
import { WaitlistAnalyticsData } from "@/hooks/use-waitlist-analytics";

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  className = "",
}: MetricCardProps) {
  return (
    <div className={`space-y-2 border border-border p-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-2xl font-semibold text-primary">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

interface ConversionFunnelProps {
  analytics: WaitlistAnalyticsData;
}

export function ConversionFunnel({ analytics }: ConversionFunnelProps) {
  const metrics = [
    {
      title: "Verification Rate",
      value: analytics.verificationRate,
      suffix: "%",
      description: `+${analytics.recentVerifications} verified this week`,
      icon: CheckCircle,
    },
    {
      title: "Invitation Rate",
      value: analytics.invitationRate,
      suffix: "%",
      description: `${analytics.invitedCount} users invited`,
      icon: Mail,
    },
    {
      title: "Join Rate",
      value: analytics.joinRate,
      suffix: "%",
      description: `${analytics.joinedCount} actually joined`,
      icon: UserPlus,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Conversion Funnel</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="space-y-3 border border-border p-3"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <metric.icon className="h-4 w-4" />
              {metric.title}
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-3xl font-bold">
                {metric.value}
                <span className="text-lg font-normal text-muted-foreground ml-1">
                  {metric.suffix}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrafficSourcesProps {
  analytics: WaitlistAnalyticsData;
}

export function TrafficSources({ analytics }: TrafficSourcesProps) {
  const sortedSources = Object.entries(analytics.utmSources)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Traffic Sources</h3>
      </div>
      <div className="space-y-3">
        {sortedSources.map(([source, count]) => {
          const percentage = Math.round((count / analytics.totalEntries) * 100);
          return (
            <div
              key={source}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-medium capitalize">{source}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {count} users
                </span>
                <div className="text-sm font-medium min-w-[3rem] text-right">
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StatusDistributionProps {
  analytics: WaitlistAnalyticsData;
}

export function StatusDistribution({ analytics }: StatusDistributionProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "verified":
        return <Badge variant="default">Verified</Badge>;
      case "invited":
        return <Badge variant="outline">Invited</Badge>;
      case "joined":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Joined</Badge>
        );
      case "bounced":
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const sortedStatuses = Object.entries(analytics.statusBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Status Distribution</h3>
      </div>
      <div className="space-y-3">
        {sortedStatuses.map(([status, count]) => {
          const percentage = Math.round((count / analytics.totalEntries) * 100);
          return (
            <div
              key={status}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusBadge(status)}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {count} users
                </span>
                <div className="text-sm font-medium min-w-[3rem] text-right">
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ReferralPerformanceProps {
  analytics: WaitlistAnalyticsData;
}

export function ReferralPerformance({ analytics }: ReferralPerformanceProps) {
  const metrics = [
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Referral Performance</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="text-center p-6 rounded-lg border">
            <div className="text-3xl font-bold mb-2">{metric.value}</div>
            <div className="text-sm font-medium mb-1">{metric.title}</div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GrowthInsightsProps {
  analytics: WaitlistAnalyticsData;
}

export function GrowthInsights({ analytics }: GrowthInsightsProps) {
  const insights = [
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Growth Insights</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-lg border bg-muted/20">
        {insights.map((insight) => (
          <div key={insight.title} className="text-center">
            <div className="text-2xl font-bold">{insight.value}</div>
            <div className="text-sm text-muted-foreground">{insight.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
