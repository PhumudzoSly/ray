import React, { Suspense } from "react";
import { getValidationOverview } from "@/actions/idea/validation-overview";
import { ValidationDashboard } from "@/components/idea/validation/validation-dashboard";
import { PMFMetrics } from "@/components/idea/validation/pmf-metrics";
import { ModuleStatusGrid } from "@/components/idea/validation/module-status-grid";
import { RiskAnalysis } from "@/components/idea/validation/risk-analysis";
import { ActionItemsSummary } from "@/components/idea/validation/action-items-summary";
import { QualitativeFeedbackSummary } from "@/components/idea/validation/qualitative-feedback-summary";
import { ProgressIndicators } from "@/components/idea/validation/progress-indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface ValidationOverviewPageProps {
  params: Promise<{ id: string }>;
}

// Loading skeleton component
function ValidationOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Dashboard skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PMF Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Status Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-20 mb-3" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main content component
async function ValidationOverviewContent({ ideaId }: { ideaId: string }) {
  const validation = await getValidationOverview({ ideaId: ideaId });

  if (!validation) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Validation data not found.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for components
  const pmfMetrics = validation.productMarketFitAnalysis?.metrics || [];
  const npsMetric = pmfMetrics.find(metric => metric.name === "NPS");
  const retentionMetrics = pmfMetrics.filter(metric => metric.name.startsWith("Retention"));
  
  // Format retention data for chart
  const retentionRateData = retentionMetrics.map(metric => ({
    month: metric.name.replace("Retention ", ""),
    rate: metric.value
  }));

  // Get "Must-have" score from market validation insights
  const mustHaveInsight = validation.marketValidation?.marketInsights.find(
    insight => insight.category === "success_factor" && 
    (insight.label?.toLowerCase().includes("must") || insight.label?.toLowerCase().includes("essential"))
  );

  // Prepare module status data
  const modules = [
    {
      title: "Market Validation",
      status: validation.marketValidation?.status,
      score: validation.marketValidation?.overallMarketScore,
      progress: undefined
    },
    {
      title: "Business Validation",
      status: validation.businessValidation?.status,
      score: validation.businessValidation?.overallBusinessScore,
      progress: undefined
    },
    {
      title: "Risk Analysis",
      status: validation.riskAnalysis?.status,
      score: validation.riskAnalysis?.overallRiskScore,
      progress: undefined
    },
    {
      title: "Product-Market Fit",
      status: validation.productMarketFitAnalysis?.status,
      score: validation.productMarketFitAnalysis?.pmfScore,
      progress: undefined
    },
    {
      title: "Audience Segmentation",
      status: undefined, // TargetAudienceSegmentation model doesn't have status property
      score: validation.TargetAudienceSegmentation?.overallSegmentationScore,
      progress: undefined
    },
    {
      title: "Pricing Strategy",
      status: undefined, // PricingStrategyAnalysis model doesn't have status property
      score: validation.PricingStrategyAnalysis?.overallPricingScore,
      progress: undefined
    }
  ];

  // Prepare progress indicators data
  const progressModules = [
    {
      title: "Market Validation",
      progress: validation.marketValidation?.overallMarketScore,
      status: validation.marketValidation?.status
    },
    {
      title: "Business Validation",
      progress: validation.businessValidation?.overallBusinessScore,
      status: validation.businessValidation?.status
    },
    {
      title: "Risk Analysis",
      progress: validation.riskAnalysis?.overallRiskScore,
      status: validation.riskAnalysis?.status
    },
    {
      title: "Product-Market Fit",
      progress: validation.productMarketFitAnalysis?.pmfScore,
      status: validation.productMarketFitAnalysis?.status
    },
    {
      title: "Audience Segmentation",
      progress: validation.TargetAudienceSegmentation?.overallSegmentationScore,
      status: undefined // TargetAudienceSegmentation model doesn't have status property
    },
    {
      title: "Pricing Strategy",
      progress: validation.PricingStrategyAnalysis?.overallPricingScore,
      status: undefined // PricingStrategyAnalysis model doesn't have status property
    }
  ];

  // Prepare action items data
  const actionItems: any[] = [
    // This would come from actual action items in the database
  ];

  // Prepare feedback data (feedback property doesn't exist on ProductMarketFitAnalysis model)
  const feedbackItems: any[] = [];

  // Get DAU/MAU ratio from metrics
  const dauMauMetric = pmfMetrics.find(metric => metric.name === "DAU_MAU_Ratio");

  return (
    <div className="space-y-8">
      {/* Overall Validation Dashboard */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Validation Dashboard</h2>
        <ValidationDashboard
          overallScore={validation.overallScore}
          overallStatus={validation.overallStatus}
          confidenceLevel={validation.confidenceLevel}
          validationProgress={validation.validationProgress}
          overallStrengthScore={validation.validationMetrics?.overallStrengthScore}
          overallRiskScore={validation.validationMetrics?.overallRiskScore}
          timeToMarket={validation.validationMetrics?.timeToMarket}
          fundingRequired={validation.validationMetrics?.fundingRequired}
          breakEvenMonth={validation.validationMetrics?.breakEvenMonth}
          startedAt={validation.startedAt}
          completedAt={validation.completedAt}
          lastUpdatedAt={validation.lastUpdatedAt}
        />
      </section>

      {/* Key Performance Indicators */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customer Payback Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {validation.validationMetrics?.customerPayback ? 
                  `${validation.validationMetrics.customerPayback} months` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Market Penetration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {validation.validationMetrics?.marketPenetration ? 
                  `${validation.validationMetrics.marketPenetration.toFixed(1)}%` : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Action Items Summary */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Action Items Summary</h2>
        <ActionItemsSummary
          immediateActions={validation.validationMetrics?.immediateActions}
          shortTermActions={validation.validationMetrics?.shortTermActions}
          longTermActions={validation.validationMetrics?.longTermActions}
          actionItems={actionItems}
        />
      </section>

      {/* Product-Market Fit Metrics */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Product-Market Fit</h2>
        <PMFMetrics
          pmfScore={validation.productMarketFitAnalysis?.pmfScore}
          npsScore={npsMetric?.value}
          retentionRateData={retentionRateData}
          mustHaveScore={mustHaveInsight ? parseFloat(mustHaveInsight.impact.toFixed(0)) : undefined}
          dauMauRatio={dauMauMetric?.value}
        />
      </section>

      {/* Qualitative Feedback Summary */}
      {feedbackItems.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Qualitative Feedback</h2>
          <QualitativeFeedbackSummary feedbackItems={feedbackItems} />
        </section>
      )}

      {/* Progress Indicators */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Validation Progress</h2>
        <ProgressIndicators modules={progressModules} />
      </section>

      {/* Module Status Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Validation Modules</h2>
        <ModuleStatusGrid modules={modules} />
      </section>

      {/* Risk Analysis */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
        <RiskAnalysis
          overallRiskScore={validation.riskAnalysis?.overallRiskScore}
          riskItems={validation.riskAnalysis?.riskItems.map(item => ({
            id: item.id,
            category: item.category,
            description: item.description,
            impact: item.impact,
            probability: item.probability
          }))}
        />
      </section>
    </div>
  );
}

const ValidationOverviewPage = async ({ params }: ValidationOverviewPageProps) => {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<ValidationOverviewSkeleton />}>
        <ValidationOverviewContent ideaId={id} />
      </Suspense>
    </div>
  );
};

export default ValidationOverviewPage;