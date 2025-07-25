# AI Agents Data Structure Requirements

This document outlines the data structure requirements for all AI agents to ensure compatibility with the Prisma schema.

## Overview

All AI agents must generate data that exactly matches the expected Prisma schema fields, enum values, and data types. This ensures seamless database persistence and prevents runtime errors.

## Agent-Specific Requirements

### 1. Competitor Discovery Agent (`competitor-discovery-agent.ts`)

**Generated Data Structure:**
```typescript
{
  competitiveIntensity: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  marketConcentration: number (optional),
  entryBarriers: string[],
  switchingCosts: number (optional),
  competitors: Array<{
    name: string,
    website?: string,
    description?: string,
    logoUrl?: string,
    foundedYear?: number,
    headquarters?: string,
    employeeCount?: number,
    fundingRaised?: number,
    marketShare?: number,
    annualRevenue?: number,
    targetAudience?: string,
    productFeatures: string[],
    pricingModel: "SUBSCRIPTION" | "FREEMIUM" | "ONE_TIME" | "USAGE_BASED" | "HYBRID",
    techStack: string[],
    integrations: string[],
    strengths: string[],
    weaknesses: string[],
    opportunities: string[],
    threats: string[],
    competitiveAdvantage?: string,
    differentiationFactors: string[],
    threatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    competitivePosition: "MARKET_LEADER" | "STRONG_CHALLENGER" | "WEAK_CHALLENGER" | "NICHE_PLAYER" | "NEW_ENTRANT",
    userGrowthRate?: number,
    churnRate?: number,
    customerSatisfaction?: number,
    marketCap?: number
  }>,
  emergingThreats: string[],
  marketDisruptions: string[],
  differentiationOpportunities: string[],
  competitiveAdvantage?: string,
  dataQuality: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
}
```

**Prisma Models:**
- `CompetitiveLandscape` - Main competitive analysis
- `Competitor` - Individual competitor details

### 2. Market Size Agent (`market-size-agent.ts`)

**Generated Data Structure:**
```typescript
{
  totalAddressableMarket?: number,
  tamSource?: string,
  tamYear?: number,
  tamConfidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  serviceableAddressableMarket?: number,
  samSource?: string,
  samYear?: number,
  samConfidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  serviceableObtainableMarket?: number,
  somSource?: string,
  somYear?: number,
  somConfidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  marketGrowthRate?: number,
  growthRateSource?: string,
  growthRatePeriod?: string,
  growthRateConfidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  marketMaturity: "EMERGING" | "GROWING" | "MATURE" | "DECLINING",
  maturityIndicators: string[],
  maturityConfidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  growthDrivers: string[],
  growthBarriers: string[],
  marketTrends: string[],
  regulatoryFactors: string[],
  subscriptionAdoption?: number,
  freemiumConversion?: number,
  averageRevenuePerUser?: number,
  customerLifetimeValue?: number,
  churnRate?: number,
  cloudAdoption?: number,
  aiIntegration?: number,
  mobileAdoption?: number,
  apiEcosystem: "NONE" | "WEAK" | "MODERATE" | "STRONG",
  primaryMarkets: string[],
  internationalPotential: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  localizationRequirements: string[],
  underservedSegments: string[],
  emergingUseCases: string[],
  integrationOpportunities: string[],
  partnershipPotential: string[],
  marketRisks: string[],
  competitiveThreats: string[],
  technologyRisks: string[],
  regulatoryRisks: string[],
  marketEntryStrategy?: string,
  growthStrategy: string[],
  competitiveAdvantage?: string,
  marketPositioning?: string,
  dataQuality: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  dataGaps: string[],
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
}
```

**Prisma Models:**
- `MarketResearch` - Main market research data

### 3. Customer Segments Agent (`customer-segments-agent.ts`)

