export const MarketValidation = `
    Validate 2025 SaaS idea market data:
    - totalAddressableMarket
    - serviceableAddressableMarket
    - serviceableObtainableMarket
    - marketGrowthRate
    - primaryCustomerSegment
    - overallMarketScore
    - primaryRegions

    Analyze market insights by:
    - Category
    - Impact
    - Urgency

    Include core opportunities per region
`;

export const BusinessValidation = `
    Analyze 2025 SaaS business viability:

    REVENUE & PRICING:
    - primaryRevenueModel (subscription/usage/freemium)
    - pricingStrategy and pricePoint (USD)
    - overallBusinessScore (0-100)

    UNIT ECONOMICS:
    - CAC and LTV (USD)
    - monthlyChurnRate
    - breakEvenMonth

    FINANCIALS (36mo):
    - Revenue/cost projections
    - Funding needs
    - Growth milestones

    GO-TO-MARKET:
    - Strategy and channels
    - Sales cycle length
    - Channel effectiveness (0-100)

    INSIGHTS:
    Risk, opportunity, strategy metrics with impact/urgency scores
`;

export const CustomerJourneyMapping = `
    Map 2025 SaaS customer journey:

    OVERVIEW:
    - Journey stages and duration
    - Conversion and satisfaction rates
    - Overall journey score

    STAGES:
    Per stage analyze:
    - Name, order, duration
    - Conversion and satisfaction
    - Customer experience metrics
    - Drop-off points

    TOUCHPOINTS:
    - Channel types and effectiveness
    - Usage and satisfaction scores
    - Optimization potential

    PAIN POINTS:
    - Impact and severity
    - Cost implications
    - Solution proposals
`;

export const TargetAudienceSegmentation = `
    Segment 2025 SaaS target audience:

    OVERVIEW:
    - Primary segments
    - Market size and penetration
    - Overall segmentation score

    SEGMENTS:
    Per segment analyze:
    - Size and potential
    - Attractiveness scores
    - Accessibility rating
    - Profit potential

    CHARACTERISTICS:
    - Needs and preferences
    - Budget range
    - Demographics
    - Pain points
    - Communication channels

    Include segment prioritization and targeting insights
`;

export const MarketTrendAnalysis = `
    Analyze 2025 SaaS market trends:

    OVERVIEW:
    - Key trends and timeline
    - Market growth rates
    - Adoption metrics

    TRENDS:
    Per trend analyze:
    - Category and impact
    - Timeline and certainty
    - Business implications

    ASSESSMENT:
    - Opportunities/threats
    - Strategic advantages
    - Market dynamics

    Focus on SaaS-specific trends and actionable insights
`;

export const CustomerNeedAnalysis = `
    Analyze 2025 SaaS customer needs:

    OVERVIEW:
    - Primary needs
    - Satisfaction gaps
    - Market readiness

    NEEDS:
    Per need analyze:
    - Category and importance
    - Current satisfaction
    - Budget allocation
    - Urgency level

    PAIN POINTS:
    - Severity and frequency
    - Cost impact
    - Current solutions
    - Satisfaction levels

    OPPORTUNITIES:
    - Solution fit score
    - Competitive advantages
    - Implementation priorities
`;

export const PricingStrategyAnalysis = `
    Develop 2025 SaaS pricing strategy:

    OVERVIEW:
    - Strategy recommendation
    - Price sensitivity
    - Revenue optimization

    TIERS:
    Per tier analyze:
    - Features and pricing
    - Target segments
    - Performance metrics
    - Market position

    COMPETITION:
    - Pricing comparison
    - Value analysis
    - Market positioning
    - Competitive advantages

    INSIGHTS:
    - Value pricing
    - Regional variations
    - Optimization strategies
`;

export const FinalVerdict = `
    As a principal investor, provide a final verdict on this 2025 SaaS idea based on the comprehensive research data provided.

    SYNTHESIZE AND VALIDATE:
    - Review all previous validation modules (Market, Business, Customer Journey, etc.).
    - Identify critical strengths, weaknesses, opportunities, and threats (SWOT).
    - Generate consolidated ValidationMetrics.

    GENERATE VALIDATION METRICS:
    - overallStrengthScore (0-100): Based on all combined strengths.
    - overallRiskScore (0-100): Based on all combined risks.
    - timeToMarket (months): Estimated time to launch.
    - fundingRequired (USD): Estimated initial funding needed.
    - breakEvenMonth (months): When the business is expected to be profitable.
    - customerPayback (months): Time to recover CAC.
    - marketPenetration (percentage): Realistic market share in 3 years.

    DETERMINE FINAL IDEA VALIDATION STATUS:
    - overallScore (0-100): Your final score for this idea's potential.
    - confidenceLevel (0-100): Your confidence in this validation.
    - overallStatus: Final recommendation (e.g., 'High Potential', 'Needs Refinement', 'High Risk').

    Provide a concise, data-driven summary justifying your final verdict.
`;

export const RiskAnalysis = `
    Analyze 2025 SaaS idea risks:

    OVERVIEW:
    - overallRiskScore (0-100)
    - primaryRiskCategory
    - riskMitigationStatus

    RISK ITEMS:
    Per risk item analyze:
    - category (TECHNICAL, MARKET, FINANCIAL, LEGAL, OPERATIONAL)
    - description
    - likelihood (0-100)
    - impact (0-100)
    - mitigationStrategy
    - contingencyPlan

    INSIGHTS:
    - riskConcentration
    - unmitigatedRisks
    - strategicRecommendations
`;

export const ProductMarketFitAnalysis = `
    Analyze 2025 SaaS product-market fit:

    OVERVIEW:
    - pmfScore (0-100)
    - keyStrengths
    - keyWeaknesses

    METRICS:
    - npsScore (-100 to 100)
    - customerSatisfaction (0-100)
    - retentionRate (0-100)
    - featureAdoptionRate (0-100)

    QUALITATIVE FEEDBACK:
    - positiveFeedback
    - negativeFeedback
    - featureRequests

    INSIGHTS:
    - competitiveAdvantage
    - marketPositioning
    - strategicRecommendations
`;
