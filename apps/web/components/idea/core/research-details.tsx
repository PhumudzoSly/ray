"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getValidationResults } from "@/actions/idea/validate";
import { ResearchPhaseTypeType } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Callout } from "@workspace/ui/components/callout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
  Loader2,
  X,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

interface ResearchDetailsProps {
  ideaId: string;
  researchId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const RESEARCH_TYPE_LABELS: Record<ResearchPhaseTypeType, string> = {
  COMPLETE: "Complete Analysis",
  BUSINESS_MODEL: "Business Model",
  COMPETITIVE_ANALYSIS: "Competitive Analysis",
  CUSTOMER_VALIDATION: "Customer Validation",
  FINANCIAL_PROJECTIONS: "Financial Projections",
  GO_TO_MARKET: "Go-to-Market",
  INVESTMENT_RECOMMENDATION: "Investment Recommendation",
  MARKET_SCAN: "Market Opportunity",
  PRODUCT_MARKET_FIT: "Product-Market Fit",
  RISK_ANALYSIS: "Risk Analysis",
  TECHNICAL_FEASIBILITY: "Technical Feasibility",
};

// Enhanced Markdown Renderer Component
function EnhancedMarkdownRenderer({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="w-full prose prose-dark text-left space-y-4 overflow-x-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeSanitize, rehypeRaw, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function ResearchDetails({
  ideaId,
  researchId,
  isOpen,
  onClose,
}: ResearchDetailsProps) {
  const { data: research, isLoading } = useQuery({
    queryKey: ["idea-research", ideaId, researchId],
    queryFn: () => getValidationResults({ researchId: researchId! }),
    enabled: !!researchId, // Only run query when researchId is not null
  });

  // Don't render anything if researchId is null or research data is not available
  if (!researchId || !research) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full h-full !p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-xl">{research.name}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-full">
          <div className="px-6 space-y-6">
            {/* Research Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <Badge
                    variant={
                      research.status === "COMPLETED" ? "default" : "secondary"
                    }
                  >
                    {research.status === "COMPLETED"
                      ? "Completed"
                      : "In Progress"}
                  </Badge>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Confidence Level
                  </div>
                  <span className="font-semibold">
                    {research.overallConfidence.toFixed(1)}%
                  </span>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Validation Score
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">
                      {research.overallConfidence.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatDistanceToNow(new Date(research.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </Card>
            </div>

            <Separator />

            {/* Research Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Research Results</h3>
              </div>

              {research.findings && research.findings.length > 0 ? (
                <Card className="p-6">
                  <div className="space-y-4">
                    {research.findings.map((finding, index) => (
                      <div
                        key={finding.id}
                        className="border-l-4 border-blue-200 pl-4"
                      >
                        <div className="font-medium mb-2">
                          Finding {index + 1}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Impact: {finding.impact}
                        </div>
                        <EnhancedMarkdownRenderer content={finding.findings} />
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">Research in Progress</p>
                    <p className="text-sm">
                      The research results will appear here once completed.
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Research Metadata */}
            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Research Details</h3>
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Created:
                    </span>
                    <span className="ml-2">
                      {format(new Date(research.createdAt), "PPP 'at' p")}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Research ID:
                    </span>
                    <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
                      {research.id}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Depth:
                    </span>
                    <span className="ml-2">{research.depth}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