**Generated Data Structure:**
```typescript
{
  segments: Array<{
    segmentName: string,
    segmentType: "PRIMARY" | "SECONDARY" | "TERTIARY",
    priority: number,
    ageRange?: string,
    location?: string,
    companySize?: "SOLO" | "SMALL_1_10" | "MEDIUM_11_50" | "LARGE_51_200" | "ENTERPRISE_200_PLUS",
    industry?: string,
    primaryPainPoints: string[],
    decisionFactors: string[],
    budgetRange?: string,
    techSavviness: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
    estimatedSize?: number,
    averageSpend?: number,
    segmentValue?: number,
    freemiumConversion?: number,
    customerLifetimeValue?: number,
    churnRate?: number,
    expansionRevenue?: number,
    acquisitionChannels: string[],
    onboardingTime?: string,
    timeToValue?: string,
    successMetrics: string[],
    currentSolutions: string[],
    switchingCosts: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
    satisfactionLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
    opportunities: string[],
    challenges: string[],
    recommendations: string[],
    dataConfidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
    dataSources: string[]
  }>
}
```

**Prisma Models:**
- `TargetAudience` - Individual customer segments

### 4. Technology Trends Agent (`technology-trends-agent.ts`)

**Generated Data Structure:**
```typescript
{
  technicalComplexity: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  developmentTimeline?: string,
  teamRequirements: string[],
  recommendedStack: string[],
  alternativeStacks: string[],
  emergingTechnologies: string[],
  platformTrends: string[],
  integrationTrends: string[],
  securityTrends: string[],
  performanceTrends: string[],
  integrationRequirements: string[],
  apiRequirements: string[],
  securityRequirements: string[],
  complianceRequirements: string[],
  scalabilityRequirements: string[],
  developmentCosts?: number,
  infrastructureCosts?: number,
  maintenanceCosts?: number,
  thirdPartyCosts: string[],
  operationalCosts: string[],
  technicalRisks: string[],
  scalabilityChallenges: string[],
  securityConsiderations: string[],
  integrationChallenges: string[],
  performanceChallenges: string[],
  technicalAdvantages: string[],
  innovationPotential: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  differentiationFactors: string[],
  moatBuilding: string[],
  technologyStrategy: string[],
  developmentApproach: string[],
  riskMitigation: string[],
  optimizationOpportunities: string[],
  dataQuality: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  dataGaps: string[],
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
}
```

**Prisma Models:**
- `TechnologyAssessment` - Technology analysis data

### 5. Validation Scorecard Agent (`validation-scorecard-agent.ts`)

**Generated Data Structure:**
```typescript
{
  overallScore: number,
  validationStatus: "IN_PROGRESS" | "VALIDATED" | "NEEDS_IMPROVEMENT" | "FAILED" | "REQUIRES_REVIEW",
  dimensionScores: {
    marketOpportunity: {
      score: number,
      confidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
      factors: string[],
      risks: string[]
    },
    competitivePositioning: {
      score: number,
      confidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
      factors: string[],
      risks: string[]
    },
    technicalFeasibility: {
      score: number,
      confidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
      factors: string[],
      risks: string[]
    },
    financialViability: {
      score: number,
      confidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
      factors: string[],
      risks: string[]
    },
    riskAssessment: {
      score: number,
      confidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
      factors: string[],
      risks: string[]
    }
  },
  strategicRecommendations: {
    primary: string,
    secondary: string[],
    immediate: string[],
    longTerm: string[]
  },
  riskAnalysis: {
    riskFactors: string[],
    mitigationStrategies: string[],
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  },
  nextSteps: {
    immediate: string[],
    shortTerm: string[],
    longTerm: string[]
  },
  dataQuality: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
}
```

**Prisma Models:**
- `ValidationScorecard` - Main validation scorecard
- `ValidationScoreBreakdown` - Individual dimension scores

## Key Requirements

1. **Enum Values**: Use exact enum values as defined in the Prisma schema
2. **Field Names**: Use exact field names (case-sensitive)
3. **Data Types**: Ensure correct data types (number, string, boolean, array)
4. **Required Fields**: Include all required fields
5. **Optional Fields**: Mark optional fields appropriately
6. **Array Fields**: Ensure arrays are properly formatted as string[]

## Database Persistence

The `research-orchestrator.ts` handles saving all agent data to the database with proper field mappings and data transformations where needed.

## Validation

All agents use Zod schemas to validate their output before returning data, ensuring type safety and schema compliance. 