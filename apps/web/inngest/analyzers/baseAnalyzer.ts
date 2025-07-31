import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import type {
  ResearchPhase,
  AnalysisResult,
  ResearchContext,
} from "@/types/research";
import { CircuitBreaker } from "@/lib/circuitBreaker";
import { PromptOptimizer } from "@/lib/cost/promptOptimizer";
import {
  ExaResearcher,
  type ResearchFindings,
} from "@/lib/research/exaResearch";

export abstract class PhaseAnalyzer {
  protected maxIterations: number = 5;
  protected minConfidence: number = 70;
  protected circuitBreaker: CircuitBreaker;
  protected exaResearcher: ExaResearcher;

  constructor() {
    this.circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s recovery
    this.exaResearcher = new ExaResearcher();
  }

  abstract analyze(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext
  ): Promise<AnalysisResult>;

  protected async iterativeAnalysis(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext,
    initialPrompt: string,
    schema: any
  ): Promise<AnalysisResult> {
    let findings: any = {};
    let confidence = 0;
    let iteration = 0;

    while (iteration < this.maxIterations && confidence < this.minConfidence) {
      const prompt =
        iteration === 0
          ? initialPrompt
          : this.generateFollowUpPrompt(findings, context, iteration);

      try {
        const response = await this.callAI(prompt, schema, context);
        findings = this.mergeFindings(findings, response.findings);
        confidence = this.calculateConfidence(findings, iteration);

        iteration++;

        // Store intermediate results for debugging
        await this.storeIterationResult(
          sessionId,
          phase.id,
          iteration,
          findings,
          confidence
        );

        // Break early if we have high confidence
        if (confidence >= 90) {
          break;
        }
      } catch (error) {
        console.error(`Analysis iteration ${iteration} failed:`, error);

        // If we have some findings, continue with reduced confidence
        if (Object.keys(findings).length > 0) {
          confidence = Math.max(confidence - 10, 30); // Reduce confidence due to error
          break;
        }

        // If no findings yet, try one more time
        if (iteration === 0) {
          iteration++;
          continue;
        }

        throw error;
      }
    }

    return {
      findings,
      confidence: Math.min(confidence, 100),
      iterations: iteration,
    };
  }

  protected abstract generateFollowUpPrompt(
    currentFindings: any,
    context: ResearchContext,
    iteration: number
  ): string;

  protected abstract calculateConfidence(
    findings: any,
    iteration: number
  ): number;

  protected abstract mergeFindings(existing: any, newFindings: any): any;

