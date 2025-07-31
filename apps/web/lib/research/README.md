# Research System with Exa Integration

## Overview

The research system has been updated to use Exa for real web research instead of just AI generation. This provides much more accurate and up-to-date insights for SaaS validation.

## Key Components

### 1. ExaResearcher (`lib/research/exaResearch.ts`)

- Conducts actual web research using Exa's search API
- Gathers real-time data from multiple sources
- Analyzes and synthesizes findings using AI
- Provides confidence scores based on data quality

### 2. Updated Base Analyzer (`inngest/analyzers/baseAnalyzer.ts`)

- New `conductResearchAnalysis()` method for research-based analysis
- Integrates Exa research with AI analysis
- Fallback to traditional analysis if research fails
- Abstract `getSearchQueries()` method for each analyzer to implement

### 3. Research-Enhanced Analyzers

- **MarketScanAnalyzer**: Real market data, trends, and opportunities
- **CompetitiveAnalyzer**: Live competitor information and pricing
- **CustomerValidationAnalyzer**: Current customer research and pain points
- **BusinessModelAnalyzer**: Real-world business model examples and metrics

## How It Works

1. **Research Phase**: Each analyzer defines specific search queries for their domain
2. **Data Gathering**: Exa searches the web for current, relevant information
3. **AI Analysis**: GPT analyzes the research data and generates structured insights
4. **Quality Assessment**: Confidence scores based on research quality and completeness

## Benefits

- **Real Data**: Uses actual market data instead of AI hallucinations
- **Current Information**: Gets the latest trends, pricing, and competitive landscape
- **Higher Confidence**: Research-backed insights have higher confidence scores
- **Source Attribution**: All findings include source URLs for verification

## Search Query Examples

### Market Scan

- `{industry} market size 2024 TAM SAM SOM`
- `{industry} industry growth rate trends 2024`
- `{industry} SaaS market opportunities 2024`

### Competitive Analysis

- `{industry} SaaS competitors 2024`
- `{ideaName} competitors alternatives`
- `{industry} software pricing strategies`

### Customer Validation

- `{targetAudience} pain points challenges 2024`
- `{industry} customer personas demographics`
- `{industry} software buying behavior`

## Usage

The research system is automatically used when starting deep research validation:

```typescript
// Server action
await startResearchValidation({ ideaId, depth: "DEEP" });

// Component
<ResearchValidationButton ideaId={ideaId} depth="DEEP" />
```

## Configuration

Exa API key must be set in environment variables:

```bash
EXA_API_KEY=your_exa_api_key_here
```

## Fallback Behavior

If Exa research fails (API issues, rate limits, etc.), the system automatically falls back to traditional AI-only analysis to ensure reliability.
