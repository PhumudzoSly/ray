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
- **Progress Ring Chart** - Overall validation score (0-100)
- **Status Badge** - Validation status (PENDING, IN_PROGRESS, COMPLETED)
- **Progress Bar** - Validation progress percentage
- **Gauge Chart** - Confidence level (0-100)
- **Timeline Component** - Validation timeline (started, completed, last updated)

### Key Performance Indicators
- **Dual Gauge Dashboard** - Overall strength vs risk scores
- **KPI Cards Grid** - Time to market, funding required, break-even month
- **Metric Cards** - Customer payback period, market penetration
- **Score Comparison Chart** - Strength vs risk visualization

### Action Items Summary
- **Action Counter Cards** - Immediate/short-term/long-term action counts
- **Priority Matrix** - Action items by urgency and impact
- **Progress Tracker** - Completion status of action items

### Product-Market Fit (PMF) Metrics
- **PMF Score Gauge** - Overall PMF score (0-100)
- **NPS Score Gauge** - Net Promoter Score (0-100)
- **Retention Rate Chart** - User retention over time
- **PMF Survey Results** - "Must-have" product score (Sean Ellis test)
- **DAU/MAU Ratio** - Stickiness of the product
- **Qualitative Feedback Summary** - Key themes from user feedback

### Quick Stats Cards
- **Module Status Grid** - Summary cards for each validation module
- **Progress Indicators** - Completion status for each validation area
- **Score Overview Cards** - Key metrics from all modules

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
- **Info Cards Grid** - Primary revenue model, pricing strategy, price point
- **Strategy Badge** - Go-to-market strategy
- **Duration Card** - Sales cycle length (days)

#### Unit Economics
- **Metric Cards** - CAC, LTV, Monthly churn rate
- **Ratio Gauge** - LTV/CAC ratio visualization
- **Economics Dashboard** - Unit economics overview

#### Financial Projections
- **Line Chart** - Monthly revenue/cost projections (time-series)
- **Break-even Chart** - Break-even analysis visualization
- **Investment Cards** - Initial investment, total funding needed
- **Financial Timeline** - Funding milestones and projections

#### Acquisition Channels
- **Channel Effectiveness Chart** - Bar/radar chart of channel scores
- **Cost Comparison Table** - Cost per acquisition by channel
- **Recommendations List** - Channel optimization suggestions

### Market Validation Section

#### Market Size Analysis
- **Funnel Chart** - TAM/SAM/SOM visualization
- **Growth Rate Gauge** - Market growth rate indicator
- **Market Size Cards** - Individual TAM/SAM/SOM values

#### Customer Research
- **Segment Badge** - Primary customer segment
- **Research Counter Cards** - Interview and survey counts
- **Research Progress Bar** - Data collection progress

#### Geographic Analysis
- **Region Tags** - Primary regions list
- **Heatmap** - Regional market scores visualization
- **Geographic Table** - Regional opportunity breakdown

### Market Trends Section

#### Trend Analysis Overview
- **Trend Summary Card** - Primary trend, total tracked, timeframe
- **Overall Score Gauge** - Overall trend score visualization

#### Individual Market Trends
- **Trend Cards Grid** - Individual trend analysis cards
- **Category Tags** - Trend categories (technology, social, economic, regulatory)
- **Impact Matrix** - Impact scores vs timeline scatter plot
- **Opportunity vs Threat Chart** - Dual-axis comparison
- **Certainty Indicators** - Confidence level badges

**Charts & Visualizations:**
- **Time-series Line Chart** - Revenue/cost projection timeline
- **Funnel Diagram** - Market size funnel (TAM/SAM/SOM)
- **Geographic Heatmap** - Regional opportunity mapping
- **Horizontal Bar Chart** - Acquisition channel effectiveness
- **Scatter Plot Matrix** - Market trend impact analysis

### Risk Management Section

**Primary Models:**
- `RiskAnalysis` - Risk overview and scoring
- `RiskItem` - Individual risk details

**Content & Components:**

#### Risk Overview
- **Risk Matrix** - Likelihood vs. Impact of identified risks
- **Top Risks List** - Top 5 risks by score
- **Risk Score Gauge** - Overall risk score for the business validation

#### Risk Breakdown
- **Risk Category Donut Chart** - Breakdown of risks by category (Market, Financial, Technical, etc.)
- **Risk Mitigation Table** - List of risks, their mitigation strategies, and owners

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
- **Primary Segment Badge** - Main target segment
- **Segmentation Score Gauge** - Overall segmentation score
- **Segment Counter Cards** - Total segments, market size, average segment size

