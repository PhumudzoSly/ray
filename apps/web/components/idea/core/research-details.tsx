"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getResearchDetails } from "@/actions/idea";
import { ResearchTypeType, ImportanceType } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Callout } from "@workspace/ui/components/callout";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
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

const RESEARCH_TYPE_LABELS: Record<ResearchTypeType, string> = {
  COMPLETE: "Complete Analysis",
  BUSINESS_MODEL: "Business Model",
  COMPETITIVE_ANALYSIS: "Competitive Analysis",
  CUSTOMER_VALIDATION: "Customer Validation",
  FINANCIAL_PROJECTIONS: "Financial Projections",
  GO_TO_MARKET: "Go-to-Market",
  INVESTMENT_RECOMMENDATION: "Investment Recommendation",
  MARKET_OPPORTUNITY: "Market Opportunity",
  PRODUCT_MARKET_FIT: "Product-Market Fit",
  RISK_ANALYSIS: "Risk Analysis",
  TECHNICAL_FEASIBILITY: "Technical Feasibility",
};

const CONFIDENCE_LEVEL_COLORS: Record<ImportanceType, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
};

const CONFIDENCE_LEVEL_LABELS: Record<ImportanceType, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
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

  const processContent = (text: string) => {
    if (!text) return "";
    let processed = text.replace(/\n/g, "\n\n");
    processed = processed.replace(/^(\d+)\.\s+/gm, "$1\\. ");
    processed = processed.replace(/(\d+\))\s+/gm, "$1 ");
    processed = processed.replace(/(\d+\))\s+/gm, "\n   - ");
    return processed;
  };

  return (
    <div className="w-full text-left space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeSanitize, rehypeRaw, rehypeHighlight]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl md:text-2xl font-semibold mt-6 mb-3 text-foreground"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg md:text-xl font-medium mt-5 mb-2 text-foreground"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-base md:text-lg font-medium mt-4 mb-2 text-foreground"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="mb-4 leading-relaxed text-foreground/90 text-sm md:text-base"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-6 mb-4 space-y-2 text-sm md:text-base"
              {...props}
            />
          ),
          li: ({ node, children, ...props }) => (
            <li className="mb-1 marker:text-foreground/60" {...props}>
              {children}
            </li>
          ),
          a: ({ node, href, children, ...props }) => (
            <a
              className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary transition-colors inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
              href={href}
              {...props}
            >
              {children}
              <ExternalLink className="h-3 w-3" />
            </a>
          ),
          blockquote: ({ node, children, ...props }) => (
            <Callout className="my-4">
              <blockquote className="italic text-sm md:text-base" {...props}>
                {children}
              </blockquote>
            </Callout>
          ),
          code: ({
            inline,
            className,
            children,
            ...props
          }: {
            inline?: boolean;
            className?: string;
            children: React.ReactNode;
          } & React.HTMLProps<HTMLElement>) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            if (inline) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground/80"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="relative my-4">
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  {language && (
                    <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-muted/50 rounded">
                      {language}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(String(children))}
                  >
                    {copiedCode === String(children) ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <pre
                  className="bg-muted p-4 rounded-lg overflow-x-auto text-xs md:text-sm font-mono"
                  {...props}
                >
                  <code className={className}>{children}</code>
                </pre>
              </div>
            );
          },
          pre: ({ node, ...props }) => (
            <pre
              className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-xs md:text-sm"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-border/50 my-6" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 border border-border rounded-lg">
              <table className="min-w-full divide-y divide-border" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted/50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-border/50" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-muted/30 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="py-3 px-4 text-left font-medium text-sm text-foreground/80"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="py-2 px-4 text-sm" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-foreground/90" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through text-foreground/50" {...props} />
          ),
          // Handle task lists (checkboxes)
          input: ({ node, ...props }) => {
            if (props.type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 rounded border-border"
                  checked={props.checked}
                  readOnly
                  {...props}
                />
              );
            }
            return <input {...props} />;
          },
        }}
      >
        {processContent(content)}
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
    queryFn: () => getResearchDetails({ ideaId, researchId: researchId! }),
  });

  if (!research) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="max-w-[800px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <SheetTitle className="text-xl">
                {RESEARCH_TYPE_LABELS[research.research.type]}
              </SheetTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Research Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <Badge
                    variant={
                      research.research.completed ? "default" : "secondary"
                    }
                  >
                    {research.research.completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Confidence Level
                  </div>
                  <Badge
                    className={
                      CONFIDENCE_LEVEL_COLORS[research.research.confidenceLevel]
                    }
                  >
                    {CONFIDENCE_LEVEL_LABELS[research.research.confidenceLevel]}
                  </Badge>
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
                      {research.research.validationScore !== null
                        ? `${research.research.validationScore.toFixed(1)}%`
                        : "N/A"}
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
                    {formatDistanceToNow(
                      new Date(research.research.lastUpdated),
                      {
                        addSuffix: true,
                      }
                    )}
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

              {research.content ? (
                <Card className="p-6">
                  <EnhancedMarkdownRenderer content={research.content} />
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
                      {format(
                        new Date(research.research.createdAt),
                        "PPP 'at' p"
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Research ID:
                    </span>
                    <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
                      {research.research.id}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Type:
                    </span>
                    <span className="ml-2">
                      {RESEARCH_TYPE_LABELS[research.research.type]}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
