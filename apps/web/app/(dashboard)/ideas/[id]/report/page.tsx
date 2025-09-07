import { Separator } from "@workspace/ui/components/separator";
import { ValidationHeader } from "./_components/ValidationHeader";
import { ValidationOverview } from "./_components/ValidationOverview";
import { MarketValidation } from "./_components/MarketValidation";
import { BusinessValidation } from "./_components/BusinessValidation";
import { RiskAnalysis } from "./_components/RiskAnalysis";
import { ProductMarketFit } from "./_components/ProductMarketFit";
import { CustomerJourney } from "./_components/CustomerJourney";
import { AudienceSegmentation } from "./_components/AudienceSegmentation";
import { MarketTrends } from "./_components/MarketTrends";
import { CustomerNeeds } from "./_components/CustomerNeeds";
import { PricingStrategy } from "./_components/PricingStrategy";
import { ValidationMetrics } from "./_components/ValidationMetrics";

interface ValidationReportProps {
  params: Promise<{ id: string }>;
}

const ValidationReport = async ({ params }: ValidationReportProps) => {
  const { id } = await params;

  return (
    <div className="space-y-8">
      {/* Validation Header with Overall Scores */}
      <ValidationHeader ideaId={id} />

      {/* Executive Summary */}
      <ValidationOverview ideaId={id} />

      {/* Detailed Validation Modules */}
      <div className="space-y-6">
        <MarketValidation ideaId={id} />
        <BusinessValidation ideaId={id} />
        <RiskAnalysis ideaId={id} />
        <ProductMarketFit ideaId={id} />
        <CustomerJourney ideaId={id} />
        <AudienceSegmentation ideaId={id} />
        <MarketTrends ideaId={id} />
        <CustomerNeeds ideaId={id} />
        <PricingStrategy ideaId={id} />
        <ValidationMetrics ideaId={id} />
      </div>
    </div>
  );
};

export default ValidationReport;