  private async callAI(
    prompt: string,
    schema: any,
    context: ResearchContext
  ): Promise<any> {
    return this.circuitBreaker.execute(async () => {
      const maxRetries = 3;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          return await this.makeAIRequest(prompt, schema, context);
        } catch (error: any) {
          attempt++;

          // Don't retry on certain errors
          if (error?.message?.includes("rate limit") || error?.status === 429) {
            await this.delay(Math.pow(2, attempt) * 2000); // Longer delay for rate limits
          } else if (attempt >= maxRetries) {
            throw error;
          } else {
            await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
          }
        }
      }

      throw new Error("Max retries exceeded");
    });
  }

  private async makeAIRequest(
    prompt: string,
    schema: any,
    context: ResearchContext
  ): Promise<any> {
    const fullPrompt = this.buildFullPrompt(prompt, context);
    const optimizedPrompt = PromptOptimizer.optimizePrompt(fullPrompt, {
      model: "gemini-2.0-flash-thinking-exp",
    });

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-thinking-exp"),
      prompt: optimizedPrompt,
      schema,
      temperature: 0.7,
    });

    return { findings: object };
  }

  private buildFullPrompt(prompt: string, context: ResearchContext): string {
    return `
You are an expert business analyst conducting research for a SaaS idea validation.

CONTEXT:
- Idea Name: ${context.ideaName}
- Description: ${context.ideaDescription}
- Industry: ${context.industry}
- Target Audience: ${context.targetAudience || "Not specified"}
- Problem Solved: ${context.problemSolved || "Not specified"}
- Solution Offered: ${context.solutionOffered || "Not specified"}

INSTRUCTIONS:
${prompt}

IMPORTANT GUIDELINES:
- Provide specific, actionable insights
- Include confidence levels for your assessments
- Cite sources when possible (use realistic but hypothetical sources if needed)
- Focus on practical business implications
- Be thorough but concise
- Consider current market conditions and trends
`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async storeIterationResult(
    sessionId: string,
    phaseId: string,
    iteration: number,
    findings: any,
    confidence: number
  ): Promise<void> {
    try {
      // This would typically store in Redis for debugging
      // For now, just log for development
      console.log(`Iteration ${iteration} for ${phaseId}:`, {
        confidence,
        findingsKeys: Object.keys(findings),
      });
    } catch (error) {
      // Don't throw here as this is for debugging purposes
      console.error("Failed to store iteration result:", error);
    }
  }

  protected getBaseConfidence(findings: any, iteration: number): number {
    // Base confidence calculation
    let confidence = 50; // Start with 50%

    // Increase confidence based on completeness
    const findingKeys = Object.keys(findings);
    const completenessBonus = Math.min(findingKeys.length * 5, 30);
    confidence += completenessBonus;

    // Increase confidence with iterations (diminishing returns)
    const iterationBonus = Math.min(iteration * 8, 20);
    confidence += iterationBonus;

    return Math.min(confidence, 100);
  }

  protected hasRequiredFields(
    findings: any,
    requiredFields: string[]
  ): boolean {
    return requiredFields.every(
      (field) =>
        findings[field] &&
        (typeof findings[field] === "string"
          ? findings[field].trim()
          : findings[field])
    );
  }

  // New method for conducting research-based analysis
  protected async conductResearchAnalysis(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext,
    researchTopic: string,
    searchQueries: string[],
    analysisSchema: any
  ): Promise<AnalysisResult> {
    console.log(`🔬 Starting research analysis for: ${researchTopic}`);

    try {
      // Step 1: Conduct web research using Exa
      const researchFindings = await this.exaResearcher.conductResearch(
        researchTopic,
        context,
        searchQueries
      );

      // Step 2: Use AI to analyze research findings and generate structured output
      const analysisPrompt = this.buildResearchAnalysisPrompt(
        researchTopic,
        context,
        researchFindings
      );

      const { object } = await generateObject({
        model: google("gemini-2.0-flash"),
        prompt: analysisPrompt,
        schema: analysisSchema,
        temperature: 0.7,
      });

      // Step 3: Enhance findings with research metadata
      const enhancedFindings = {
        ...object,
        researchMetadata: {
          sources: researchFindings.sources,
          methodology: researchFindings.methodology,
          researchConfidence: researchFindings.confidence,
        },
      };

      // Calculate final confidence based on research quality and analysis completeness
      const finalConfidence = this.calculateResearchConfidence(
        enhancedFindings,
        researchFindings
      );

      console.log(
        `✅ Research analysis completed: ${finalConfidence}% confidence`
      );

      return {
        findings: enhancedFindings,
        confidence: finalConfidence,
        iterations: 1, // Research-based analysis is typically single-pass
      };
    } catch (error) {
      console.error(`Research analysis failed for ${researchTopic}:`, error);

      // Fallback to traditional analysis if research fails
      console.log("🔄 Falling back to traditional analysis...");
      return this.iterativeAnalysis(
        sessionId,
        phase,
        context,
        this.buildFallbackPrompt(researchTopic, context),
        analysisSchema
      );
    }
  }

  private buildResearchAnalysisPrompt(
    topic: string,
    context: ResearchContext,
    research: ResearchFindings
  ): string {
    return `
You are a professional business analyst. Based on the comprehensive research data provided, analyze the following topic for the given business idea.

ANALYSIS TOPIC: ${topic}

BUSINESS CONTEXT:
- Idea: ${context.ideaName}
- Description: ${context.ideaDescription}
- Industry: ${context.industry}
- Target Audience: ${context.targetAudience || "Not specified"}

RESEARCH FINDINGS:
Overview: ${research.overview}

Key Research Findings:
${research.keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join("\n")}

Research Methodology: ${research.methodology}
Research Confidence: ${research.confidence}%

INSTRUCTIONS:
Using the research data above, provide a structured analysis that directly addresses the business implications for this SaaS idea. Focus on:
- Market opportunities and threats
- Competitive positioning
- Customer validation insights
- Business model implications
- Risk factors and mitigation strategies

Be specific and actionable. Reference the research findings to support your analysis.
    `;
  }

  private buildFallbackPrompt(topic: string, context: ResearchContext): string {
    return `
Analyze the following topic for the given SaaS business idea: ${topic}

Business Context:
- Idea: ${context.ideaName}
- Description: ${context.ideaDescription}
- Industry: ${context.industry}

Provide a comprehensive analysis based on your knowledge of current market trends and business best practices.
    `;
  }

  private calculateResearchConfidence(
    findings: any,
    research: ResearchFindings
  ): number {
    let confidence = research.confidence; // Start with research confidence

    // Adjust based on analysis completeness
    const analysisKeys = Object.keys(findings).filter(
      (key) => key !== "researchMetadata"
    );
    const completenessBonus = Math.min(analysisKeys.length * 3, 15);
    confidence += completenessBonus;

    // Bonus for having sources
    if (research.sources.length > 3) {
      confidence += 10;
    }

    // Penalty if research confidence is low
    if (research.confidence < 60) {
      confidence -= 15;
    }

    return Math.min(Math.max(confidence, 30), 95); // Clamp between 30-95%
  }

  // Abstract method for defining search queries - each analyzer should implement this
  protected abstract getSearchQueries(context: ResearchContext): string[];
}
