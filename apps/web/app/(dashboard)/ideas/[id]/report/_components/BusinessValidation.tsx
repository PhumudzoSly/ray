"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useBusinessValidation } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";

interface BusinessValidationProps {
  ideaId: string;
}

export function BusinessValidation({ ideaId }: BusinessValidationProps) {
  const { data, isLoading, error } = useBusinessValidation(ideaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const getBusinessModelAssessment = (score: number) => {
    if (score >= 80)
      return "Robust business model with strong revenue potential and sustainable unit economics";
    if (score >= 70)
      return "Solid business model with good monetization prospects and manageable costs";
    if (score >= 60)
      return "Viable business model requiring optimization of key performance metrics";
    if (score >= 40)
      return "Challenging business model necessitating significant structural improvements";
    return "Weak business model requiring fundamental revision of strategy and economics";
  };

  const revenueModel = data.primaryRevenueModel || "TBD";
  const pricingStrategy = data.pricingStrategy || "TBD";
  const pricePoint = data.pricePoint || 0;
  const cac = data.customerAcquisitionCost || 0;
  const ltv = data.customerLifetimeValue || 0;
  const churnRate = data.monthlyChurnRate || 0;
  const breakEven = data.breakEvenMonth || 0;
  const initialInvestment = data.initialInvestment || 0;
  const fundingNeeded = data.totalFundingNeeded || 0;
  const salesCycle = data.salesCycleLength || 0;

  const ltvCacRatio = ltv > 0 && cac > 0 ? ltv / cac : 0;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Business Model Assessment"
          score={data.overallBusinessScore}
          subtitle="Revenue Strategy & Financial Analysis"
          description="Comprehensive evaluation of business model viability, unit economics, and financial projections"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our business model analysis centers on a{" "}
            <strong>{revenueModel}</strong> revenue model with{" "}
            <strong>{pricingStrategy}</strong> pricing strategy. The financial
            projections indicate
            {breakEven > 0
              ? `break-even by month ${breakEven}`
              : "break-even timeline under development"}
            with total capital requirements of{" "}
            <strong>
              ${fundingNeeded > 0 ? Math.round(fundingNeeded / 1000) : "TBD"}K
            </strong>
            .
          </ReportParagraph>

          <ReportHighlight
            type={
              data.overallBusinessScore >= 70
                ? "success"
                : data.overallBusinessScore >= 50
                  ? "info"
                  : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>Business Model Assessment:</strong>{" "}
              {getBusinessModelAssessment(data.overallBusinessScore)}
            </ReportParagraph>
          </ReportHighlight>

          {/* Revenue Model Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Revenue Model
              </p>
              <Badge variant="outline" className="text-sm font-medium">
                {revenueModel}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Pricing Strategy
              </p>
              <Badge variant="outline" className="text-sm font-medium">
                {pricingStrategy}
              </Badge>
            </div>
            <ReportMetric
              label="Price Point"
              value={pricePoint > 0 ? `$${Math.round(pricePoint)}` : "TBD"}
              description="Primary product/service price"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Go-to-Market
              </p>
              <Badge variant="outline" className="text-sm font-medium">
                {data.goToMarketStrategy || "TBD"}
              </Badge>
            </div>
          </div>

          {/* Unit Economics Analysis */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Unit Economics Analysis</h3>
            <ReportParagraph>
              The unit economics reveal{" "}
              {ltvCacRatio >= 3
                ? "healthy"
                : ltvCacRatio >= 2
                  ? "acceptable"
                  : "concerning"}
              customer economics with an LTV:CAC ratio of{" "}
              <strong>
                {ltvCacRatio > 0 ? Math.round(ltvCacRatio * 10) / 10 : "TBD"}
              </strong>
              .
              {churnRate > 0 && (
                <>
                  Monthly churn rate of{" "}
                  <strong>{Math.round(churnRate * 100) / 100}%</strong>
                  {churnRate <= 5
                    ? " indicates strong customer retention"
                    : churnRate <= 10
                      ? " shows moderate customer retention requiring improvement"
                      : " signals high customer attrition requiring immediate attention"}
                  .
                </>
              )}
            </ReportParagraph>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReportMetric
                label="Customer Acquisition Cost (CAC)"
                value={cac > 0 ? `$${Math.round(cac)}` : "TBD"}
                description="Cost to acquire each customer"
              />
              <ReportMetric
                label="Customer Lifetime Value (LTV)"
                value={ltv > 0 ? `$${Math.round(ltv)}` : "TBD"}
                description="Total revenue per customer"
              />
              <ReportMetric
                label="Monthly Churn Rate"
                value={
                  churnRate > 0
                    ? `${Math.round(churnRate * 100) / 100}%`
                    : "TBD"
                }
                description="Customer attrition rate"
              />
            </div>
          </div>

          {/* Financial Projections */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              Financial Projections & Requirements
            </h3>
            <ReportParagraph>
              Our financial analysis projects total capital requirements of
              <strong>
                {" "}
                ${fundingNeeded > 0 ? Math.round(fundingNeeded / 1000) : "TBD"}K
              </strong>{" "}
              including an initial investment of{" "}
              <strong>
                $
                {initialInvestment > 0
                  ? Math.round(initialInvestment / 1000)
                  : "TBD"}
                K
              </strong>
              .
              {salesCycle > 0 && (
                <>
                  The sales cycle length of <strong>{salesCycle} days</strong>
                  {salesCycle <= 30
                    ? " enables rapid revenue generation"
                    : salesCycle <= 90
                      ? " supports steady revenue growth"
                      : " requires patient capital and extended runway"}
                  .
                </>
              )}
            </ReportParagraph>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <ReportMetric
                label="Break Even Timeline"
                value={breakEven > 0 ? `Month ${breakEven}` : "TBD"}
                description="Path to profitability"
              />
              <ReportMetric
                label="Initial Investment"
                value={
                  initialInvestment > 0
                    ? `$${Math.round(initialInvestment / 1000)}K`
                    : "TBD"
                }
                description="Startup capital required"
              />
              <ReportMetric
                label="Total Funding Needed"
                value={
                  fundingNeeded > 0
                    ? `$${Math.round(fundingNeeded / 1000)}K`
                    : "TBD"
                }
                description="Complete capital requirements"
              />
              <ReportMetric
                label="Sales Cycle Length"
                value={salesCycle > 0 ? `${salesCycle} days` : "TBD"}
                description="Time from lead to customer"
              />
            </div>
          </div>

          {/* Monthly Projections Analysis */}
          {data.monthlyProjections && data.monthlyProjections.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">12-Month Financial Forecast</h3>
              <ReportParagraph>
                Our monthly projections demonstrate the business trajectory over
                the first year of operations, showing revenue growth, cost
                evolution, and user acquisition patterns:
              </ReportParagraph>

              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-2 min-w-fit">
                  {data.monthlyProjections.slice(0, 12).map((projection) => {
                    const profit = projection.revenue - projection.costs;
                    return (
                      <div
                        key={projection.id}
                        className="text-center space-y-2 p-3 border rounded-lg"
                      >
                        <div className="text-xs font-medium text-muted-foreground">
                          Month {projection.month}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-green-600">
                            ${Math.round(projection.revenue / 1000)}K
                          </div>
                          <div className="text-xs text-red-600">
                            -${Math.round(projection.costs / 1000)}K
                          </div>
                          <div
                            className={`text-xs font-medium ${
                              profit >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {profit >= 0 ? "+" : ""}${Math.round(profit / 1000)}
                            K
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(projection.users / 100) / 10}K users
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Customer Acquisition Channels */}
          {data.acquisitionChannels && data.acquisitionChannels.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">
                Customer Acquisition Strategy
              </h3>
              <ReportParagraph>
                Our multi-channel acquisition approach leverages{" "}
                {data.acquisitionChannels.length} primary channels with varying
                effectiveness and cost profiles. The strategy prioritizes
                {data.acquisitionChannels.filter((c) => c.effectiveness >= 70)
                  .length > 0
                  ? "high-performing channels while optimizing underperforming ones"
                  : "channel optimization and testing to improve overall effectiveness"}
                .
              </ReportParagraph>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.acquisitionChannels
                  .sort((a, b) => b.effectiveness - a.effectiveness)
                  .map((channel) => (
                    <div
                      key={channel.id}
                      className="text-center space-y-2 p-3 border rounded-lg"
                    >
                      <div className="font-medium text-sm">
                        {channel.channel}
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          channel.effectiveness >= 70
                            ? "text-green-600"
                            : channel.effectiveness >= 50
                              ? "text-blue-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {Math.round(channel.effectiveness)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Effectiveness
                      </div>
                      {channel.cost && (
                        <div className="text-xs text-muted-foreground">
                          ${Math.round(channel.cost)} CAC
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Business Model Recommendations */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Strategic Recommendations</h3>
            <ReportList
              items={[
                ltvCacRatio >= 3
                  ? "Strong unit economics support scalable growth and investor confidence"
                  : "Unit economics require optimization through reduced CAC or increased LTV",
                breakEven <= 18
                  ? "Favorable break-even timeline reduces capital requirements and risk"
                  : "Extended break-even period requires sufficient runway and milestone-based funding",
                churnRate <= 5
                  ? "Low churn rate indicates strong product-market fit and customer satisfaction"
                  : "High churn rate requires immediate attention to customer retention and product improvements",
                data.acquisitionChannels?.some((c) => c.effectiveness >= 70)
                  ? "High-performing acquisition channels identified for scale and investment"
                  : "Acquisition channel optimization critical for sustainable growth",
              ]}
            />
          </div>

          <ReportParagraph>
            The business model analysis indicates{" "}
            {data.overallBusinessScore >= 70
              ? "strong fundamentals"
              : "areas requiring optimization"}
            for sustainable growth. Key focus areas include{" "}
            {ltvCacRatio < 3 ? "improving unit economics, " : ""}
            {churnRate > 5 ? "reducing customer churn, " : ""}
            {breakEven > 18 ? "accelerating path to profitability, " : ""}
            and optimizing customer acquisition efficiency for scalable growth.
          </ReportParagraph>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
