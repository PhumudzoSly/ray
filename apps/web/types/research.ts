export type ResearchDepth = "QUICK" | "STANDARD" | "DEEP" | "EXHAUSTIVE";

export type ResearchPhaseType =
  | "MARKET_SCAN"
  | "COMPETITIVE_OVERVIEW"
  | "COMPETITIVE_DEEP_DIVE"
  | "CUSTOMER_VALIDATION"
  | "BUSINESS_MODEL"
  | "FINANCIAL_PROJECTIONS"
  | "RISK_ANALYSIS"
  | "TECHNICAL_FEASIBILITY";

export type PhaseStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "PAUSED";

export type ResearchStatus =
  | "INITIALIZING"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED";

export interface ResearchPhase {
  id: string;
  name: ResearchPhaseType;
  status: PhaseStatus;
  findings: Record<string, any>;
  questions: string[];
  confidence: number;
  duration: number;
  iterations: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface ResearchSession {
  id: string;
  ideaId: string;
  organizationId: string;
  depth: ResearchDepth;
  status: ResearchStatus;
  phases: ResearchPhase[];
  currentPhaseIndex: number;
  overallConfidence: number;
  estimatedCompletion: Date;
  actualCompletion?: Date;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchProgress {
  sessionId: string;
  currentPhase: ResearchPhaseType;
  phaseProgress: number; // 0-100
  overallProgress: number; // 0-100
  estimatedTimeRemaining: number; // milliseconds
  completedPhases: ResearchPhaseType[];
  failedPhases: ResearchPhaseType[];
}

export interface ResearchDepthConfig {
  maxIterations: number;
  timeout: number;
  phases: ResearchPhaseType[];
  aiModel: string;
  costEstimate: number;
}

export interface AnalysisResult {
  findings: any;
  confidence: number;
  iterations: number;
}

export interface ResearchContext {
  ideaName: string;
  ideaDescription: string;
  industry: string;
  targetAudience?: string;
  problemSolved?: string;
  solutionOffered?: string;
}
