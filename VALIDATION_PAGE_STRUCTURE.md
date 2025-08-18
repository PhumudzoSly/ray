# SaaS Idea Validation - Page Structure

This document outlines what content and data models will be displayed on each validation page based on the current Prisma schema and navigation structure.

## Navigation Structure (5 Pages)

Based on `layout.tsx`, we have 5 main validation pages:

1. **Overview** - `/ideas/{id}`
2. **Business** - `/ideas/{id}/business`
3. **Audience** - `/ideas/{id}/audience`
4. **Competitors** - `/ideas/{id}/competitors`
5. **Pricing** - `/ideas/{id}/pricing`

---

## 1. Overview Page (`/ideas/{id}`)

**Primary Models:**
- `IdeaValidation` - Main validation container
- `ValidationMetrics` - Consolidated metrics dashboard

**Content & Components:**

### Overall Validation Dashboard
- [x] **Progress Ring Chart** - Overall validation score (0-100)
- [x] **Status Badge** - Validation status (PENDING, IN_PROGRESS, COMPLETED)
- [x] **Progress Bar** - Validation progress percentage
- [x] **Gauge Chart** - Confidence level (0-100)
- [x] **Timeline Component** - Validation timeline (started, completed, last updated)

### Key Performance Indicators
- [x] **Dual Gauge Dashboard** - Overall strength vs risk scores
- [x] **KPI Cards Grid** - Time to market, funding required, break-even month
- [x] **Metric Cards** - Customer payback period, market penetration
- [x] **Score Comparison Chart** - Strength vs risk visualization

### Action Items Summary
- [x] **Action Counter Cards** - Immediate/short-term/long-term action counts
- [x] **Priority Matrix** - Action items by urgency and impact
- [x] **Progress Tracker** - Completion status of action items

### Product-Market Fit (PMF) Metrics
- [x] **PMF Score Gauge** - Overall PMF score (0-100)
- [x] **NPS Score Gauge** - Net Promoter Score (0-100)
- [x] **Retention Rate Chart** - User retention over time
- [x] **PMF Survey Results** - "Must-have" product score (Sean Ellis test)
- [x] **DAU/MAU Ratio** - Stickiness of the product
- [x] **Qualitative Feedback Summary** - Key themes from user feedback

### Quick Stats Cards
- [x] **Module Status Grid** - Summary cards for each validation module
- [x] **Progress Indicators** - Completion status for each validation area
- [ ] **Score Overview Cards** - Key metrics from all modules

---

## 2. Business Page (`/ideas/{id}/business`)

**Primary Models:**
- `BusinessValidation` - Business metrics and financials
- `MarketValidation` - Market size and opportunity
- `MarketTrendAnalysis` - Market trends and growth
- Related sub-models: `MonthlyProjection`, `AcquisitionChannel`, `MarketInsight`, `MarketRegionScore`, `BusinessInsight`, `MarketTrend`

**Content & Components:**

### Business Validation Section

#### Revenue Model & Strategy
- [x] **Info Cards Grid** - Primary revenue model, pricing strategy, price point
- [x] **Strategy Badge** - Go-to-market strategy
- [x] **Duration Card** - Sales cycle length (days)

#### Unit Economics
- [x] **Metric Cards** - CAC, LTV, Monthly churn rate
- [x] **Ratio Gauge** - LTV/CAC ratio visualization
- [x] **Economics Dashboard** - Unit economics overview

#### Financial Projections
- [x] **Line Chart** - Monthly revenue/cost projections (time-series)
- [x] **Break-even Chart** - Break-even analysis visualization
- [x] **Investment Cards** - Initial investment, total funding needed
- [ ] **Financial Timeline** - Funding milestones and projections

#### Acquisition Channels
- [x] **Channel Effectiveness Chart** - Bar/radar chart of channel scores
- [x] **Cost Comparison Table** - Cost per acquisition by channel
- [x] **Recommendations List** - Channel optimization suggestions

### Market Validation Section

#### Market Size Analysis
- [x] **Funnel Chart** - TAM/SAM/SOM visualization
- [x] **Growth Rate Gauge** - Market growth rate indicator
- [x] **Market Size Cards** - Individual TAM/SAM/SOM values

#### Customer Research
- [x] **Segment Badge** - Primary customer segment
- [x] **Research Counter Cards** - Interview and survey counts
- [ ] **Research Progress Bar** - Data collection progress

#### Geographic Analysis
- [x] **Region Tags** - Primary regions list
- [ ] **Heatmap** - Regional market scores visualization
- [x] **Geographic Table** - Regional opportunity breakdown

