# Idea Data Organization Plan

Based on the Prisma schema analysis, here's how we should organize the idea data across different tabs and pages.

## Current Tab Structure
- **Validate** (`/ideas/[id]`) - Main validation overview
- **Ideation** (`/ideas/[id]/ideation`) - Idea development and brainstorming
- **Market** (`/ideas/[id]/market`) - Market research and analysis
- **Financial Analysis** (`/ideas/[id]/finance`) - Financial projections and modeling
- **Competitors** (`/ideas/[id]/competitors`) - Competitive landscape analysis
- **Insights** (`/ideas/[id]/insights`) - AI-generated insights and recommendations

## Data Organization by Tab

### 1. Validate Tab (`/ideas/[id]`) - Main Overview
**Purpose**: High-level validation summary and quick insights

#### Core Idea Information (Already in idea-info.tsx)
- Name, description, industry
- Internal/external, open source status
- Creation date, owner
- Overall status (IdeaStatus enum)

#### New Data to Add from Schema:
- **AI Overall Validation Score** (`aiOverallValidation` from Idea model)
- **Problem Solved** (`problemSolved` from Idea model)
- **Solution Offered** (`solutionOffered` from Idea model)
- **Validation Score** (`validationScore` from MarketResearch)
- **Confidence Level** (`confidenceLevel` from MarketResearch)

#### Validation Scorecard Summary (from ValidationScorecard)
- **Overall Weighted Score** (`weightedScore`)
- **Market Score** (`marketScore`)
- **Competitive Score** (`competitiveScore`)
- **Technical Score** (`technicalScore`)
- **Financial Score** (`financialScore`)
- **Risk Score** (`riskScore`)
- **Validation Status** (`validationStatus`)
- **Primary Recommendation** (`primaryRecommendation`)

#### Quick Metrics Dashboard
- **Market Size** (`marketSize` from MarketResearch)
- **Market Growth Rate** (`marketGrowthRate`)
- **Market Maturity** (`marketMaturity`)
- **TAM/SAM/SOM** (Total/Serviceable/Obtainable Addressable Market)

### 2. Ideation Tab (`/ideas/[id]/ideation`)
**Purpose**: Idea development, brainstorming, and concept refinement

#### Core Data to Display:
- **Problem Statement** (enhanced from `problemSolved`)
- **Solution Description** (enhanced from `solutionOffered`)
- **Customer Needs Analysis** (from CustomerNeed model)
  - Need types (functional, emotional, social, financial, technical)
  - Priority levels
  - Business impact
  - User impact
  - Cost impact
  - Existing solutions gaps

#### Ideation Tools:
- **Target Audience Segments** (from TargetAudience model)
  - Demographics and characteristics
  - Pain points
  - Decision factors
  - Budget ranges
  - Tech savviness levels

#### Validation Insights (from ValidationInsight model)
- **Market Opportunities** (insightType: MARKET_OPPORTUNITY)
- **Customer Insights** (insightType: CUSTOMER_INSIGHT)
- **Technical Challenges** (insightType: TECHNICAL_CHALLENGE)

### 3. Market Tab (`/ideas/[id]/market`)
**Purpose**: Comprehensive market research and analysis

#### Market Overview (from MarketResearch model)
- **Market Size Metrics**
  - Total Addressable Market (TAM)
  - Serviceable Addressable Market (SAM)
  - Serviceable Obtainable Market (SOM)
  - Market growth rate
  - Market maturity level

#### Market Trends (from MarketTrend model)
- **Trend Analysis**
  - Trend names and descriptions
  - Impact levels (low, medium, high, critical)
  - Growth rates and adoption rates
  - Key drivers and challenges
  - Opportunities

#### Emerging Technologies (from MarketResearch)
- **Technology Trends** (`emergingTechnologies` array)
- **Regulatory Factors** (`regulatoryFactors` array)
- **Key Trends** (`keyTrends` array)

#### Market Signals (from MarketSignal model)
- **Signal Monitoring**
  - Signal types (funding, product launch, partnership, etc.)
  - Signal strength and confidence
  - Market impact analysis
  - Competitive impact
  - Timing considerations

#### Target Audience Deep Dive (from TargetAudience model)
- **Detailed Segmentation**
  - Primary vs secondary segments
  - Demographics breakdown
  - Company size analysis
  - Industry focus
  - Pain points mapping
  - Decision factors
  - Budget analysis
  - Tech savviness assessment

### 4. Financial Analysis Tab (`/ideas/[id]/finance`)
**Purpose**: Financial modeling, projections, and unit economics

#### Financial Projections (from FinancialProjection model)
- **Revenue Projections**
  - Projected revenue
  - Revenue growth rate
  - Break-even point (months)

#### Cost Analysis
- **Development Costs** (`developmentCosts`)
- **Marketing Costs** (`marketingCosts`)
- **Operational Costs** (`operationalCosts`)
- **Customer Acquisition Cost** (`customerAcquisitionCost`)

#### Unit Economics
- **Average Revenue Per User** (`averageRevenuePerUser`)
- **Customer Lifetime Value** (`customerLifetimeValue`)
- **Payback Period** (`paybackPeriod`)

#### Funding Requirements (from FundingRound model)
- **Funding Needs** (`fundingNeeded`)
- **Funding Rounds**
  - Round names and amounts
  - Equity percentages
  - Valuations
  - Timelines
  - Investor types and names
  - Fund allocation breakdown

#### Risk Analysis
- **Risk Factors** (`riskFactors` array)
- **Mitigation Strategies** (`mitigationStrategies` array)
- **Scenario Analysis**
  - Optimistic scenario
  - Realistic scenario
  - Pessimistic scenario

