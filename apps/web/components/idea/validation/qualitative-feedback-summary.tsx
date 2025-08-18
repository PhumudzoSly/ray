"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

interface QualitativeFeedbackSummaryProps {
  feedbackItems?: {
    id: string;
    source: string;
    sentiment: string;
    content: string;
    tags: string[];
  }[] | null;
}

export function QualitativeFeedbackSummary({ feedbackItems = [] }: QualitativeFeedbackSummaryProps) {
  // Handle case where there's no feedback data
  if (!feedbackItems || feedbackItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No qualitative feedback available
      </div>
    );
  }

  // Group feedback by sentiment
  const sentimentCounts = (feedbackItems || []).reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get top tags
  const tagCounts = (feedbackItems || []).reduce((acc, item) => {
    item.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // Sentiment badge variant
  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive": return "default";
      case "negative": return "destructive";
      case "neutral": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Sentiment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(sentimentCounts).map(([sentiment, count], index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">{sentiment} Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground mt-1">responses</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Key Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tagItem, index) => (
              <Badge key={index} variant="secondary">
                {tagItem.tag} ({tagItem.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Feedback */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(feedbackItems || []).slice(0, 3).map((feedback) => (
              <div key={feedback.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="font-medium">{feedback.source}</div>
                  <Badge variant={getSentimentVariant(feedback.sentiment)}>
                    {feedback.sentiment}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 line-clamp-2">{feedback.content}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {feedback.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}