### Market Trends Section

#### Trend Analysis Overview
- [x] **Trend Summary Card** - Primary trend, total tracked, timeframe
- [x] **Overall Score Gauge** - Overall trend score visualization

#### Individual Market Trends
- [x] **Trend Cards Grid** - Individual trend analysis cards
- [x] **Category Tags** - Trend categories (technology, social, economic, regulatory)
- [x] **Impact Matrix** - Impact scores vs timeline scatter plot
- [ ] **Opportunity vs Threat Chart** - Dual-axis comparison
- [ ] **Certainty Indicators** - Confidence level badges

**Charts & Visualizations:**
- [x] **Time-series Line Chart** - Revenue/cost projection timeline
- [x] **Funnel Diagram** - Market size funnel (TAM/SAM/SOM)
- [ ] **Geographic Heatmap** - Regional opportunity mapping
- [x] **Horizontal Bar Chart** - Acquisition channel effectiveness
- [x] **Scatter Plot Matrix** - Market trend impact analysis

### Risk Management Section

**Primary Models:**
- `RiskAnalysis` - Risk overview and scoring
- `RiskItem` - Individual risk details

**Content & Components:**

#### Risk Overview
- [x] **Risk Matrix** - Likelihood vs. Impact of identified risks
- [x] **Top Risks List** - Top 5 risks by score
- [x] **Risk Score Gauge** - Overall risk score for the business validation

#### Risk Breakdown
- [x] **Risk Category Donut Chart** - Breakdown of risks by category (Market, Financial, Technical, etc.)
- [x] **Risk Mitigation Table** - List of risks, their mitigation strategies, and owners

---

## 3. Audience Page (`/ideas/{id}/audience`)

**Primary Models:**
- `TargetAudienceSegmentation` - Audience analysis and segmentation
- `CustomerJourneyMapping` - Customer journey and touchpoints
- `CustomerNeedAnalysis` - Customer needs and pain points
- Related sub-models: `AudienceSegment`, `JourneyStage`, `Touchpoint`, `JourneyPainPoint`, `CustomerNeed`, `PainPoint`

**Content & Components:**

### Target Audience Segmentation Section

#### Segmentation Overview
- [x] **Primary Segment Badge** - Main target segment
- [x] **Segmentation Score Gauge** - Overall segmentation score
- [x] **Segment Counter Cards** - Total segments, market size, average segment size

#### Market Metrics
- [x] **Accessibility Gauge** - Segment accessibility score
- [x] **Penetration Chart** - Market penetration visualization
- [x] **Size Comparison Chart** - Segment size comparison

#### Individual Audience Segments
- [x] **Segment Cards Grid** - Individual segment analysis
- [ ] **Demographics Table** - Age range, income, location breakdown
- [ ] **Behavior Tags** - Behavioral characteristics
- [ ] **Psychographics Cards** - Values, interests, lifestyle
- [ ] **Channel Preference Chart** - Preferred communication channels

### Customer Journey Mapping Section

#### Journey Overview
- [x] **Journey Score Gauge** - Overall journey score
- [x] **Stage Counter** - Total journey stages
- [ ] **Journey Timeline** - Visual journey progression

#### Journey Stages Analysis
- [x] **Stage Flow Diagram** - Sequential journey stages
- [x] **Stage Cards** - Individual stage details (name, description, duration)
- [x] **Touchpoint Matrix** - Touchpoints per stage visualization
- [x] **Pain Point Indicators** - Pain points distribution across stages

#### Touchpoints & Interactions
- [x] **Touchpoint Grid** - All customer touchpoints
- [ ] **Channel Distribution Chart** - Touchpoint channels breakdown
- [ ] **Effectiveness Scores** - Touchpoint effectiveness ratings
- [ ] **Optimization Recommendations** - Touchpoint improvement suggestions

#### Journey Pain Points
- [x] **Pain Point Heatmap** - Pain points across journey stages
- [ ] **Severity Indicators** - Pain point severity levels
- [ ] **Impact Assessment** - Pain point impact on customer experience
- [ ] **Resolution Priority Matrix** - Pain point resolution priorities

### Customer Need Analysis Section

#### Needs Overview
- [x] **Primary Need Badge** - Main customer need
- [x] **Need Score Gauge** - Overall need analysis score
- [x] **Need Counter Cards** - Total needs identified, pain points

