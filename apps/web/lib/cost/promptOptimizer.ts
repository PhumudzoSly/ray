import { TokenTracker } from "./tokenTracker";

export interface PromptOptimizationConfig {
  maxTokens: number;
  compressionRatio: number; // 0.1 to 1.0
  preserveKeywords: string[];
  model: string;
}

export class PromptOptimizer {
  private static readonly DEFAULT_CONFIG: PromptOptimizationConfig = {
    maxTokens: 8000,
    compressionRatio: 0.7,
    preserveKeywords: [],
    model: "gemini-2.0-flash",
  };

  static optimizePrompt(
    prompt: string,
    config: Partial<PromptOptimizationConfig> = {}
  ): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const estimatedTokens = TokenTracker.estimateTokens(prompt);

    // If prompt is within limits, return as-is
    if (estimatedTokens <= finalConfig.maxTokens) {
      return prompt;
    }

    console.log(
      `Optimizing prompt: ${estimatedTokens} tokens -> target: ${finalConfig.maxTokens}`
    );

    // Apply compression techniques
    let optimizedPrompt = prompt;

    // 1. Remove excessive whitespace
    optimizedPrompt = this.removeExcessiveWhitespace(optimizedPrompt);

    // 2. Compress repetitive instructions
    optimizedPrompt = this.compressRepetitiveInstructions(optimizedPrompt);

    // 3. Shorten examples while preserving meaning
    optimizedPrompt = this.shortenExamples(optimizedPrompt);

    // 4. Use more concise language
    optimizedPrompt = this.useConciseLanguage(optimizedPrompt);

    // 5. If still too long, apply aggressive truncation
    const finalTokens = TokenTracker.estimateTokens(optimizedPrompt);
    if (finalTokens > finalConfig.maxTokens) {
      optimizedPrompt = this.aggressiveTruncation(
        optimizedPrompt,
        finalConfig.maxTokens,
        finalConfig.preserveKeywords
      );
    }

    const finalEstimate = TokenTracker.estimateTokens(optimizedPrompt);
    console.log(
      `Prompt optimized: ${estimatedTokens} -> ${finalEstimate} tokens (${Math.round((finalEstimate / estimatedTokens) * 100)}% of original)`
    );

