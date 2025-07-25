"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompetitiveMoves } from "@/actions/idea/competitive-analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  TrendingUp,
  Calendar,
  Target,
  Zap,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface CompetitiveMovesProps {
  ideaId: string;
}

function getMoveTypeIcon(moveType: string) {
  switch (moveType?.toLowerCase()) {
    case "product_launch":
      return <Zap className="h-4 w-4" />;
    case "pricing_change":
      return <TrendingUp className="h-4 w-4" />;
    case "partnership":
      return <ArrowUpRight className="h-4 w-4" />;
    case "acquisition":
      return <ArrowDownRight className="h-4 w-4" />;
    case "feature_update":
      return <Target className="h-4 w-4" />;
    default:
      return <Minus className="h-4 w-4" />;
  }
}

function getMoveTypeColor(moveType: string) {
  switch (moveType?.toLowerCase()) {
    case "product_launch":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "pricing_change":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "partnership":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "acquisition":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "feature_update":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

function getImpactColor(impact: string) {
  switch (impact?.toLowerCase()) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-yellow-600";
    case "low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CompetitiveMoves({ ideaId }: CompetitiveMovesProps) {
  const {
    data: moves,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["competitive-moves", ideaId],
    queryFn: () => getCompetitiveMoves(ideaId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Competitive Moves
          </CardTitle>
          <CardDescription>
            Strategic actions and market movements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Competitive Moves
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to load competitive moves data
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!moves || moves.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Competitive Moves
          </CardTitle>
          <CardDescription>
            Strategic actions and market movements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No competitive moves data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort moves by date (most recent first)
  const sortedMoves = [...moves].sort(
    (a, b) =>
      new Date(b.announcedDate || b.createdAt || "").getTime() -
      new Date(a.announcedDate || a.createdAt || "").getTime()
  );

  // Group moves by month for timeline view
  const movesByMonth = sortedMoves.reduce(
    (groups: Record<string, typeof moves>, move: any) => {
      const date = new Date(move.announcedDate || move.createdAt || "");
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(move);
      return groups;
    },
    {} as Record<string, typeof moves>
  );

  const sortedMonths = Object.keys(movesByMonth).sort().reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Competitive Moves
        </CardTitle>
        <CardDescription>
          Timeline of strategic actions and market movements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="text-2xl font-bold">{moves.length}</div>
            <div className="text-sm text-muted-foreground">Total Moves</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {moves.filter((m: any) => m.impactLevel === "HIGH").length}
            </div>
            <div className="text-sm text-muted-foreground">High Impact</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {new Set(moves.map((m: any) => m.competitorId)).size}
            </div>
            <div className="text-sm text-muted-foreground">
              Active Competitors
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {new Set(moves.map((m: any) => m.moveType)).size}
            </div>
            <div className="text-sm text-muted-foreground">Move Types</div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Timeline</h3>
          <div className="space-y-8">
            {sortedMonths.map((monthKey) => {
              const [year, month] = monthKey.split("-");
              const monthName = new Date(
                parseInt(year || "0"),
                parseInt(month || "0")
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              });
              const monthMoves = movesByMonth[monthKey] || [];

              return (
                <div key={monthKey} className="space-y-4">
                  <h4 className="text-md font-medium text-muted-foreground">
                    {monthName}
                  </h4>
                  <div className="space-y-4">
                    {monthMoves.map((move: any) => (
                      <div
                        key={move.id}
                        className="border-l-2 border-muted pl-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getMoveTypeIcon(move.moveType)}
                              <Badge
                                className={getMoveTypeColor(move.moveType)}
                              >
                                {move.moveType?.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(
                                move.announcedDate || move.createdAt || ""
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={getImpactColor(move.impactLevel)}
                          >
                            {move.impactLevel?.toUpperCase()} Impact
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-medium">{move.title}</h5>
                          {move.description && (
                            <p className="text-sm text-muted-foreground">
                              {move.description}
                            </p>
                          )}
                        </div>

                        {/* Impact Analysis */}
                        {(move.marketImpact ||
                          move.competitiveImpact ||
                          move.strategicImplications) && (
                          <div className="space-y-2">
                            <h6 className="text-sm font-medium flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Impact Analysis
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              {move.marketImpact && (
                                <div className="space-y-1">
                                  <div className="font-medium text-muted-foreground">
                                    Market Impact
                                  </div>
                                  <div>{move.marketImpact}</div>
                                </div>
                              )}
                              {move.competitiveImpact && (
                                <div className="space-y-1">
                                  <div className="font-medium text-muted-foreground">
                                    Competitive Impact
                                  </div>
                                  <div>{move.competitiveImpact}</div>
                                </div>
                              )}
                              {move.strategicImplications && (
                                <div className="space-y-1">
                                  <div className="font-medium text-muted-foreground">
                                    Strategic Implications
                                  </div>
                                  <div>{move.strategicImplications}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Response Requirements */}
                        {move.responseRequirements && (
                          <div className="space-y-2">
                            <h6 className="text-sm font-medium">
                              Response Requirements
                            </h6>
                            <p className="text-sm text-muted-foreground">
                              {move.responseRequirements}
                            </p>
                          </div>
                        )}

                        {/* Target Audience */}
                        {move.targetAudience && (
                          <div className="space-y-2">
                            <h6 className="text-sm font-medium flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Target Audience
                            </h6>
                            <p className="text-sm text-muted-foreground">
                              {move.targetAudience}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Move Type Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Move Type Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              moves.reduce(
                (acc: Record<string, number>, move: any) => {
                  const type = move.moveType || "unknown";
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>
              )
            ).map(([type, count]: [string, number]) => (
              <div key={type} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {getMoveTypeIcon(type)}
                  <span className="font-medium">
                    {type.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">
                  {((count / moves.length) * 100).toFixed(1)}% of total moves
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Distribution */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Impact Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["HIGH", "MEDIUM", "LOW"].map((impact) => {
              const count = moves.filter(
                (m: any) => m.impactLevel === impact
              ).length;
              return (
                <div key={impact} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        impact === "HIGH"
                          ? "bg-red-500"
                          : impact === "MEDIUM"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    <span className="font-medium capitalize">
                      {impact.toLowerCase()} Impact
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">
                    {((count / moves.length) * 100).toFixed(1)}% of total moves
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
