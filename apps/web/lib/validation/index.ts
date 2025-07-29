// ============================================================================
// VALIDATION SYSTEM MAIN INDEX
// ============================================================================

// Core AI SDK client
export { aiClient } from './client';

// Database operations
export * from './database';

// Research utilities
export { researchUtils } from './research';

// Schemas
export * from './schemas';

// Individual validation functions
export * from './functions';

// Orchestrator
export { runValidationOrchestrator } from './orchestrator';
export type { ValidationOrchestratorParams, ValidationOrchestratorResult } from './orchestrator';

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Run full validation
import { runValidationOrchestrator } from '@/lib/validation';

const result = await runValidationOrchestrator({
  ideaId: 'idea-123',
  researchId: 'research-456',
  ideaDescription: 'A SaaS platform for project management',
  targetMarket: 'project management software',
  targetAudience: 'small to medium businesses',
});

// Example 2: Run individual validation function
import { analyzeCompetitiveLandscape } from '@/lib/validation';

const competitiveLandscape = await analyzeCompetitiveLandscape({
  ideaId: 'idea-123',
  researchId: 'research-456',
  ideaDescription: 'A SaaS platform for project management',
  targetMarket: 'project management software',
});

// Example 3: Skip specific validations
const result = await runValidationOrchestrator({
  ideaId: 'idea-123',
  researchId: 'research-456',
  ideaDescription: 'A SaaS platform for project management',
  targetMarket: 'project management software',
  options: {
    skipFinancialProjection: true,
    skipRegulatoryCompliance: true,
  },
});
*/ 