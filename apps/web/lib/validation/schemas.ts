import { z } from "zod";

// ============================================================================
// COMPETITIVE LANDSCAPE SCHEMAS
// ============================================================================

export const CompetitiveLandscapeSchema = z.object({
  competitiveIntensity: z.enum(["low", "medium", "high", "very_high"]),
  marketPositioning: z
    .string()
    .describe("How companies position themselves in the market"),
  differentiationOpportunities: z
    .string()
    .describe("Areas where unique value can be created"),
  competitiveAdvantage: z
    .string()
    .describe("Potential sources of competitive advantage"),
  totalMarketShare: z
    .number()
    .min(0)
    .max(100)
    .describe("Percentage of total market controlled by major players"),
  topCompetitors: z
    .number()
    .min(0)
    .describe("Number of major competitors in the market"),
  marketConcentration: z
    .string()
    .describe(
      "Market concentration measure (e.g., Herfindahl-Hirschman Index)"
    ),
  marketDistribution: z
    .string()
    .describe("How market share is distributed among players"),
  entryBarriers: z
    .string()
    .describe("Obstacles preventing new competitors from entering"),
  exitBarriers: z
    .string()
    .describe("Factors preventing companies from leaving the market"),
  switchingCosts: z
    .string()
    .describe("Costs customers face when switching between solutions"),
  emergingThreats: z
    .string()
    .describe("New competitive threats on the horizon"),
  marketDisruptions: z
    .string()
    .describe("Potential disruptive forces in the market"),
});

// ============================================================================
// COMPETITOR SCHEMAS
// ============================================================================

export const CompetitorSchema = z.object({
  name: z.string(),
  website: z.string().url(),
  description: z.string(),
  logoUrl: z.string().url().optional(),
  marketShare: z.number().min(0).max(100).optional(),
  annualRevenue: z.string().optional(),
  fundingRaised: z.string().optional(),
  employeeCount: z.number().min(0).optional(),
  foundedYear: z.number().min(1900).max(2030).optional(),
  headquarters: z.string().optional(),
  userGrowthRate: z.string().optional(),
  churnRate: z.string().optional(),
  customerSatisfaction: z.string().optional(),
  marketCap: z.string().optional(),
  productFeatures: z.string().optional(),
  pricingModel: z.string().optional(),
  targetAudience: z.string().optional(),
  techStack: z.string().optional(),
  integrations: z.string().optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  opportunities: z.string().optional(),
  threats: z.string().optional(),
  competitiveAdvantage: z.string().optional(),
  threatLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  competitivePosition: z
    .enum(["leader", "challenger", "follower", "niche"])
    .optional(),
});

export const CompetitorPricingSchema = z.object({
  planName: z.string(),
  price: z.string(),
  billingCycle: z.enum(["monthly", "annual", "one_time"]),
  features: z.string(),
  limitations: z.string().optional(),
  valuePerDollar: z.string().optional(),
  priceChangeHistory: z.string().optional(),
  priceChangeReasons: z.string().optional(),
});

export const CompetitiveMoveSchema = z.object({
  moveType: z.enum([
    "product_launch",
    "feature_update",
    "pricing_change",
    "partnership",
    "acquisition",
    "marketing_campaign",
  ]),
  title: z.string(),
  description: z.string(),
  date: z.string().optional(),
  impact: z.string().optional(),
  marketResponse: z.string().optional(),
});

export const FeatureComparisonSchema = z.object({
  featureName: z.string(),
  qualityRating: z.number().min(1).max(10),
  implementationNotes: z.string().optional(),
  userRatings: z.string().optional(),
  marketShare: z.string().optional(),
  adoptionRate: z.string().optional(),
});

// ============================================================================
// CUSTOMER NEEDS SCHEMAS
// ============================================================================

export const CustomerNeedSchema = z.object({
  needType: z.enum([
    "functional",
    "emotional",
    "social",
    "financial",
    "technical",
  ]),
  description: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  frequency: z.enum(["rare", "occasional", "frequent", "constant"]),
  businessImpact: z.string(),
  userImpact: z.string(),
  costImpact: z.string(),
  existingSolutions: z.string(),
  gapsInSolutions: z.string(),
  opportunitySize: z.string(),
});

// ============================================================================
// MARKET TRENDS SCHEMAS
// ============================================================================

export const MarketTrendSchema = z.object({
  trendName: z.string(),
  description: z.string(),
  impactLevel: z.enum(["low", "medium", "high", "critical"]),
  growthRate: z.string(),
  marketSize: z.string(),
  adoptionRate: z.string(),
  keyDrivers: z.string(),
  challenges: z.string(),
  opportunities: z.string(),
  dataSource: z.string(),
  confidenceLevel: z.number().min(0).max(100),
});

// ============================================================================
// MARKET SIGNALS SCHEMAS
// ============================================================================

export const MarketSignalSchema = z.object({
  signalType: z.enum([
    "funding_announcement",
    "product_launch",
    "partnership",
    "acquisition",
    "regulatory_change",
    "technology_breakthrough",
    "market_trend",
    "competitive_move",
  ]),
  title: z.string(),
  description: z.string(),
  source: z.string(),
  strength: z.enum(["weak", "moderate", "strong", "critical"]),
  confidence: z.number().min(0).max(100),
  trend: z.enum(["increasing", "decreasing", "stable", "volatile"]),
  marketImpact: z.string(),
  competitiveImpact: z.string(),
  immediateImpact: z.string(),
  mediumTermImpact: z.string(),
  longTermImpact: z.string(),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  monitoringStatus: z.enum(["active", "passive", "none"]),
  responseRequired: z.boolean(),
});