    return optimizedPrompt;
  }

  private static removeExcessiveWhitespace(text: string): string {
    return text
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Multiple newlines -> double newline
      .replace(/[ \t]+/g, " ") // Multiple spaces/tabs -> single space
      .replace(/\n /g, "\n") // Remove spaces after newlines
      .trim();
  }

  private static compressRepetitiveInstructions(text: string): string {
    // Remove repeated phrases like "IMPORTANT:", "NOTE:", etc.
    const repetitivePatterns = [
      /\*\*\*IMPORTANT\*\*\*:?\s*/gi,
      /\*\*IMPORTANT\*\*:?\s*/gi,
      /IMPORTANT:?\s*/gi,
      /NOTE:?\s*/gi,
      /REMEMBER:?\s*/gi,
      /PLEASE:?\s*/gi,
    ];

    let compressed = text;
    repetitivePatterns.forEach((pattern) => {
      const matches = compressed.match(pattern);
      if (matches && matches.length > 2) {
        // Keep only the first occurrence
        compressed = compressed.replace(pattern, (match, offset) => {
          return offset === compressed.search(pattern) ? match : "";
        });
      }
    });

    return compressed;
  }

  private static shortenExamples(text: string): string {
    // Shorten long example blocks while preserving structure
    return text.replace(
      /Example[s]?:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/g,
      (match, exampleContent) => {
        if (exampleContent.length > 500) {
          const shortened =
            exampleContent.substring(0, 300) +
            "...\n[Additional examples truncated for brevity]";
          return `Examples:\n${shortened}`;
        }
        return match;
      }
    );
  }

  private static useConciseLanguage(text: string): string {
    const replacements = [
      // Verbose phrases -> concise alternatives
      [/in order to/gi, "to"],
      [/due to the fact that/gi, "because"],
      [/at this point in time/gi, "now"],
      [/for the purpose of/gi, "to"],
      [/with regard to/gi, "regarding"],
      [/take into consideration/gi, "consider"],
      [/make a decision/gi, "decide"],
      [/conduct an analysis/gi, "analyze"],
      [/perform an assessment/gi, "assess"],
      [/provide recommendations/gi, "recommend"],
      [/it is important to note that/gi, "note that"],
      [/please be aware that/gi, "note:"],
      [/you should ensure that/gi, "ensure"],
      [/it is necessary to/gi, "must"],
      [/you are required to/gi, "must"],
    ];

    let optimized = text;
    replacements.forEach(([verbose, concise]) => {
      optimized = optimized.replace(verbose as RegExp, concise as string);
    });

    return optimized;
  }

  private static aggressiveTruncation(
    text: string,
    maxTokens: number,
    preserveKeywords: string[]
  ): string {
    const sections = text.split("\n\n");
    const targetLength = Math.floor(maxTokens * 4); // Rough character estimate

    // Prioritize sections that contain preserve keywords
    const prioritizedSections = sections.map((section) => ({
      content: section,
      priority: preserveKeywords.some((keyword) =>
        section.toLowerCase().includes(keyword.toLowerCase())
      )
        ? 1
        : 0,
      length: section.length,
    }));

    // Sort by priority (high first), then by length (short first)
    prioritizedSections.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.length - b.length;
    });

    // Build truncated version
    let truncated = "";
    let currentLength = 0;

    for (const section of prioritizedSections) {
      if (currentLength + section.length <= targetLength) {
        truncated += (truncated ? "\n\n" : "") + section.content;
        currentLength += section.length + 2; // +2 for \n\n
      } else {
        // Try to fit a shortened version
        const remainingSpace = targetLength - currentLength - 2;
        if (remainingSpace > 100) {
          const shortened =
            section.content.substring(0, remainingSpace - 20) +
            "...[truncated]";
          truncated += (truncated ? "\n\n" : "") + shortened;
        }
        break;
      }
    }

    return truncated;
  }

  static selectOptimalModel(
    estimatedInputTokens: number,
    qualityRequirement: "high" | "medium" | "low",
    budgetConstraint?: number
  ): string {
    // If budget is very tight, use cheapest model
    if (budgetConstraint && budgetConstraint < 0.01) {
      return "gemini-2.0-flash";
    }

    // For high-quality requirements, use thinking model for complex analysis
    if (qualityRequirement === "high" && estimatedInputTokens < 30000) {
      return "gemini-2.0-flash-thinking-exp";
    }

    // For large inputs or medium quality, use standard flash
    if (estimatedInputTokens > 50000 || qualityRequirement === "medium") {
      return "gemini-2.0-flash";
    }

    // Default to flash for most cases
    return "gemini-2.0-flash";
  }

  static createPromptTemplate(
    basePrompt: string,
    context: Record<string, any>,
    optimizationConfig?: Partial<PromptOptimizationConfig>
  ): string {
    // Replace template variables
    let prompt = basePrompt;
    Object.entries(context).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      const replacement =
        typeof value === "string" ? value : JSON.stringify(value);
      prompt = prompt.replace(new RegExp(placeholder, "g"), replacement);
    });

    // Apply optimization if needed
    if (optimizationConfig) {
      prompt = this.optimizePrompt(prompt, optimizationConfig);
    }

    return prompt;
  }

  static estimateCostForPrompt(
    prompt: string,
    expectedOutputTokens: number,
    model: string
  ): number {
    const inputTokens = TokenTracker.estimateTokens(prompt);
    const usage = TokenTracker.calculateCost({
      inputTokens,
      outputTokens: expectedOutputTokens,
      totalTokens: inputTokens + expectedOutputTokens,
      model,
    });

    return usage.cost;
  }
}
