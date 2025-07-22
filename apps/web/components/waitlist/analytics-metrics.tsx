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
  BarChart3,
  Activity,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { WaitlistAnalyticsData } from "@/hooks/use-waitlist-analytics";

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  className = "",
  iconColor = "text-blue-500",
  trend,
}: MetricCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-2 ${iconColor} bg-opacity-10`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
          </div>
          <div className="flex items-baseline gap-4">
            <div className="text-3xl font-bold tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
            {trend && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <ArrowUpRight
                  className={`h-3 w-3 ${trend.isPositive ? "" : "rotate-90"}`}
                />
                {trend.value}%
              </div>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
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
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Invitation Rate",
      value: analytics.invitationRate,
      suffix: "%",
      description: `${analytics.invitedCount} users invited`,
      icon: Mail,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Join Rate",
      value: analytics.joinRate,
      suffix: "%",
      description: `${analytics.joinedCount} actually joined`,
      icon: UserPlus,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-orange-500/10 p-2">
          <Target className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Conversion Funnel</h3>
          <p className="text-sm text-muted-foreground">
            Track your user journey from signup to activation
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.title}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${metric.bgColor}`}>
                    <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{metric.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Step {index + 1}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-4">
                    <div className="text-3xl font-bold tracking-tight">
                      {metric.value}
                      <span className="text-lg font-normal text-muted-foreground ml-1">
                        {metric.suffix}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </div>
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

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-red-500",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/10 p-2">
          <Globe className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Traffic Sources</h3>
          <p className="text-sm text-muted-foreground">
            Where your waitlist signups are coming from
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {sortedSources.map(([source, count], index) => {
          const percentage = Math.round((count / analytics.totalEntries) * 100);
          const color = colors[index % colors.length];
          return (
            <div
              key={source}
              className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <div>
                  <span className="font-medium capitalize">{source}</span>
                  <div className="text-sm text-muted-foreground">
                    {count} users
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-semibold">{percentage}%</div>
                  <div className="text-xs text-muted-foreground">of total</div>
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
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          badge: (
            <Badge
              variant="secondary"
              className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20"
            >
              Pending
            </Badge>
          ),
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
        };
      case "verified":
        return {
          badge: (
            <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">
              Verified
            </Badge>
          ),
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        };
      case "invited":
        return {
          badge: (
            <Badge
              variant="outline"
              className="border-purple-200 text-purple-700"
            >
              Invited
            </Badge>
          ),
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        };
      case "joined":
        return {
          badge: (
            <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
              Joined
            </Badge>
          ),
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        };
      case "bounced":
        return {
          badge: (
            <Badge
              variant="destructive"
              className="bg-red-500/10 text-red-700 hover:bg-red-500/20"
            >
              Bounced
            </Badge>
          ),
          color: "text-red-500",
          bgColor: "bg-red-500/10",
        };
      default:
        return {
          badge: <Badge variant="secondary">{status}</Badge>,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
        };
    }
  };

  const sortedStatuses = Object.entries(analytics.statusBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-green-500/10 p-2">
          <Activity className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Status Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Current state of all waitlist entries
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {sortedStatuses.map(([status, count]) => {
          const percentage = Math.round((count / analytics.totalEntries) * 100);
          const config = getStatusConfig(status);
          return (
            <div
              key={status}
              className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                {config.badge}
                <div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {status}
                  </div>
                  <div className="font-medium">{count} users</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{percentage}%</div>
                <div className="text-xs text-muted-foreground">of total</div>
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
      icon: Share2,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Avg per User",
      value: analytics.avgReferralsPerUser.toFixed(1),
      description: "Average referrals per user",
      icon: BarChart3,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Active Referrers",
      value: analytics.activeReferrers,
      description: "Users who made referrals",
      icon: Users,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-500/10 p-2">
          <Share2 className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Referral Performance</h3>
          <p className="text-sm text-muted-foreground">
            How well your viral loop is working
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 text-center transition-all hover:shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`rounded-lg p-3 ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold tracking-tight">
                  {metric.value}
                </div>
                <div className="text-sm font-medium">{metric.title}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </div>
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
      icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Email Verified",
      value: `${analytics.verificationRate}%`,
      icon: CheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Viral Coefficient",
      value: analytics.avgReferralsPerUser.toFixed(1),
      icon: Zap,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Overall Conversion",
      value: `${analytics.overallConversionRate.toFixed(1)}%`,
      icon: Target,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Growth Insights</h3>
          <p className="text-sm text-muted-foreground">
            Key metrics for your waitlist growth
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 text-center transition-all hover:shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`rounded-lg p-3 ${insight.bgColor}`}>
                  <insight.icon className={`h-6 w-6 ${insight.iconColor}`} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold tracking-tight">
                  {insight.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {insight.title}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
