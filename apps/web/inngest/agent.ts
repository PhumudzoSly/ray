import { inngestClient } from "@/lib/inngest";
import {
  MarketResearchSchema,
  prisma,
  ResearchTypeType,
} from "@workspace/backend";
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
import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const finalizer = async (input: string) => {
  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    prompt: `Take the final results found after validating the SaaS idea and return that 
    in a super clean Markdown with tables, sections, emojis, etc... Just super presentable
    
    ***IMPORTANT***
    : 
    - Do not include any other text in the response, just the Markdown
    - Do not include any other text in the response, just the Markdown
    - Do not include any other text in the response, just the Markdown
    - Do not try to summarize the content, you can add more to it but no lies and nothing out of context
    - Do not try to summarize the content, you can add more to it but no lies and nothing out of context
    - Do not try to summarize the content, you can add more to it but no lies and nothing out of context

    VALIDATION RESULTS: ${input}

  
    `,
  });

  return text;
};

const rater = async (input: string) => {
  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: z.object({
      score: z.number({
        description:
          "How much do you rate the research and findings out of 100?",
      }),
      confidenceLevel: z
        .enum(["LOW", "MEDIUM", "HIGH"])
        .describe("How confident are you in the score? LOW, MEDIUM, HIGH"),
    }),
    prompt: `Rate the research and findings out of 100, based on the following results:

    RESEARCH: ${input}
    `,
  });
  return object;
};

// Create the Inngest function
export const saasValidator = inngestClient.createFunction(
  { id: "simple-agent-workflow" },
  { event: "simple-agent/run" },
  async ({ step, event, publish }) => {
    const { type, ideaId, researchId } = event.data;

    const idea = await step.run("fetch-idea", async () => {
      const foundIdea = await prisma.idea.findUnique({
        where: { id: ideaId },
      });
      if (!foundIdea) throw new Error("Idea not found");
      return foundIdea;
    });

    switch (type as ResearchTypeType) {
      case "COMPLETE":
        return await step.run("complete-validation", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await fullValidator(ideaId);
          });

          const finalResults = await step.run("finalize", async () => {
            return await finalizer(data);
          });

          await step.sleep("rate-break", "2 mins");

          const rating = await step.run("rate-research", async () => {
            return await rater(data);
          });

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "MARKET_OPPORTUNITY":
        return await step.run("market-analysis", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await marketAnalyzer(ideaId);
          });

          const finalResults = await step.run("finalize", async () => {
            return await finalizer(data);
          });

          await step.sleep("rate-break", "2 mins");

          const rating = await step.run("rate-research", async () => {
            return await rater(data);
          });

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "COMPETITIVE_ANALYSIS":
        return await step.run("competitive-analysis", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await competitiveAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "CUSTOMER_VALIDATION":
        return await step.run("customer-validation", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await customerAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "BUSINESS_MODEL":
        return await step.run("business-model-analysis", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await businessModelAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "FINANCIAL_PROJECTIONS":
        return await step.run("financial-projections", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await financeAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "GO_TO_MARKET":
        return await step.run("go-to-market-analysis", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await goToMarketAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "INVESTMENT_RECOMMENDATION":
        return await step.run("investment-analysis", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await investmentAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "PRODUCT_MARKET_FIT":
        return await step.run("market-fit-analysis", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await marketFitAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "RISK_ANALYSIS":
        return await step.run("risk-analysis", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await riskAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      case "TECHNICAL_FEASIBILITY":
        return await step.run("tech-analysis", async () => {
          await step.sleep("validate", "10 mins");

          const data = await step.run("validate", async () => {
            return await techAnalyzer(ideaId);
          });

          const [finalResults, rating] = await Promise.all([
            finalizer(data),
            step.run("rate-research", () => rater(data)),
          ]);

          await step.sleep("rest", "3 mins");

          await Promise.all([
            prisma.marketResearch.update({
              where: { id: researchId },
              data: {
                completed: true,
                confidenceLevel: rating.confidenceLevel,
                validationScore: rating.score,
              },
            }),
            prisma.researchResults.create({
              data: {
                researchId,
                content: finalResults,
                organizationId: idea.organizationId,
              },
            }),
          ]);

          return { success: true };
        });

      default:
        throw new Error(`Unsupported research type: ${type}`);
    }
  }
);