#### Need Assessment
- [x] **Need Urgency Gauge** - Customer need urgency level
- [x] **Solution Gap Chart** - Gap between current solutions and needs
- [x] **Willingness Indicator** - Customer willingness to pay/adopt

#### Individual Customer Needs
- [x] **Need Cards Grid** - Individual need analysis
- [ ] **Category Tags** - Need categories (functional, emotional, social)
- [x] **Priority Matrix** - Need importance vs satisfaction
- [ ] **Validation Status** - Need validation progress

#### Pain Points Analysis
- [x] **Pain Point Cards** - Individual pain point details
- [ ] **Severity Distribution** - Pain point severity breakdown
- [ ] **Frequency Chart** - How often pain points occur
- [ ] **Impact Assessment** - Business impact of addressing pain points

**Charts & Visualizations:**
- [ ] **Segment Size Bubble Chart** - Audience segment comparison
- [ ] **Customer Journey Flow** - Sequential journey visualization
- [x] **Pain Point Heatmap** - Journey stage vs pain point intensity
- [ ] **Need-Solution Gap Analysis** - Current vs desired state
- [ ] **Touchpoint Effectiveness Radar** - Multi-dimensional touchpoint analysis

---

## 4. Competitors Page (`/ideas/{id}/competitors`)

**Primary Models:**
- External competitor data (from `idea.prisma` - `Competitor` model)
- `CompetitorPricing` - Competitor pricing analysis
- Market positioning analysis

**Content & Components:**

### Competitor Overview

#### Market Landscape
- [x] **Competitor Count Card** - Total competitors identified
- [x] **Market Position Map** - Competitive positioning scatter plot
- [x] **Threat Level Indicators** - Competitor threat assessment
- [x] **Market Share Chart** - Competitor market share distribution

### Direct Competitors Analysis

#### Competitor Profiles
- [x] **Competitor Cards Grid** - Individual competitor profiles
- [ ] **Company Info Cards** - Name, description, founding year, size
- [ ] **Strength Assessment** - Competitor strengths and weaknesses
- [ ] **Feature Comparison Table** - Feature-by-feature comparison matrix

#### Competitive Positioning
- [x] **Positioning Matrix** - Price vs quality/features positioning
- [ ] **Differentiation Chart** - Unique value propositions comparison
- [ ] **Target Audience Overlap** - Audience overlap analysis
- [ ] **Geographic Presence Map** - Competitor geographic coverage

### Pricing Competition Analysis

#### Pricing Overview
- [ ] **Pricing Strategy Cards** - Competitor pricing models
- [x] **Price Range Chart** - Pricing distribution across competitors
- [ ] **Value Proposition Matrix** - Price vs value comparison

#### Detailed Pricing Analysis
- [ ] **Pricing Tier Table** - Competitor pricing tiers breakdown
- [x] **Feature-Price Matrix** - Features offered at different price points
- [ ] **Pricing Trends Chart** - Historical pricing changes
- [ ] **Competitive Pricing Recommendations** - Suggested pricing strategy

### Competitive Intelligence

#### Market Dynamics
- [ ] **Competitive Intensity Gauge** - Overall market competition level
- [ ] **Entry Barriers Assessment** - Market entry difficulty indicators
- [ ] **Switching Costs Analysis** - Customer switching cost evaluation
- [ ] **Innovation Rate Chart** - Rate of innovation in the market

#### SWOT Analysis
- [x] **Strengths Cards** - Our competitive strengths
- [x] **Weaknesses Cards** - Areas for improvement
- [x] **Opportunities Cards** - Market opportunities to exploit
- [x] **Threats Cards** - Competitive threats to address

#### Competitive Advantage
- [ ] **Advantage Matrix** - Our advantages vs competitors
- [ ] **Moat Analysis** - Sustainable competitive advantages
- [ ] **Differentiation Factors** - Key differentiating factors
- [ ] **Competitive Response Plan** - Strategic response recommendations

**Charts & Visualizations:**
- [x] **Competitive Positioning Scatter Plot** - Price vs features/quality
- [x] **Market Share Pie Chart** - Competitor market share distribution
- [x] **Feature Comparison Heatmap** - Feature availability across competitors
- [x] **Pricing Distribution Histogram** - Competitor pricing ranges
- [x] **SWOT Analysis Quadrant** - Strategic positioning analysis

---

## 5. Pricing Page (`/ideas/{id}/pricing`)

**Primary Models:**
- `PricingStrategyAnalysis` - Pricing strategy and analysis
- `PricingTier` - Individual pricing tiers
- `CompetitorPricing` - Competitive pricing data

