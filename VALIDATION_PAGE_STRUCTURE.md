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

**Content:**

### Business Validation Section
- **Revenue Model & Strategy**
  - Primary revenue model
  - Pricing strategy
  - Primary price point
  - Go-to-market strategy
  - Sales cycle length

- **Unit Economics**
  - Customer Acquisition Cost (CAC)
  - Customer Lifetime Value (LTV)
  - Monthly churn rate
  - LTV/CAC ratio

- **Financial Projections**
  - Monthly revenue/cost projections (time-series charts)
  - Break-even analysis
  - Initial investment requirements
  - Total funding needed

- **Acquisition Channels**
  - Channel effectiveness scores
  - Cost per acquisition by channel
  - Channel optimization recommendations

### Market Validation Section
- **Market Size Analysis**
  - Total Addressable Market (TAM)
  - Serviceable Addressable Market (SAM)
  - Serviceable Obtainable Market (SOM)
  - Market growth rate

- **Customer Research**
  - Primary customer segment
  - Customer interviews conducted
  - Survey responses collected

- **Geographic Analysis**
  - Primary regions
  - Regional market scores
  - Geographic opportunity mapping

### Market Trends Section
- **Trend Analysis Overview**
  - Primary trend identification
  - Total trends tracked
  - Analysis timeframe
  - Overall trend score

- **Individual Market Trends**
  - Trend categories (technology, social, economic, regulatory)
  - Impact scores and timelines
  - Opportunity vs threat assessment
  - Certainty levels

**Charts & Visualizations:**
- Revenue/cost projection timeline
- Market size funnel (TAM/SAM/SOM)
- Regional opportunity heatmap
- Acquisition channel effectiveness
- Market trend impact matrix

---

## 3. Audience Page (`/ideas/{id}/audience`)

**Primary Models:**
- `TargetAudienceSegmentation` - Audience segments
- `CustomerJourneyMapping` - Customer journey analysis
- `CustomerNeedAnalysis` - Customer needs and pain points
- Related sub-models: `AudienceSegment`, `JourneyStage`, `Touchpoint`, `JourneyPainPoint`, `CustomerNeed`, `PainPoint`

**Content:**

### Target Audience Segmentation
- **Segmentation Overview**
  - Primary segment identification
  - Total segments analyzed
  - Total market size
  - Overall segmentation score

- **Segment Analysis**
  - Segment sizes and attractiveness scores
  - Accessibility and profitability scores
  - Primary and secondary needs per segment
  - Budget ranges and preferred solutions

### Customer Journey Mapping
- **Journey Overview**
  - Total journey stages
  - Average journey time
  - Overall journey score
  - Conversion and drop-off rates

- **Journey Stages**
  - Stage-by-stage analysis
  - Conversion rates between stages
  - Satisfaction and friction scores
  - Customer goals, actions, thoughts, emotions
  - Support ticket generation

- **Touchpoints**
  - Touchpoint effectiveness and satisfaction
  - Usage frequency and importance
  - Optimization potential
  - Cost efficiency analysis

- **Journey Pain Points**
  - Pain point severity and frequency
  - Business impact and resolution difficulty
  - Revenue impact and support costs
  - Proposed solutions and priorities

### Customer Needs Analysis
- **Needs Overview**
  - Primary need identification
  - Total needs and pain points identified
  - Overall need score
  - Need urgency and solution gaps

- **Individual Customer Needs**
  - Need categories (functional, emotional, social)
  - Intensity, frequency, and urgency scores
  - Satisfaction gaps
  - Trigger events and desired outcomes

- **Pain Points Analysis**
  - Pain categories (process, cost, time, quality, experience)
  - Severity, frequency, and impact scores
  - Time and financial costs
  - Current mitigation strategies

**Charts & Visualizations:**
- Audience segment comparison matrix
- Customer journey flow diagram
- Touchpoint effectiveness radar
- Pain point impact vs frequency scatter plot
- Need intensity heatmap

---

## 4. Competitors Page (`/ideas/{id}/competitors`)

**Primary Models:**
- External competitor data (likely from `idea.prisma` - `Competitor` model)
- `CompetitorPricing` - Competitive pricing analysis

**Content:**
- **Competitor Overview**
  - Direct and indirect competitors
  - Market positioning analysis
  - Competitive landscape mapping

- **Competitive Pricing Analysis**
  - Competitor pricing models
  - Base and premium pricing tiers
  - Feature and value comparisons
  - Market positioning (premium, value, budget)
  - Market share and customer satisfaction
  - Pricing advantages/disadvantages

- **Competitive Intelligence**
  - Strengths and weaknesses analysis
  - Market gaps and opportunities
  - Differentiation strategies

**Charts & Visualizations:**
- Competitive positioning matrix
- Pricing comparison charts
- Feature comparison tables
- Market share visualization

---

## 5. Pricing Page (`/ideas/{id}/pricing`)

**Primary Models:**
- `PricingStrategyAnalysis` - Pricing strategy and analysis
- `PricingTier` - Pricing tier analysis
- `CompetitorPricing` - Competitive pricing data

**Content:**

### Pricing Strategy Analysis
- **Strategy Overview**
  - Primary pricing strategy
  - Recommended price point
  - Total tiers analyzed
  - Overall pricing score

- **Pricing Metrics**
  - Price acceptance score
  - Competitiveness score
  - Profitability score

### Pricing Tier Analysis
- **Tier Structure**
  - Tier names and pricing
  - Features included per tier
  - Target segments

- **Tier Performance**
  - Expected conversion rates
  - Popularity scores
  - Profit margins
  - Competitive positioning

### Competitive Pricing Analysis
- **Competitor Pricing Models**
  - Pricing model types (subscription, one-time, usage-based, freemium)
  - Base and premium pricing
  - Feature and value comparisons

- **Market Positioning**
  - Market position analysis
  - Customer satisfaction comparison
  - Pricing advantage analysis

**Charts & Visualizations:**
- Pricing tier comparison table
- Price acceptance vs profitability matrix
- Competitive pricing landscape
- Tier popularity and conversion forecasts
- Price elasticity analysis

---

## Data Relationships Summary

### Core Validation Flow
```
IdeaValidation (main container)
├── ValidationMetrics (overview dashboard)
├── BusinessValidation → MonthlyProjection, AcquisitionChannel, BusinessInsight
├── MarketValidation → MarketInsight, MarketRegionScore
├── MarketTrendAnalysis → MarketTrend
├── TargetAudienceSegmentation → AudienceSegment
├── CustomerJourneyMapping → JourneyStage, Touchpoint, JourneyPainPoint
├── CustomerNeedAnalysis → CustomerNeed, PainPoint
└── PricingStrategyAnalysis → PricingTier, CompetitorPricing
```

### Chart-Optimized Design
All models are designed with consolidated scoring (single `overallScore` fields) and essential metrics for optimal chart rendering and dashboard performance.