#### Market Metrics
- **Accessibility Gauge** - Segment accessibility score
- **Penetration Chart** - Market penetration visualization
- **Size Comparison Chart** - Segment size comparison

#### Individual Audience Segments
- **Segment Cards Grid** - Individual segment analysis
- **Demographics Table** - Age range, income, location breakdown
- **Behavior Tags** - Behavioral characteristics
- **Psychographics Cards** - Values, interests, lifestyle
- **Channel Preference Chart** - Preferred communication channels

### Customer Journey Mapping Section

#### Journey Overview
- **Journey Score Gauge** - Overall journey score
- **Stage Counter** - Total journey stages
- **Journey Timeline** - Visual journey progression

#### Journey Stages Analysis
- **Stage Flow Diagram** - Sequential journey stages
- **Stage Cards** - Individual stage details (name, description, duration)
- **Touchpoint Matrix** - Touchpoints per stage visualization
- **Pain Point Indicators** - Pain points distribution across stages

#### Touchpoints & Interactions
- **Touchpoint Grid** - All customer touchpoints
- **Channel Distribution Chart** - Touchpoint channels breakdown
- **Effectiveness Scores** - Touchpoint effectiveness ratings
- **Optimization Recommendations** - Touchpoint improvement suggestions

#### Journey Pain Points
- **Pain Point Heatmap** - Pain points across journey stages
- **Severity Indicators** - Pain point severity levels
- **Impact Assessment** - Pain point impact on customer experience
- **Resolution Priority Matrix** - Pain point resolution priorities

### Customer Need Analysis Section

#### Needs Overview
- **Primary Need Badge** - Main customer need
- **Need Score Gauge** - Overall need analysis score
- **Need Counter Cards** - Total needs identified, pain points

#### Need Assessment
- **Need Urgency Gauge** - Customer need urgency level
- **Solution Gap Chart** - Gap between current solutions and needs
- **Willingness Indicator** - Customer willingness to pay/adopt

#### Individual Customer Needs
- **Need Cards Grid** - Individual need analysis
- **Category Tags** - Need categories (functional, emotional, social)
- **Priority Matrix** - Need importance vs satisfaction
- **Validation Status** - Need validation progress

#### Pain Points Analysis
- **Pain Point Cards** - Individual pain point details
- **Severity Distribution** - Pain point severity breakdown
- **Frequency Chart** - How often pain points occur
- **Impact Assessment** - Business impact of addressing pain points

**Charts & Visualizations:**
- **Segment Size Bubble Chart** - Audience segment comparison
- **Customer Journey Flow** - Sequential journey visualization
- **Pain Point Heatmap** - Journey stage vs pain point intensity
- **Need-Solution Gap Analysis** - Current vs desired state
- **Touchpoint Effectiveness Radar** - Multi-dimensional touchpoint analysis

---

## 4. Competitors Page (`/ideas/{id}/competitors`)

**Primary Models:**
- External competitor data (from `idea.prisma` - `Competitor` model)
- `CompetitorPricing` - Competitor pricing analysis
- Market positioning analysis

**Content & Components:**

### Competitor Overview

#### Market Landscape
- **Competitor Count Card** - Total competitors identified
- **Market Position Map** - Competitive positioning scatter plot
- **Threat Level Indicators** - Competitor threat assessment
- **Market Share Chart** - Competitor market share distribution

### Direct Competitors Analysis

#### Competitor Profiles
- **Competitor Cards Grid** - Individual competitor profiles
- **Company Info Cards** - Name, description, founding year, size
- **Strength Assessment** - Competitor strengths and weaknesses
- **Feature Comparison Table** - Feature-by-feature comparison matrix

#### Competitive Positioning
- **Positioning Matrix** - Price vs quality/features positioning
- **Differentiation Chart** - Unique value propositions comparison
- **Target Audience Overlap** - Audience overlap analysis
- **Geographic Presence Map** - Competitor geographic coverage

### Pricing Competition Analysis

#### Pricing Overview
- **Pricing Strategy Cards** - Competitor pricing models
- **Price Range Chart** - Pricing distribution across competitors
- **Value Proposition Matrix** - Price vs value comparison

#### Detailed Pricing Analysis
- **Pricing Tier Table** - Competitor pricing tiers breakdown
- **Feature-Price Matrix** - Features offered at different price points
- **Pricing Trends Chart** - Historical pricing changes
- **Competitive Pricing Recommendations** - Suggested pricing strategy

### Competitive Intelligence

