import React from "react";
import { MarketTrends } from "@/components/idea/market/market-trends";
import { TargetAudience } from "@/components/idea/market/target-audience";
import { MarketSignals } from "@/components/idea/market/market-signals";
import { MarketOverviewCard } from "@/components/idea/validation/market-overview-card";
import { getSingleIdea } from "@/actions/idea";
import {
  getMarketResearch,
  getTargetAudiences,
  getMarketTrends,
  getMarketSignals,
} from "@/actions/idea/market-research";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { TrendingUp, Activity, Users } from "lucide-react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

const MarketPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const queryClient = new QueryClient();

  // Prefetch all market research data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["idea", id],
      queryFn: () => getSingleIdea(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["market-research", id],
      queryFn: () => getMarketResearch(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["target-audiences", id],
      queryFn: () => getTargetAudiences(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["market-trends", id],
      queryFn: () => getMarketTrends(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["market-signals", id],
      queryFn: () => getMarketSignals(id),
    }),
  ]);

  const idea = await getSingleIdea(id);

  if (!idea) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Idea not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        {/* Market Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Market Overview
            </CardTitle>
            <CardDescription>
              Market size, opportunity, and growth potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarketOverviewCard ideaId={id} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Market Trends
              </CardTitle>
              <CardDescription>
                Key trends affecting your market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketTrends ideaId={id} />
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Target Audience
              </CardTitle>
              <CardDescription>
                Customer segments and demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TargetAudience ideaId={id} />
            </CardContent>
          </Card>
        </div>

        {/* Market Signals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Market Signals
            </CardTitle>
            <CardDescription>
              Key market events and their impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarketSignals ideaId={id} />
          </CardContent>
        </Card>
      </div>
    </HydrationBoundary>
  );
};

export default MarketPage;