// ============================================================================
// TARGET AUDIENCE SCHEMAS
// ============================================================================

export const TargetAudienceSchema = z.object({
  segmentName: z.string(),
  description: z.string(),
  demographics: z.string(),
  painPoints: z.string(),
  decisionFactors: z.string(),
  budgetRange: z.string(),
  techSavviness: z.enum(["low", "medium", "high"]),
  marketSize: z.string(),
  growthRate: z.string(),
  accessibility: z.string(),
  competitiveLandscape: z.string(),
});

// ============================================================================
// VALIDATION INSIGHTS SCHEMAS
// ============================================================================

export const ValidationInsightSchema = z.object({
  insightType: z.enum([
    "market_opportunity",
    "competitive_threat",
    "technical_challenge",
    "financial_risk",
    "regulatory_concern",
    "customer_need",
    "trend_impact",
  ]),
  title: z.string(),
  description: z.string(),
  confidenceLevel: z.number().min(0).max(100),
  dataSource: z.string(),
  impactAssessment: z.string(),
  recommendations: z.string(),
  verificationStatus: z.enum(["unverified", "partially_verified", "verified"]),
});

// ============================================================================
// VALIDATION SCORECARD SCHEMAS
// ============================================================================

export const ValidationScorecardSchema = z.object({
  overallScore: z.number().min(0).max(100),
  marketScore: z.number().min(0).max(100),
  competitiveScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  financialScore: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(100),
  marketWeight: z.number().min(0).max(1),
  competitiveWeight: z.number().min(0).max(1),
  technicalWeight: z.number().min(0).max(1),
  financialWeight: z.number().min(0).max(1),
  riskWeight: z.number().min(0).max(1),
  recommendations: z.string(),
  riskMitigationStrategies: z.string(),
  nextSteps: z.string(),
});

export const ScoreBreakdownSchema = z.object({
  category: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  weightedScore: z.number().min(0).max(100),
  reasoning: z.string(),
  recommendations: z.string(),
});

// ============================================================================
// FINANCIAL PROJECTION SCHEMAS
// ============================================================================

export const FinancialProjectionSchema = z.object({
  projectedRevenue: z.string(),
  revenueGrowthRate: z.string(),
  breakEvenPoint: z.string(),
  revenueModel: z.string(),
  pricingStrategy: z.string(),
  developmentCosts: z.string(),
  marketingCosts: z.string(),
  operationalCosts: z.string(),
  customerAcquisitionCost: z.string(),
  totalCostStructure: z.string(),
  averageRevenuePerUser: z.string(),
  customerLifetimeValue: z.string(),
  paybackPeriod: z.string(),
  grossMargin: z.string(),
  netRevenueRetention: z.string(),
  fundingNeeded: z.string(),
  useOfFunds: z.string(),
  investorTypes: z.string(),
  valuationProjections: z.string(),
  riskFactors: z.string(),
  mitigationStrategies: z.string(),
  scenarioAnalysis: z.string(),
  sensitivityAnalysis: z.string(),
  contingencyPlans: z.string(),
});

export const FundingRoundSchema = z.object({
  roundType: z.enum([
    "seed",
    "series_a",
    "series_b",
    "series_c",
    "series_d",
    "ipo",
  ]),
  amount: z.string(),
  purpose: z.string(),
  timeline: z.string(),
  investors: z.string(),
  milestones: z.string(),
});

// ============================================================================
// TECHNOLOGY ASSESSMENT SCHEMAS
// ============================================================================

export const TechnologyAssessmentSchema = z.object({
  technicalComplexity: z.enum(["low", "medium", "high", "very_high"]),
  developmentTimeline: z.string(),
  recommendedTechStack: z.string(),
  integrationRequirements: z.string(),
  riskAssessment: z.string(),
  scalabilityChallenges: z.string(),
  costAnalysis: z.string(),
  competitiveAdvantages: z.string(),
  securityRequirements: z.string(),
  complianceNeeds: z.string(),
  maintenanceRequirements: z.string(),
  performanceRequirements: z.string(),
  reliabilityRequirements: z.string(),
});

// ============================================================================
// REGULATORY COMPLIANCE SCHEMAS
// ============================================================================

export const RegulatoryComplianceSchema = z.object({
  applicableRegulations: z.string(),
  complianceLevel: z.enum(["low", "medium", "high", "full"]),
  industryStandards: z.string(),
  certificationRequirements: z.string(),
  targetMarkets: z.string(),
  localRegulations: z.string(),
  implementationCosts: z.string(),
  implementationTimeline: z.string(),
  riskAssessment: z.string(),
  complianceStrategy: z.string(),
  monitoringRequirements: z.string(),
  auditRequirements: z.string(),
});

// ============================================================================
// ARRAY SCHEMAS FOR MULTIPLE ENTRIES
// ============================================================================

export const CompetitorsArraySchema = z.array(CompetitorSchema);
export const CompetitorPricingArraySchema = z.array(CompetitorPricingSchema);
export const CompetitiveMovesArraySchema = z.array(CompetitiveMoveSchema);
export const FeatureComparisonsArraySchema = z.array(FeatureComparisonSchema);
export const CustomerNeedsArraySchema = z.array(CustomerNeedSchema);
export const MarketTrendsArraySchema = z.array(MarketTrendSchema);
export const MarketSignalsArraySchema = z.array(MarketSignalSchema);
export const TargetAudiencesArraySchema = z.array(TargetAudienceSchema);
export const ValidationInsightsArraySchema = z.array(ValidationInsightSchema);
export const ScoreBreakdownArraySchema = z.array(ScoreBreakdownSchema);
export const FundingRoundsArraySchema = z.array(FundingRoundSchema);