#### Market Dynamics
- **Competitive Intensity Gauge** - Overall market competition level
- **Entry Barriers Assessment** - Market entry difficulty indicators
- **Switching Costs Analysis** - Customer switching cost evaluation
- **Innovation Rate Chart** - Rate of innovation in the market

#### SWOT Analysis
- **Strengths Cards** - Our competitive strengths
- **Weaknesses Cards** - Areas for improvement
- **Opportunities Cards** - Market opportunities to exploit
- **Threats Cards** - Competitive threats to address

#### Competitive Advantage
- **Advantage Matrix** - Our advantages vs competitors
- **Moat Analysis** - Sustainable competitive advantages
- **Differentiation Factors** - Key differentiating factors
- **Competitive Response Plan** - Strategic response recommendations

**Charts & Visualizations:**
- **Competitive Positioning Scatter Plot** - Price vs features/quality
- **Market Share Pie Chart** - Competitor market share distribution
- **Feature Comparison Heatmap** - Feature availability across competitors
- **Pricing Distribution Histogram** - Competitor pricing ranges
- **SWOT Analysis Quadrant** - Strategic positioning analysis

---

## 5. Pricing Page (`/ideas/{id}/pricing`)

**Primary Models:**
- `PricingStrategyAnalysis` - Pricing strategy and analysis
- `PricingTier` - Individual pricing tiers
- `CompetitorPricing` - Competitive pricing data

**Content & Components:**

### Pricing Strategy Overview

#### Strategy Summary
- **Primary Strategy Badge** - Main pricing strategy (freemium, subscription, etc.)
- **Pricing Score Gauge** - Overall pricing strategy score
- **Recommended Price Card** - Optimal price point recommendation

#### Strategy Analysis
- **Strategy Comparison Table** - Different pricing strategies evaluated
- **Price Acceptance Gauge** - Customer price acceptance level
- **Competitiveness Score** - Pricing competitiveness indicator
- **Profitability Score** - Expected profitability assessment

### Pricing Tiers Analysis

#### Tier Overview
- **Tier Counter Card** - Total pricing tiers analyzed
- **Tier Structure Diagram** - Visual pricing tier hierarchy
- **Revenue Distribution Chart** - Expected revenue per tier

#### Individual Pricing Tiers
- **Tier Cards Grid** - Individual tier details
- **Feature Matrix Table** - Features included per tier
- **Price Point Cards** - Tier pricing and billing cycles
- **Target Audience Tags** - Target customer segments per tier
- **Value Proposition Cards** - Value delivered per tier

#### Tier Performance Metrics
- **Conversion Rate Chart** - Expected conversion rates per tier
- **Customer Lifetime Value** - LTV projections per tier
- **Churn Rate Indicators** - Expected churn rates
- **Upgrade Path Diagram** - Customer upgrade journey

### Competitive Pricing Analysis

#### Market Positioning
- **Price Positioning Chart** - Our pricing vs competitors
- **Value-Price Matrix** - Value delivered vs price charged
- **Market Price Range** - Industry pricing benchmarks
- **Competitive Advantage Cards** - Pricing advantages identified

#### Competitor Pricing Details
- **Competitor Pricing Table** - Detailed competitor pricing breakdown
- **Feature-Price Comparison** - Features offered at different price points
- **Pricing Strategy Tags** - Competitor pricing strategies
- **Market Share Impact** - How pricing affects market share

### Pricing Optimization

#### Price Testing & Validation
- **Price Sensitivity Analysis** - Customer price sensitivity curves
- **A/B Test Results** - Pricing experiment outcomes
- **Willingness to Pay Chart** - Customer willingness to pay distribution
- **Price Elasticity Gauge** - Demand elasticity indicators

#### Revenue Projections
- **Revenue Forecast Chart** - Revenue projections by pricing model
- **Break-even Analysis** - Break-even points for different prices
- **Scenario Planning** - Best/worst/expected case scenarios
- **ROI Calculator** - Return on investment projections

#### Optimization Recommendations
- **Pricing Recommendations Cards** - Strategic pricing suggestions
- **Implementation Timeline** - Pricing rollout schedule
- **Risk Assessment** - Pricing strategy risks and mitigations
- **Success Metrics** - KPIs to track pricing success

**Charts & Visualizations:**
- **Pricing Strategy Comparison Matrix** - Strategy evaluation across criteria
- **Tier Revenue Waterfall** - Revenue contribution by tier
- **Competitive Pricing Scatter Plot** - Price vs value positioning
- **Price Sensitivity Curve** - Demand response to price changes
- **Revenue Projection Timeline** - Expected revenue over time

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