### 5. Competitors Tab (`/ideas/[id]/competitors`)
**Purpose**: Competitive landscape analysis and positioning

#### Competitive Landscape Overview (from CompetitiveLandscape model)
- **Competitive Intensity** (`competitiveIntensity`)
- **Market Positioning** (`marketPositioning`)
- **Differentiation Opportunities** (`differentiationOpportunities`)
- **Competitive Advantage** (`competitiveAdvantage`)
- **Market Share Analysis**
  - Total market share
  - Top competitors count
  - Market concentration

#### Competitor Analysis (from Competitor model)
- **Competitor Profiles**
  - Basic info (name, website, description, logo)
  - Market position (share, revenue, funding, employees)
  - Product analysis (features, pricing, tech stack)
  - SWOT analysis (strengths, weaknesses, opportunities, threats)
  - Performance metrics (growth, churn, satisfaction)

#### Competitor Pricing (from CompetitorPricing model)
- **Pricing Plans Analysis**
  - Plan names and prices
  - Billing cycles
  - Feature comparisons
  - Value per dollar analysis
  - Competitive positioning

#### Competitive Moves (from CompetitiveMove model)
- **Strategic Actions**
  - Move types (product launch, pricing change, partnership, etc.)
  - Impact levels and target audiences
  - Market reactions
  - Strategic implications
  - Response requirements

#### Feature Comparisons (from FeatureComparison model)
- **Feature Analysis**
  - Feature availability across competitors
  - Quality assessments
  - User ratings and adoption rates
  - Competitive advantages
  - Differentiation points

### 6. Insights Tab (`/ideas/[id]/insights`)
**Purpose**: AI-generated insights, recommendations, and strategic guidance

#### Validation Insights (from ValidationInsight model)
- **Comprehensive Insights**
  - Insight types (market opportunity, competitive threat, customer insight, etc.)
  - Confidence levels
  - Impact assessments
  - Recommendations
  - Verification status

#### Technology Assessment (from TechnologyAssessment model)
- **Technical Feasibility**
  - Technical complexity
  - Development timeline
  - Team requirements
  - Recommended tech stack
  - Alternative stacks
  - Integration requirements

#### Risk Assessment
- **Technical Risks** (`technicalRisks` array)
- **Scalability Challenges** (`scalabilityChallenges` array)
- **Security Considerations** (`securityConsiderations` array)
- **Cost Analysis**
  - Development costs
  - Infrastructure costs
  - Maintenance costs

#### Competitive Advantages
- **Technical Advantages** (`technicalAdvantages` array)
- **Innovation Potential** (`innovationPotential`)

#### Regulatory Compliance (from RegulatoryCompliance model)
- **Compliance Status**
  - Applicable regulations
  - Compliance levels
  - Risk levels
  - Industry standards
  - Certification requirements
  - Target markets
  - Local regulations
  - Implementation costs and timelines

#### Validation Scorecard Details (from ValidationScorecard model)
- **Detailed Scoring Breakdown** (from ValidationScoreBreakdown model)
  - Category-specific scores
  - Weighted contributions
  - Detailed reasoning
- **Recommendations**
  - Primary recommendation
  - Secondary recommendations
  - Risk mitigation strategies
- **Progress Tracking**
  - Validation status
  - Next review date
  - Review criteria

## Implementation Priority

### Phase 1: Core Validation Data
1. Add missing fields to idea-info.tsx (AI validation score, problem/solution)
2. Create validation scorecard summary component
3. Add quick metrics dashboard

### Phase 2: Market Research
1. Implement market overview components
2. Add market trends visualization
3. Create target audience analysis

### Phase 3: Financial Analysis
1. Build financial projections dashboard
2. Add unit economics calculator
3. Implement funding requirements tracker

### Phase 4: Competitive Intelligence
1. Create competitor profiles
2. Add pricing comparison tools
3. Implement competitive moves tracking

### Phase 5: Advanced Insights
1. Build AI insights dashboard
2. Add technology assessment
3. Implement regulatory compliance tracking

## Data Relationships to Consider

### One-to-One Relationships
- Idea ↔ MarketResearch
- MarketResearch ↔ CompetitiveLandscape
- MarketResearch ↔ ValidationScorecard
- MarketResearch ↔ FinancialProjection
- MarketResearch ↔ TechnologyAssessment
- MarketResearch ↔ RegulatoryCompliance

### One-to-Many Relationships
- MarketResearch → TargetAudience
- MarketResearch → MarketTrend
- MarketResearch → CustomerNeed
- MarketResearch → ValidationInsight
- MarketResearch → MarketSignal
- CompetitiveLandscape → Competitor
- Competitor → CompetitorPricing
- Competitor → CompetitiveMove
- Competitor → FeatureComparison
- ValidationScorecard → ValidationScoreBreakdown
- FinancialProjection → FundingRound

## UI/UX Considerations

### Data Visualization
- Charts for market size and growth
- Radar charts for validation scores
- Comparison tables for competitors
- Timeline views for competitive moves
- Progress indicators for validation status

### Interactive Elements
- Editable fields for manual data entry
- Filtering and sorting capabilities
- Export functionality for reports
- Real-time updates for AI-generated data

### Responsive Design
- Mobile-friendly layouts
- Collapsible sections for dense data
- Tab navigation for related information
- Breadcrumb navigation for deep hierarchies

This organization ensures that each tab has a clear purpose and contains relevant, actionable data while maintaining logical flow and user experience. 