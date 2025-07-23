"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Target,
  Activity,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  Zap,
} from "lucide-react";
import { RoadmapStatusChart } from "@/components/charts/roadmap-status-chart";
import { RoadmapPriorityChart } from "@/components/charts/roadmap-priority-chart";

interface RoadmapStatsData {
  totalItems: number;
  totalVotes: number;
  totalFeedback: number;
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  sentimentBreakdown: Record<string, number>;
  publicItems: number;
  privateItems: number;
  itemsWithTargetDate: number;
  overdueItems: number;
  mostVotedItems: Array<{
    id: string;
    title: string;
    voteCount: number;
    status: string;
    category: string;
  }>;
  mostFeedbackItems: Array<{
    id: string;
    title: string;
    feedbackCount: number;
    status: string;
    category: string;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    totalVotes: number;
    totalFeedback: number;
    avgVotes: string;
    avgFeedback: string;
  }>;
}

interface RoadmapStatsClientProps {
  stats: RoadmapStatsData;
}

export function RoadmapStatsClient({ stats }: RoadmapStatsClientProps) {
  const completionRate =
    stats.totalItems > 0
      ? ((stats.statusBreakdown.DONE || 0) / stats.totalItems) * 100
      : 0;
  const publicRate =
    stats.totalItems > 0 ? (stats.publicItems / stats.totalItems) * 100 : 0;
  const avgVotesPerItem =
    stats.totalItems > 0 ? stats.totalVotes / stats.totalItems : 0;
  const avgFeedbackPerItem =
    stats.totalItems > 0 ? stats.totalFeedback / stats.totalItems : 0;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Items
              </p>
              <p className="text-3xl font-bold mt-1">{stats.totalItems}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>{stats.publicItems} public</span>
                <span>•</span>
                <EyeOff className="w-3 h-3" />
                <span>{stats.privateItems} private</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Votes
              </p>
              <p className="text-3xl font-bold mt-1">{stats.totalVotes}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <ArrowUpRight className="w-3 h-3" />
                <span>{avgVotesPerItem.toFixed(1)} avg per item</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Feedback
              </p>
              <p className="text-3xl font-bold mt-1">{stats.totalFeedback}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MessageSquare className="w-3 h-3" />
                <span>{avgFeedbackPerItem.toFixed(1)} avg per item</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </p>
              <p className="text-3xl font-bold mt-1">
                {completionRate.toFixed(1)}%
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3" />
                <span>{stats.statusBreakdown.DONE || 0} completed</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RoadmapStatusChart
          statusBreakdown={stats.statusBreakdown}
          totalItems={stats.totalItems}
        />
        <RoadmapPriorityChart
          priorityBreakdown={stats.priorityBreakdown}
          totalItems={stats.totalItems}
        />
      </div>

      {/* Feedback Sentiment */}
      {stats.totalFeedback > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold">Feedback Sentiment</h3>
              <p className="text-sm text-muted-foreground">
                Breakdown of feedback by sentiment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.sentimentBreakdown).map(
              ([sentiment, count]) => {
                const percentage =
                  stats.totalFeedback > 0
                    ? (count / stats.totalFeedback) * 100
                    : 0;
                const sentimentConfig = {
                  positive: {
                    color: "text-emerald-600",
                    bg: "bg-emerald-500/10",
                    icon: TrendingUp,
                  },
                  neutral: {
                    color: "text-yellow-600",
                    bg: "bg-yellow-500/10",
                    icon: Minus,
                  },
                  negative: {
                    color: "text-red-600",
                    bg: "bg-red-500/10",
                    icon: ArrowDownRight,
                  },
                };
                const config =
                  sentimentConfig[sentiment as keyof typeof sentimentConfig];
                const Icon = config.icon;

                return (
                  <div
                    key={sentiment}
                    className={`${config.bg} rounded-xl p-6 border`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}
                      >
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className={`text-2xl font-bold ${config.color}`}>
                        {count}
                      </div>
                    </div>
                    <div className="text-sm font-medium capitalize">
                      {sentiment}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {percentage.toFixed(1)}% of total
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Timeline & Visibility Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">Timeline Overview</h3>
              <p className="text-sm text-muted-foreground">
                Items with target dates and overdue status
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium">
                  Items with target dates
                </span>
              </div>
              <Badge variant="outline" className="font-medium">
                {stats.itemsWithTargetDate}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-medium">Overdue items</span>
              </div>
              <Badge variant="destructive" className="font-medium">
                {stats.overdueItems}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-semibold">Visibility Overview</h3>
              <p className="text-sm text-muted-foreground">
                Public vs private items
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm font-medium">Public items</span>
              </div>
              <Badge variant="outline" className="font-medium">
                {stats.publicItems}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center">
                  <EyeOff className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium">Private items</span>
              </div>
              <Badge variant="outline" className="font-medium">
                {stats.privateItems}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Public ratio</span>
                <span className="font-medium">{publicRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${publicRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Most Voted Items</h3>
              <p className="text-sm text-muted-foreground">
                Items with the highest vote counts
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.mostVotedItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-background hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium line-clamp-1">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="capitalize">
                        {item.status.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="font-medium">
                  {item.voteCount} votes
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Most Feedback Items</h3>
              <p className="text-sm text-muted-foreground">
                Items with the most feedback
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.mostFeedbackItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-background hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium line-clamp-1">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="capitalize">
                        {item.status.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="font-medium">
                  {item.feedbackCount} feedback
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      {stats.categoryStats && stats.categoryStats.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-semibold">Category Performance</h3>
              <p className="text-sm text-muted-foreground">
                Engagement metrics by category
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {stats.categoryStats.map((category) => (
              <div
                key={category.category}
                className="p-6 rounded-xl border bg-background space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">
                        {category.category.replace("_", " ")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {category.count} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {category.totalVotes}
                      </div>
                      <div className="text-xs text-muted-foreground">votes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">
                        {category.totalFeedback}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        feedback
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <ThumbsUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium">Avg votes</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {category.avgVotes}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium">Avg feedback</span>
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {category.avgFeedback}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