**Content & Components:**

### Pricing Strategy Overview

#### Strategy Summary
- [x] **Primary Strategy Badge** - Main pricing strategy (freemium, subscription, etc.)
- [x] **Pricing Score Gauge** - Overall pricing strategy score
- [x] **Recommended Price Card** - Optimal price point recommendation

#### Strategy Analysis
- [x] **Strategy Comparison Table** - Different pricing strategies evaluated
- [x] **Price Acceptance Gauge** - Customer price acceptance level
- [x] **Competitiveness Score** - Pricing competitiveness indicator
- [x] **Profitability Score** - Expected profitability assessment

### Pricing Tiers Analysis

#### Tier Overview
- [x] **Tier Counter Card** - Total pricing tiers analyzed
- [x] **Tier Structure Diagram** - Visual pricing tier hierarchy
- [x] **Revenue Distribution Chart** - Expected revenue per tier

#### Individual Pricing Tiers
- [x] **Tier Cards Grid** - Individual tier details
- [x] **Feature Matrix Table** - Features included per tier
- [x] **Price Point Cards** - Tier pricing and billing cycles
- [x] **Target Audience Tags** - Target customer segments per tier
- [ ] **Value Proposition Cards** - Value delivered per tier

#### Tier Performance Metrics
- [x] **Conversion Rate Chart** - Expected conversion rates per tier
- [ ] **Customer Lifetime Value** - LTV projections per tier
- [ ] **Churn Rate Indicators** - Expected churn rates
- [ ] **Upgrade Path Diagram** - Customer upgrade journey

### Competitive Pricing Analysis

#### Market Positioning
- [x] **Price Positioning Chart** - Our pricing vs competitors
- [x] **Value-Price Matrix** - Value delivered vs price charged
- [x] **Market Price Range** - Industry pricing benchmarks
- [ ] **Competitive Advantage Cards** - Pricing advantages identified

#### Competitor Pricing Details
- [ ] **Competitor Pricing Table** - Detailed competitor pricing breakdown
- [ ] **Feature-Price Comparison** - Features offered at different price points
- [x] **Pricing Strategy Tags** - Competitor pricing strategies
- [ ] **Market Share Impact** - How pricing affects market share

### Pricing Optimization

#### Price Testing & Validation
- [x] **Price Sensitivity Analysis** - Customer price sensitivity curves
- [ ] **A/B Test Results** - Pricing experiment outcomes
- [ ] **Willingness to Pay Chart** - Customer willingness to pay distribution
- [ ] **Price Elasticity Gauge** - Demand elasticity indicators

#### Revenue Projections
- [x] **Revenue Forecast Chart** - Revenue projections by pricing model
- [ ] **Break-even Analysis** - Break-even points for different prices
- [ ] **Scenario Planning** - Best/worst/expected case scenarios
- [ ] **ROI Calculator** - Return on investment projections

#### Optimization Recommendations
- [ ] **Pricing Recommendations Cards** - Strategic pricing suggestions
- [ ] **Implementation Timeline** - Pricing rollout schedule
- [ ] **Risk Assessment** - Pricing strategy risks and mitigations
- [ ] **Success Metrics** - KPIs to track pricing success

**Charts & Visualizations:**
- [ ] **Pricing Strategy Comparison Matrix** - Strategy evaluation across criteria
- [x] **Tier Revenue Waterfall** - Revenue contribution by tier
- [x] **Competitive Pricing Scatter Plot** - Price vs value positioning
- [x] **Price Sensitivity Curve** - Demand response to price changes
- [x] **Revenue Projection Timeline** - Expected revenue over time

---

## Data Relationships Summary

### Core Validation Flow
```
IdeaValidation (main container)
├── ValidationMetrics (overview dashboard)
├── BusinessValidation → MonthlyProjection, AcquisitionChannel, BusinessInsight
├── MarketValidation → MarketInsight, MarketRegionScore
├── RiskAnalysis → RiskItem
├── ProductMarketFitAnalysis
├── MarketTrendAnalysis → MarketTrend
├── TargetAudienceSegmentation → AudienceSegment
├── CustomerJourneyMapping → JourneyStage, Touchpoint, JourneyPainPoint
├── CustomerNeedAnalysis → CustomerNeed, PainPoint
└── PricingStrategyAnalysis → PricingTier, CompetitorPricing
```

### Chart-Optimized Design
All models are designed with consolidated scoring (single `overallScore` fields) and essential metrics for optimal chart rendering and dashboard performance.