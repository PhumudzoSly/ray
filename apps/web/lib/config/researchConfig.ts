import type { ResearchDepthConfig, ResearchPhaseType } from "@/types/research";

export const RESEARCH_DEPTHS = {
  QUICK: {
    maxIterations: 3,
    timeout: 300000, // 5 minutes
    phases: ["MARKET_SCAN", "COMPETITIVE_OVERVIEW"] as ResearchPhaseType[],
    aiModel: "gemini-2.0-flash-thinking-exp",
    costEstimate: 0.05,
  },
  STANDARD: {
    maxIterations: 5,
    timeout: 600000, // 10 minutes
    phases: [
      "MARKET_SCAN",
      "COMPETITIVE_DEEP_DIVE",
      "CUSTOMER_VALIDATION",
    ] as ResearchPhaseType[],
    aiModel: "gemini-2.0-flash-thinking-exp",
    costEstimate: 0.15,
  },
  DEEP: {
    maxIterations: 10,
    timeout: 900000, // 15 minutes
    phases: [
      "MARKET_SCAN",
      "COMPETITIVE_DEEP_DIVE",
      "CUSTOMER_VALIDATION",
      "BUSINESS_MODEL",
      "FINANCIAL_PROJECTIONS",
    ] as ResearchPhaseType[],
    aiModel: "gemini-2.0-flash-thinking-exp",
    costEstimate: 0.35,
  },
  EXHAUSTIVE: {
    maxIterations: 20,
    timeout: 1800000, // 30 minutes
    phases: [
      "MARKET_SCAN",
      "COMPETITIVE_DEEP_DIVE",
      "CUSTOMER_VALIDATION",
      "BUSINESS_MODEL",
      "FINANCIAL_PROJECTIONS",
      "RISK_ANALYSIS",
      "TECHNICAL_FEASIBILITY",
    ] as ResearchPhaseType[],
    aiModel: "gemini-2.0-flash-thinking-exp",
    costEstimate: 0.75,
  },
} as const satisfies Record<string, ResearchDepthConfig>;

export const PHASE_DESCRIPTIONS = {
  MARKET_SCAN: {
    name: "Market Scan",
    description: "Analyze market size, trends, and opportunities",
    estimatedDuration: 60000, // 1 minute
  },
  COMPETITIVE_OVERVIEW: {
    name: "Competitive Overview",
    description: "Quick competitive landscape analysis",
    estimatedDuration: 120000, // 2 minutes
  },
  COMPETITIVE_DEEP_DIVE: {
    name: "Competitive Deep Dive",
    description: "Detailed competitor analysis and positioning",
    estimatedDuration: 180000, // 3 minutes
  },
  CUSTOMER_VALIDATION: {
    name: "Customer Validation",
    description: "Target audience and customer needs analysis",
    estimatedDuration: 150000, // 2.5 minutes
  },
  BUSINESS_MODEL: {
    name: "Business Model",
    description: "Revenue streams and business model analysis",
    estimatedDuration: 200000, // 3.3 minutes
  },
  FINANCIAL_PROJECTIONS: {
    name: "Financial Projections",
    description: "Revenue and cost projections",
    estimatedDuration: 240000, // 4 minutes
  },
  RISK_ANALYSIS: {
    name: "Risk Analysis",
    description: "Identify and assess potential risks",
    estimatedDuration: 180000, // 3 minutes
  },
  TECHNICAL_FEASIBILITY: {
    name: "Technical Feasibility",
    description: "Technical implementation assessment",
    estimatedDuration: 200000, // 3.3 minutes
  },
} as const;

export function getResearchConfig(depth: keyof typeof RESEARCH_DEPTHS) {
  return RESEARCH_DEPTHS[depth];
}

export function calculateEstimatedDuration(
  phases: ResearchPhaseType[]
): number {
  return phases.reduce((total, phase) => {
    return total + PHASE_DESCRIPTIONS[phase].estimatedDuration;
  }, 0);
}

export function formatDuration(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}
