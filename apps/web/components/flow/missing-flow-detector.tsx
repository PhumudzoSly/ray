"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Brain,
  Plus,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Loader2,
  TrendingUp,
  Target,
  Zap,
  FileText,
} from "lucide-react";
import { Project } from "@/lib/types";
import {
  analyzeProjectFlows,
  MissingFlow,
  FlowRecommendation,
} from "@/lib/ai-flow-analyzer";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Id } from "@workspace/backend";
import moment from "moment";
import { useSession } from "@/context/session-context";

interface MissingFlowDetectorProps {
  project: Project;
  onAddNode: (type: string, label: string, description: string) => void;
}

export function MissingFlowDetector({
  project,
  onAddNode,
}: MissingFlowDetectorProps) {
  const { token } = useSession();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    missingFlows: MissingFlow[];
    recommendations: FlowRecommendation[];
    analysis: string;
  } | null>(null);

  // Fetch existing analysis reports
  const existingAnalysis = useQuery(api.analysisReports.getLatestByType, {
    projectId: project._id as Id<"projects">,
    type: "flow_analysis",
    token,
  });

  // Mutations for saving analysis
  const createAnalysisReport = useMutation(api.analysisReports.create);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeProjectFlows(project);
      setAnalysis(result);

      // Save analysis to database
      const analysisContent = `# Flow Analysis Report

## Missing Flows (${result.missingFlows.length})

${result.missingFlows
  .map(
    (flow) => `
### ${flow.label} (${flow.priority} priority)
**Type:** ${flow.type}
**Description:** ${flow.description}
**Reasoning:** ${flow.reasoning}
`
  )
  .join("\n")}

## Recommendations (${result.recommendations.length})

${result.recommendations
  .map(
    (rec) => `
### ${rec.title} (${rec.priority} priority)
**Type:** ${rec.type}
**Description:** ${rec.description}
**Impact:** ${rec.impact}
**Implementation:** ${rec.implementation}
`
  )
  .join("\n")}

## Analysis

${result.analysis}
`;

      await createAnalysisReport({
        projectId: project._id as Id<"projects">,
        type: "flow_analysis",
        title: `Flow Analysis - ${new Date().toLocaleDateString()}`,
        content: analysisContent,
        metadata: {
          missingFlowsCount: result.missingFlows.length,
          recommendationsCount: result.recommendations.length,
          analysisScore: Math.round(
            (result.missingFlows.length + result.recommendations.length) / 2
          ),
        },
        token,
      });

      toast.success("Flow analysis completed and saved!");
    } catch (error) {
      toast.error("Failed to analyze flows");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddMissingFlow = (flow: MissingFlow) => {
    onAddNode(flow.type, flow.label, flow.description);
    toast.success(`Added ${flow.label} to your flow!`);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge>High</Badge>;
      case "medium":
        return <Badge>Medium</Badge>;
      case "low":
        return <Badge>Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "add_node":
        return Plus;
      case "connect_nodes":
        return TrendingUp;
      case "modify_node":
        return Target;
      case "restructure":
        return Zap;
      default:
        return Lightbulb;
    }
  };

  // Use existing analysis if available, otherwise use current analysis
  const displayAnalysis =
    analysis ||
    (existingAnalysis
      ? {
          missingFlows: [],
          recommendations: [],
          analysis: existingAnalysis.content,
        }
      : null);

  return (
    <Card className="bg-transparent border-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {existingAnalysis && (
              <>
                <div className="text-sm text-muted-foreground">
                  Last analysis: {moment(existingAnalysis.createdAt).fromNow()}
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Saved
                </Badge>
              </>
            )}
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing} size="sm">
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                {existingAnalysis ? "Re-analyze" : "Analyze Flows"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayAnalysis === undefined && !analyzing && (
          <div className="flex flex-col items-center justify-center py-16">
            <Brain className="w-14 h-14 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">AI Flow Analysis</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Analyze your flow to identify missing flows and recommendations.
            </p>
            <Button onClick={handleAnalyze}>
              <Brain className="w-4 h-4 mr-2" /> Start Analysis
            </Button>
          </div>
        )}
        {analyzing || existingAnalysis === undefined ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-14 h-14 text-primary mb-4 animate-spin" />
          </div>
        ) : (
          <>
            {displayAnalysis ? (
              <Tabs defaultValue="missing" className="w-full mt-0">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger
                    value="missing"
                    className="flex items-center gap-3"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Missing Flows
                    {displayAnalysis.missingFlows.length > 0 && (
                      <Badge className="ml-1">
                        {displayAnalysis.missingFlows.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="recommendations"
                    className="flex items-center gap-3"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Recommendations
                    {displayAnalysis.recommendations.length > 0 && (
                      <Badge className="ml-1">
                        {displayAnalysis.recommendations.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="analysis"
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Analysis
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="missing" className="mt-2">
                  <ScrollArea>
                    <div className="space-y-4">
                      {displayAnalysis.missingFlows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <CheckCircle className="w-12 h-12 text-success mb-3" />
                          <h3 className="text-lg font-semibold mb-1">
                            Great Job!
                          </h3>
                          <p className="text-muted-foreground text-center max-w-xs">
                            No critical missing flows detected. Your project
                            structure looks comprehensive.
                          </p>
                        </div>
                      ) : (
                        displayAnalysis.missingFlows.map((flow, index) => (
                          <Card className="bg-transparent border-0" key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-base">
                                  {flow.label}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {getPriorityBadge(flow.priority)}
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="rounded-full px-3 py-1 text-xs font-medium"
                                    onClick={() => handleAddMissingFlow(flow)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" /> Add
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {flow.description}
                              </p>
                              <div className="text-xs bg-muted p-2 rounded">
                                <strong>Why it's important:</strong>{" "}
                                {flow.reasoning}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="recommendations" className="mt-2">
                  <ScrollArea>
                    <div className="space-y-4">
                      {displayAnalysis.recommendations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <CheckCircle className="w-12 h-12 text-success mb-3" />
                          <h3 className="text-lg font-semibold mb-1">
                            Excellent Structure!
                          </h3>
                          <p className="text-muted-foreground text-center max-w-xs">
                            No immediate improvements needed. Your flow
                            structure is well-designed.
                          </p>
                        </div>
                      ) : (
                        displayAnalysis.recommendations.map((rec, index) => {
                          const IconComponent = getRecommendationIcon(rec.type);
                          return (
                            <Card
                              key={index}
                              className="bg-transparent border-0"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4 text-primary" />
                                    <h4 className="font-semibold text-base">
                                      {rec.title}
                                    </h4>
                                  </div>
                                  {getPriorityBadge(rec.priority)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {rec.description}
                                </p>
                                <div className="space-y-2 text-xs">
                                  <div className="bg-muted p-2 rounded">
                                    <strong>Expected Impact:</strong>{" "}
                                    {rec.impact}
                                  </div>
                                  <div className="bg-muted p-2 rounded">
                                    <strong>Implementation:</strong>{" "}
                                    {rec.implementation}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="analysis" className="mt-2">
                  <Card className="bg-transparent border-0">
                    <CardContent className="p-4">
                      <ScrollArea>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {displayAnalysis.analysis}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
