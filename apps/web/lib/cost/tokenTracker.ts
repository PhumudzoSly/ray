import { inngestClient } from "@/lib/inngest";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  cost: number;
}

export interface CostAlert {
  sessionId: string;
  currentCost: number;
  threshold: number;
  alertType: "warning" | "critical";
}

export class TokenTracker {
  private static readonly MODEL_COSTS = {
    "gemini-2.0-flash-thinking-exp": {
      inputCostPer1K: 0.00015, // $0.00015 per 1K input tokens
      outputCostPer1K: 0.0006, // $0.0006 per 1K output tokens
    },
    "gemini-2.0-flash": {
      inputCostPer1K: 0.000075, // $0.000075 per 1K input tokens
      outputCostPer1K: 0.0003, // $0.0003 per 1K output tokens
    },
    "gemini-1.5-pro": {
      inputCostPer1K: 0.00125, // $0.00125 per 1K input tokens
      outputCostPer1K: 0.005, // $0.005 per 1K output tokens
    },
  } as const;

  private static readonly COST_THRESHOLDS = {
    WARNING: 0.5, // $0.50
    CRITICAL: 1.0, // $1.00
  };

  static calculateCost(usage: Omit<TokenUsage, "cost">): TokenUsage {
    const modelCosts =
      this.MODEL_COSTS[usage.model as keyof typeof this.MODEL_COSTS];

    if (!modelCosts) {
      console.warn(`Unknown model for cost calculation: ${usage.model}`);
      return { ...usage, cost: 0 };
    }

    const inputCost = (usage.inputTokens / 1000) * modelCosts.inputCostPer1K;
    const outputCost = (usage.outputTokens / 1000) * modelCosts.outputCostPer1K;
    const totalCost = inputCost + outputCost;

    return {
      ...usage,
      cost: Math.round(totalCost * 10000) / 10000, // Round to 4 decimal places
    };
  }

  static async trackUsage(
    sessionId: string,
    phase: string,
    usage: Omit<TokenUsage, "cost">
  ): Promise<TokenUsage> {
    const tokenUsage = this.calculateCost(usage);

    // Send cost tracking event to Inngest
    await inngestClient.send({
      name: "deep-research/track-cost",
      data: {
        sessionId,
        cost: tokenUsage.cost,
        phase,
        usage: tokenUsage,
      },
    });

    return tokenUsage;
  }

  static async checkCostThresholds(
    sessionId: string,
    currentCost: number,
    organizationId: string
  ): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];

    if (currentCost >= this.COST_THRESHOLDS.CRITICAL) {
      alerts.push({
        sessionId,
        currentCost,
        threshold: this.COST_THRESHOLDS.CRITICAL,
        alertType: "critical",
      });
    } else if (currentCost >= this.COST_THRESHOLDS.WARNING) {
      alerts.push({
        sessionId,
        currentCost,
        threshold: this.COST_THRESHOLDS.WARNING,
        alertType: "warning",
      });
    }

    // Send alerts if any
    for (const alert of alerts) {
      await inngestClient.send({
        name: "deep-research/cost-alert",
        data: {
          ...alert,
          organizationId,
        },
      });
    }

    return alerts;
  }

  static estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is a simplified estimation; actual tokenization varies by model
    return Math.ceil(text.length / 4);
  }

  static formatCost(cost: number): string {
    if (cost < 0.01) {
      return `$${(cost * 100).toFixed(2)}¢`;
    }
    return `$${cost.toFixed(4)}`;
  }

  static getModelRecommendation(
    estimatedTokens: number,
    qualityRequirement: "high" | "medium" | "low"
  ): string {
    // For high-quality research, use the thinking model
    if (qualityRequirement === "high") {
      return "gemini-2.0-flash-thinking-exp";
    }

    // For medium quality or large token counts, use standard flash
    if (qualityRequirement === "medium" || estimatedTokens > 50000) {
      return "gemini-2.0-flash";
    }

    // For low quality requirements, use the cheapest option
    return "gemini-2.0-flash";
  }

  static async getBudgetStatus(
    organizationId: string,
    currentPeriodStart: Date
  ): Promise<{
    totalSpent: number;
    budgetLimit?: number;
    remainingBudget?: number;
    isOverBudget: boolean;
  }> {
    // This would typically query the database for organization budget settings
    // For now, return a placeholder implementation
    const totalSpent = 0; // Would be calculated from database
    const budgetLimit = 100; // Would come from organization settings

    return {
      totalSpent,
      budgetLimit,
      remainingBudget: budgetLimit - totalSpent,
      isOverBudget: totalSpent > budgetLimit,
    };
  }
}

// Utility function to wrap AI calls with cost tracking
export async function trackAICall<T>(
  sessionId: string,
  phase: string,
  model: string,
  aiCall: () => Promise<T>,
  estimateTokens?: (result: T) => { input: number; output: number }
): Promise<{ result: T; usage: TokenUsage }> {
  const startTime = Date.now();

  try {
    const result = await aiCall();
    const duration = Date.now() - startTime;

    // Estimate token usage if not provided
    let inputTokens = 0;
    let outputTokens = 0;

    if (estimateTokens) {
      const tokens = estimateTokens(result);
      inputTokens = tokens.input;
      outputTokens = tokens.output;
    } else {
      // Fallback estimation
      const resultStr =
        typeof result === "string" ? result : JSON.stringify(result);
      outputTokens = TokenTracker.estimateTokens(resultStr);
      inputTokens = Math.floor(outputTokens * 0.3); // Rough estimate
    }

    const usage = await TokenTracker.trackUsage(sessionId, phase, {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      model,
    });

    console.log(
      `AI call completed - Phase: ${phase}, Duration: ${duration}ms, Cost: ${TokenTracker.formatCost(usage.cost)}`
    );

    return { result, usage };
  } catch (error) {
    console.error(
      `AI call failed - Phase: ${phase}, Duration: ${Date.now() - startTime}ms`,
      error
    );
    throw error;
  }
}
