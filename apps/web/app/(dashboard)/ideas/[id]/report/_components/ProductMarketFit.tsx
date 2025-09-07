"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { useProductMarketFit } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";
import { cn } from "@workspace/ui/lib/utils";

interface ProductMarketFitProps {
  ideaId: string;
}

export function ProductMarketFit({ ideaId }: ProductMarketFitProps) {
  const { data, isLoading, error } = useProductMarketFit(ideaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const getPMFAssessment = (score: number) => {
    if (score >= 80)
      return "Excellent product-market fit with strong customer validation and market traction";
    if (score >= 70)
      return "Good product-market fit showing positive customer response and growth potential";
    if (score >= 60)
      return "Moderate product-market fit requiring optimization and enhanced customer alignment";
    if (score >= 40)
      return "Limited product-market fit necessitating significant product and strategy adjustments";
    return "Poor product-market fit requiring fundamental product redesign or market repositioning";
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const feedbackCount = data.feedback?.length || 0;
  const positiveFeedback =
    data.feedback?.filter((f) => f.sentiment.toLowerCase() === "positive")
      .length || 0;
  const negativeFeedback =
    data.feedback?.filter((f) => f.sentiment.toLowerCase() === "negative")
      .length || 0;
  const neutralFeedback = feedbackCount - positiveFeedback - negativeFeedback;

  const sentimentScore =
    feedbackCount > 0
      ? Math.round((positiveFeedback / feedbackCount) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Product-Market Fit Assessment"
          score={data.pmfScore}
          subtitle="Customer Validation & Market Traction Analysis"
          description="Comprehensive evaluation of product-market alignment through customer feedback, metrics, and market response"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our product-market fit analysis indicates a PMF score of{" "}
            <strong>{Math.round(data.pmfScore)}/100</strong> based on
            {feedbackCount > 0
              ? `${feedbackCount} customer feedback responses`
              : "market research and validation metrics"}
            . Customer sentiment analysis shows{" "}
            <strong>{sentimentScore}% positive reception</strong>
            {positiveFeedback > 0 &&
              negativeFeedback > 0 &&
              ` with ${positiveFeedback} positive and ${negativeFeedback} negative responses`}
            .
          </ReportParagraph>

          <ReportHighlight
            type={
              data.pmfScore >= 70
                ? "success"
                : data.pmfScore >= 50
                  ? "info"
                  : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>PMF Assessment:</strong> {getPMFAssessment(data.pmfScore)}
            </ReportParagraph>
          </ReportHighlight>

          {/* PMF Metrics Analysis */}
          {data.metrics && data.metrics.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Key Performance Metrics</h3>
              <ReportParagraph>
                Our analysis tracks {data.metrics.length} critical
                product-market fit indicators providing quantitative validation
                of market acceptance and customer engagement:
              </ReportParagraph>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.metrics.map((metric) => {
                  const trendIcon =
                    String(metric.trend) === "up"
                      ? "↗"
                      : String(metric.trend) === "down"
                        ? "↘"
                        : "→";
                  const trendColor =
                    String(metric.trend) === "up"
                      ? "text-green-600"
                      : String(metric.trend) === "down"
                        ? "text-red-600"
                        : "text-gray-600";

                  return (
                    <div key={metric.id} className="p-3 border rounded-lg">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">{metric.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {typeof metric.value === "number"
                              ? Math.round(metric.value * 100) / 100
                              : metric.value}
                            {metric.unit}
                          </span>
                          {metric.trend && (
                            <span className={`text-sm ${trendColor}`}>
                              {trendIcon}
                            </span>
                          )}
                        </div>
                        {metric.benchmark && (
                          <div className="text-xs text-muted-foreground">
                            Benchmark: {metric.benchmark}
                            {metric.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Benchmark Comparison */}
              {data.metrics.some((m) => m.benchmark) && (
                <div className="space-y-3">
                  <h4 className="font-bold">Industry Benchmark Comparison</h4>
                  <ReportParagraph>
                    Comparing our metrics against industry benchmarks reveals
                    performance positioning and areas for optimization:
                  </ReportParagraph>

                  <div className="space-y-2">
                    {data.metrics
                      .filter((m) => m.benchmark)
                      .map((metric) => {
                        const performance =
                          metric.value >= (metric.benchmark || 0)
                            ? "above"
                            : "below";
                        const performanceColor =
                          performance === "above"
                            ? "text-green-600"
                            : "text-red-600";

                        return (
                          <div
                            key={`benchmark-${metric.id}`}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div>
                              <div className="font-medium">{metric.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Industry benchmark comparison
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold">
                                  {Math.round(metric.value * 100) / 100}
                                  {metric.unit}
                                </span>
                                <span className="text-muted-foreground">
                                  vs
                                </span>
                                <span className="text-muted-foreground">
                                  {metric.benchmark}
                                  {metric.unit}
                                </span>
                              </div>
                              <Badge
                                variant={
                                  performance === "above"
                                    ? "success"
                                    : "secondary"
                                }
                                className="text-xs mt-1"
                              >
                                {performance === "above" ? "Above" : "Below"}{" "}
                                benchmark
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Feedback Analysis */}
          {data.feedback && data.feedback.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Customer Feedback Analysis</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <ReportMetric
                  label="Total Feedback"
                  value={feedbackCount}
                  description="Customer responses collected"
                />
                <ReportMetric
                  label="Positive Sentiment"
                  value={Math.round(sentimentScore)}
                  unit="%"
                  description="Favorable customer responses"
                />
                <ReportMetric
                  label="Response Sources"
                  value={
                    [...new Set(data.feedback.map((f) => f.source))].length
                  }
                  description="Unique feedback channels"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold">Sentiment Breakdown</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Positive: {positiveFeedback}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Neutral: {neutralFeedback}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm">
                      Negative: {negativeFeedback}
                    </span>
                  </div>
                </div>
              </div>

              <ReportParagraph>
                Customer feedback analysis reveals{" "}
                {sentimentScore >= 70
                  ? "strong"
                  : sentimentScore >= 50
                    ? "moderate"
                    : "weak"}
                product-market alignment with {sentimentScore}% positive
                sentiment. Key insights from {feedbackCount} customer responses
                across multiple channels:
              </ReportParagraph>

              <div className="space-y-3">
                {data.feedback.slice(0, 6).map((feedback) => (
                  <div key={feedback.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getSentimentIcon(feedback.sentiment)}
                        <Badge variant="outline" className="text-xs">
                          {feedback.source}
                        </Badge>
                        <Badge
                          variant={
                            feedback.sentiment.toLowerCase() === "positive"
                              ? "success"
                              : feedback.sentiment.toLowerCase() === "negative"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {feedback.sentiment}
                        </Badge>
                      </div>
                      {feedback.tags && feedback.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {feedback.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ReportParagraph>{feedback.content}</ReportParagraph>
                  </div>
                ))}
              </div>

              {data.feedback.length > 6 && (
                <p className="text-center text-sm text-muted-foreground">
                  ... and {data.feedback.length - 6} additional feedback
                  responses
                </p>
              )}
            </div>
          )}

          {/* Common Themes Analysis */}
          {data.feedback && data.feedback.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Key Themes & Insights</h3>
              <ReportParagraph>
                Analysis of customer feedback reveals recurring themes that
                provide strategic insights for product development and market
                positioning:
              </ReportParagraph>

              <div className="flex flex-wrap gap-2">
                {Object.entries(
                  data.feedback
                    .flatMap((f) => f.tags)
                    .reduce(
                      (acc, tag) => {
                        acc[tag] = (acc[tag] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([tag, count]) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag} ({count})
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* PMF Recommendations */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              Product-Market Fit Recommendations
            </h3>
            <ReportList
              items={[
                data.pmfScore >= 70
                  ? "Strong PMF score indicates readiness for scale and market expansion"
                  : "PMF score requires improvement through customer feedback integration and product optimization",
                sentimentScore >= 70
                  ? "Positive customer sentiment supports continued product development direction"
                  : "Mixed customer sentiment requires product adjustments and enhanced value proposition",
                data.metrics?.some((m) => String(m.trend) === "up")
                  ? "Positive metric trends indicate growing market traction"
                  : "Metric optimization needed to demonstrate sustainable growth",
                feedbackCount >= 50
                  ? "Substantial feedback volume provides reliable insights for decision-making"
                  : "Additional customer feedback collection recommended for statistical confidence",
              ]}
            />
          </div>

          <ReportParagraph>
            The product-market fit assessment indicates{" "}
            {data.pmfScore >= 70 ? "strong alignment" : "developing alignment"}
            between product offering and market demand. Strategic priorities
            include
            {sentimentScore < 70
              ? "addressing customer concerns and improving satisfaction, "
              : ""}
            {data.pmfScore < 70 ? "enhancing product-market alignment, " : ""}
            and leveraging positive feedback themes for marketing and product
            development optimization.
          </ReportParagraph>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
