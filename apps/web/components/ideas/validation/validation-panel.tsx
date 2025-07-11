"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  DollarSign,
  Globe,
  Lightbulb,
  Loader2,
  Target,
  Users,
  XCircle,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { Id } from "@workspace/backend";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
// Note: Individual validation card components will be created later

interface ValidationPanelProps {
  ideaId: Id<"idea">;
  idea: any;
  onSuccess?: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  ideaId,
  idea,
  onSuccess,
}) => {
  const { token } = useSession();
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [showResults, setShowResults] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  // Action to trigger validation
  const triggerValidation = useAction(api.idea.triggerValidation);

  // Query to get detailed validation results from split tables
  const validationDetails = useQuery(api.idea.getValidationDetails, {
    token,
    ideaId,
  });

  const handleValidate = async () => {
    if (!idea) return;

    setIsValidating(true);

    try {
      // Call the new Convex validation action
      const result = await triggerValidation({
        token,
        ideaId: ideaId,
      });

      if (result && result.success) {
        setValidationResults(result.results);
        setShowResults(true);
        setActiveTab("summary");

        toast.success("Idea validation completed successfully!");
        if (onSuccess) onSuccess();
      } else {
        throw new Error("Validation failed");
      }
    } catch (error) {
      console.error("Error validating idea:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to validate idea"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleViewDetails = () => {
    setActiveTab("marketSize");
  };

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  // Helper function to get score icon
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 60)
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (score >= 40)
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  // Determine if we have validation results (from current session, database, or detailed validation)
  const hasValidationResults =
    validationResults ||
    validationDetails?.validation ||
    idea?.aiOverallValidation?.overallRating > 0;

  // Get the score from various sources
  const validationScore =
    validationResults?.overallScore ||
    validationDetails?.validation?.overallScore ||
    idea?.aiOverallValidation?.overallRating ||
    0;

  // Use detailed validation data if available, otherwise fall back to session data
  const currentValidationData = validationDetails
    ? {
        overallScore: validationDetails.validation?.overallScore || 0,
        recommendation: validationDetails.validation?.recommendation || "",
        marketSize: validationDetails.marketSize,
        competitorAnalysis: validationDetails.competitorAnalysis,
        customerFit: validationDetails.customerFit,
        feasibility: validationDetails.feasibility,
        financials: validationDetails.financials,
        userStories: validationDetails.userStories || [],
      }
    : validationResults;

  return (
    <div className="space-y-6">
      {/* Validation Status & Actions Card */}
      <Card
        className={`border ${validationScore >= 70 ? "border-green-500/20" : validationScore >= 50 ? "border-yellow-500/20" : "border-red-500/20"}`}
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Validation System
              </CardTitle>
              <CardDescription className="mt-1">
                Analyze your SaaS idea across market fit, competition,
                feasibility and finances
              </CardDescription>
            </div>

            {!hasValidationResults && (
              <Button
                onClick={handleValidate}
                disabled={isValidating}
                className="w-full md:w-auto"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Validate Idea
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        {hasValidationResults && (
          <CardContent className="pb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-shrink-0">
                <div className="flex items-center justify-center w-32 h-32 rounded-full bg-muted">
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="text-muted-foreground/20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="282.7"
                        strokeDashoffset={
                          282.7 - (282.7 * validationScore) / 100
                        }
                        className={getScoreColor(validationScore)}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col items-center justify-center z-10">
                    <span
                      className={`text-3xl font-bold ${getScoreColor(validationScore)}`}
                    >
                      {validationScore}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      out of 100
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  {getScoreIcon(validationScore)}
                  <span className="font-medium">
                    {validationScore >= 80
                      ? "Strong Validation"
                      : validationScore >= 60
                        ? "Moderate Validation"
                        : validationScore >= 40
                          ? "Weak Validation"
                          : "Not Validated"}
                  </span>
                </div>

                <p className="text-muted-foreground">
                  {validationResults?.recommendation ||
                    idea?.aiOverallValidation?.conclusion ||
                    "This idea has been analyzed by our AI validation system. Review the detailed analysis to understand strengths and weaknesses."}
                </p>

                {!showResults && (
                  <Button onClick={() => setShowResults(true)} className="mt-2">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Analysis
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Validation Analysis Tabs */}
      {showResults && validationResults && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-7">
            <TabsTrigger value="summary" className="text-xs md:text-sm">
              Summary
            </TabsTrigger>
            <TabsTrigger value="marketSize" className="text-xs md:text-sm">
              Market
            </TabsTrigger>
            <TabsTrigger value="competition" className="text-xs md:text-sm">
              Competition
            </TabsTrigger>
            <TabsTrigger value="customerFit" className="text-xs md:text-sm">
              Customer Fit
            </TabsTrigger>
            <TabsTrigger value="feasibility" className="text-xs md:text-sm">
              Feasibility
            </TabsTrigger>
            <TabsTrigger value="finances" className="text-xs md:text-sm">
              Finances
            </TabsTrigger>
            <TabsTrigger value="userStories" className="text-xs md:text-sm">
              User Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Validation Summary</CardTitle>
                <CardDescription>Overall analysis results</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {currentValidationData?.recommendation ||
                    "No recommendation available yet."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketSize" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Market Size Analysis
                </CardTitle>
                <CardDescription>
                  Total addressable market and growth potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentValidationData?.marketSize ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Score</span>
                      <Badge variant="outline">
                        {currentValidationData.marketSize.score}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentValidationData.marketSize.analysis}
                    </p>
                    {currentValidationData.marketSize.marketSizeUSD && (
                      <div className="text-sm">
                        <strong>Market Size:</strong> $
                        {currentValidationData.marketSize.marketSizeUSD.toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No market size data available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competition" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Competitor Analysis
                </CardTitle>
                <CardDescription>
                  Competitive landscape and positioning
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentValidationData?.competitorAnalysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Score</span>
                      <Badge variant="outline">
                        {currentValidationData.competitorAnalysis.score}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentValidationData.competitorAnalysis.analysis}
                    </p>
                    {currentValidationData.competitorAnalysis.competitors
                      ?.length > 0 && (
                      <div>
                        <strong className="text-sm">Key Competitors:</strong>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {currentValidationData.competitorAnalysis.competitors.map(
                            (competitor: string, index: number) => (
                              <li key={index}>{competitor}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No competitor analysis available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customerFit" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Fit Analysis
                </CardTitle>
                <CardDescription>
                  Product-market fit and customer insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentValidationData?.customerFit ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Score</span>
                      <Badge variant="outline">
                        {currentValidationData.customerFit.score}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentValidationData.customerFit.analysis}
                    </p>
                    {currentValidationData.customerFit.painPoints?.length >
                      0 && (
                      <div>
                        <strong className="text-sm">Key Pain Points:</strong>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {currentValidationData.customerFit.painPoints.map(
                            (point: string, index: number) => (
                              <li key={index}>{point}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No customer fit analysis available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feasibility" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Technical Feasibility
                </CardTitle>
                <CardDescription>
                  Development complexity and technical challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentValidationData?.feasibility ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Score</span>
                      <Badge variant="outline">
                        {currentValidationData.feasibility.score}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentValidationData.feasibility.analysis}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        <strong>Time to Market:</strong>{" "}
                        {currentValidationData.feasibility.timeToMarket}
                      </span>
                    </div>
                    {currentValidationData.feasibility.technicalChallenges
                      ?.length > 0 && (
                      <div>
                        <strong className="text-sm">
                          Technical Challenges:
                        </strong>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {currentValidationData.feasibility.technicalChallenges.map(
                            (challenge: string, index: number) => (
                              <li key={index}>{challenge}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No feasibility analysis available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Projections
                </CardTitle>
                <CardDescription>
                  Revenue potential and financial viability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentValidationData?.financials ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Score</span>
                      <Badge variant="outline">
                        {currentValidationData.financials.score}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentValidationData.financials.analysis}
                    </p>
                    <div className="text-sm">
                      <strong>Break-even Point:</strong>{" "}
                      {currentValidationData.financials.breakEvenPoint}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Revenue Projections:</strong>
                        <ul className="text-muted-foreground mt-1">
                          <li>
                            Year 1: $
                            {currentValidationData.financials.estimatedRevenue.year1.toLocaleString()}
                          </li>
                          <li>
                            Year 2: $
                            {currentValidationData.financials.estimatedRevenue.year2.toLocaleString()}
                          </li>
                          <li>
                            Year 3: $
                            {currentValidationData.financials.estimatedRevenue.year3.toLocaleString()}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <strong>Cost Projections:</strong>
                        <ul className="text-muted-foreground mt-1">
                          <li>
                            Year 1: $
                            {currentValidationData.financials.estimatedCosts.year1.toLocaleString()}
                          </li>
                          <li>
                            Year 2: $
                            {currentValidationData.financials.estimatedCosts.year2.toLocaleString()}
                          </li>
                          <li>
                            Year 3: $
                            {currentValidationData.financials.estimatedCosts.year3.toLocaleString()}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No financial analysis available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="userStories" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  User Stories
                </CardTitle>
                <CardDescription>
                  Key user scenarios and acceptance criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentValidationData?.userStories?.length > 0 ? (
                  <div className="space-y-4">
                    {currentValidationData.userStories.map(
                      (story: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="font-medium text-sm mb-2">
                            <strong>Persona:</strong> {story.persona}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {story.story}
                          </div>
                          <div className="text-sm">
                            <strong>Acceptance Criteria:</strong>
                            <ul className="list-disc list-inside text-muted-foreground mt-1">
                              {story.acceptanceCriteria.map(
                                (criteria: string, criteriaIndex: number) => (
                                  <li key={criteriaIndex}>{criteria}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No user stories available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {isValidating && (
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-dashed animate-spin"></div>
              <Brain className="absolute inset-0 m-auto h-12 w-12 text-primary opacity-70" />
            </div>
            <div>
              <h3 className="text-xl font-medium">AI Validation in Progress</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                Our AI is analyzing your idea across multiple dimensions. This
                may take a minute...
              </p>
            </div>
            <div className="w-full max-w-md">
              <Progress value={80} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Market Analysis</span>
                <span>Competition</span>
                <span>Feasibility</span>
                <span>Financials</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
