import { inngestClient } from "@/lib/inngest";
import { google } from "@ai-sdk/google";
import {
  prisma,
  ResearchDepthType,
  ResearchPhaseTypeType,
} from "@workspace/backend";
import {
  generateObject,
  generateText,
  hasToolCall,
  stepCountIs,
  tool,
} from "ai";
import { deepSearch, generateQuestions, webSearch } from "@/lib/exa";
import {
  businessModelAnalyzer,
  competitiveAnalyzer,
  customerAnalyzer,
  financeAnalyzer,
  fullValidator,
  goToMarketAnalyzer,
  investmentAnalyzer,
  marketAnalyzer,
  marketFitAnalyzer,
  riskAnalyzer,
  techAnalyzer,
} from "./validator/agent";
import { z } from "zod/v4";

// Helper function to generate random confidence between 65-95
function generateRandomConfidence(): number {
  return Math.floor(Math.random() * (95 - 65 + 1)) + 65;
}

// Main deep research function
export const deepResearchAgent = inngestClient.createFunction(
  {
    id: "deep-research-agent",
    name: "Deep Research SaaS Validation Agent",
    concurrency: {
      limit: 10, // Allow up to 10 concurrent research sessions
    },
  },
  { event: "deep-research/start" },
  async ({ step, event }) => {
    const { ideaId, researchId, prompt, depth, type } = event.data as {
      ideaId: string;
      type: ResearchPhaseTypeType;
      depth: ResearchDepthType;
      prompt?: string;
      researchId: string;
    };

    const validatorTool = tool({
      name: "idea-validator",
      parameters: z.object({
        prompt: z.string(),
      }),
      description:
        "Validate the SaaS idea and find all the information you need.",
      //  @ts-ignore
      execute: async () => {
        if (
          type === "COMPLETE" &&
          (depth === "EXHAUSTIVE" || depth === "DEEP")
        ) {
          const [
            businessData,
            competitiveData,
            marketData,
            customerData,
            financeData,
            goToMarketData,
            investmentData,
            marketFitData,
            riskData,
            techData,
          ] = await Promise.all([
            businessModelAnalyzer(ideaId),
            competitiveAnalyzer(ideaId),
            marketAnalyzer(ideaId),
            customerAnalyzer(ideaId),
            financeAnalyzer(ideaId),
            goToMarketAnalyzer(ideaId),
            investmentAnalyzer(ideaId),
            marketFitAnalyzer(ideaId),
            riskAnalyzer(ideaId),
            techAnalyzer(ideaId),
          ]);

          // Save results for all phases with confidence scores
          await Promise.all([
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "BUSINESS_MODEL",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "COMPETITIVE_ANALYSIS",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "MARKET_SCAN",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "CUSTOMER_VALIDATION",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "FINANCIAL_PROJECTIONS",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "GO_TO_MARKET",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "INVESTMENT_RECOMMENDATION",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "PRODUCT_MARKET_FIT",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "RISK_ANALYSIS",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
            prisma.researchPhaseResult.create({
              data: {
                phaseName: "TECHNICAL_FEASIBILITY",
                status: "COMPLETED",
                sessionId: researchId,
                confidence: generateRandomConfidence(),
              },
            }),
          ]);

          const finalData = `The outcome of the Complete validation is as follows:

                            BUSINESS MODEL ANALYSIS: ${businessData}

                            COMPETITIVE ANALYSIS: ${competitiveData}

                            MARKET OPPORTUNITY ANALYSIS: ${marketData}

                            CUSTOMER VALIDATION: ${customerData}

                            FINANCIAL PROJECTIONS: ${financeData}

                            GO-TO-MARKET STRATEGY: ${goToMarketData}

                            INVESTMENT RECOMMENDATIONS: ${investmentData}

                            PRODUCT-MARKET FIT: ${marketFitData}

                            RISK ANALYSIS: ${riskData}

                            TECHNICAL FEASIBILITY: ${techData}

                            This comprehensive analysis provides a complete 360-degree view of the SaaS idea validation across all critical business dimensions.`;

          return finalData;
        }

        if (type === "COMPLETE" && depth !== "EXHAUSTIVE" && depth !== "DEEP") {
          const data = await fullValidator(ideaId);

          // Save result for complete validation
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "COMPLETE",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }

        if (type === "BUSINESS_MODEL") {
          const data = await businessModelAnalyzer(ideaId);

          // Save result for business model analysis
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "BUSINESS_MODEL",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "COMPETITIVE_ANALYSIS") {
          const data = await competitiveAnalyzer(ideaId);

          // Save result for competitive analysis
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "COMPETITIVE_ANALYSIS",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "CUSTOMER_VALIDATION") {
          const data = await customerAnalyzer(ideaId);

          // Save result for customer validation
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "CUSTOMER_VALIDATION",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "FINANCIAL_PROJECTIONS") {
          const data = await financeAnalyzer(ideaId);

          // Save result for financial projections
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "FINANCIAL_PROJECTIONS",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "INVESTMENT_RECOMMENDATION") {
          const data = await investmentAnalyzer(ideaId);

          // Save result for investment recommendation
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "INVESTMENT_RECOMMENDATION",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "GO_TO_MARKET") {
          const data = await goToMarketAnalyzer(ideaId);

          // Save result for go to market strategy
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "GO_TO_MARKET",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "MARKET_SCAN") {
          const data = await marketAnalyzer(ideaId);

          // Save result for market scan
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "MARKET_SCAN",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "PRODUCT_MARKET_FIT") {
          const data = await marketFitAnalyzer(ideaId);

          // Save result for product market fit
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "PRODUCT_MARKET_FIT",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "RISK_ANALYSIS") {
          const data = await riskAnalyzer(ideaId);

          // Save result for risk analysis
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "RISK_ANALYSIS",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }
        if (type === "TECHNICAL_FEASIBILITY") {
          const data = await techAnalyzer(ideaId);

          // Save result for technical feasibility
          await prisma.researchPhaseResult.create({
            data: {
              phaseName: "TECHNICAL_FEASIBILITY",
              status: "COMPLETED",
              sessionId: researchId,
              confidence: generateRandomConfidence(),
            },
          });

          return data;
        }

        return "NO RESEARCH DATA FOUND, DO THE MANUAL RESEARCH";
      },
    });

    await step.sleep("rest", "3 mins");

    const startValidation = await step.run("start-validate", async () => {
      const startedResearch = await prisma.researchSession.update({
        where: { id: researchId },
        data: {
          status: "IN_PROGRESS",
          overallConfidence: 10,
        },
      });

      return startedResearch;
    });

    await step.sleep("rest", "3 mins");

    const validation = await step.run("validate-and-fetch-idea", async () => {
      const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
        include: {
          organization: true,
        },
      });

      if (!idea) {
        throw new Error(`Idea not found: ${ideaId}`);
      }

      const { text } = await generateText({
        model: google("gemini-2.0-flash-lite"),
        stopWhen: [
          stepCountIs(
            depth === "DEEP"
              ? 10
              : depth === "EXHAUSTIVE"
                ? 15
                : depth === "STANDARD"
                  ? 5
                  : 3
          ),
          hasToolCall("idea-validator"),
        ],
        tools: {
          validatorTool,
          deepSearch,
          generateQuestions,
          webSearch,
          ...google.tools.googleSearch,
        },
      });

      return text;
    });

    await step.sleep("rest", "3 mins");

    await step.run("finalize-validation", async () => {
      const idea = prisma.idea.findUnique({ where: { id: ideaId } });

      if (!idea) {
        throw new Error("Idea now found");
      }
      const { object: findings } = await generateObject({
        model: google("gemini-2.0-flash"),
        schema: z.object({
          finding: z.array(
            z.object({
              finding: z.string(),
              impact: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            })
          ),
          rating: z.number(
            "What's the total rating based on the quality of the data received"
          ),
        }),
      });

      const finalData = findings.finding.map((f) => {
        return {
          sessionId: researchId,
          findings: f.finding,
          impact: f.impact,
        };
      });

      const data = await prisma.researchFindings.createMany({
        data: finalData,
      });

      const completeResearch = await prisma.researchSession.update({
        where: { id: researchId },
        data: {
          finalContent: validation,
          status: "COMPLETED",
          overallConfidence: findings.rating,
        },
      });

      return completeResearch;
    });
  }
);
