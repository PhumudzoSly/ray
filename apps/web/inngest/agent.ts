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

export const saasValidator = inngestClient.createFunction(
  { id: "saas-validator" },
  { event: "idea/validate" },
  async ({ step, event, publish }) => {
    const { type, ideaId, researchId } = event.data;

    console.log("🚀 Starting SaaS validation process");
    console.log("📊 Event data:", { type, ideaId, researchId });

    return await step.run("run-validation", async () => {
      console.log("🔍 Step 1: Fetching idea from database");
      const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
      });
      if (!idea) {
        console.error("❌ Idea not found:", ideaId);
        throw new Error("Idea not found");
      }
      console.log("✅ Idea fetched successfully:", {
        id: idea.id,
        name: idea.name,
      });

      console.log("🎯 Step 2: Determining validation type:", type);
      let validationData: string;
      let analyzerName: string;

      if (type === "COMPLETE") {
        console.log("🔄 Running complete validation");
        analyzerName = "fullValidator";
        validationData = await fullValidator(ideaId);
      } else if (type === "MARKET_OPPORTUNITY") {
        console.log("🔄 Running market opportunity analysis");
        analyzerName = "marketAnalyzer";
        validationData = await marketAnalyzer(ideaId);
      } else if (type === "COMPETITIVE_ANALYSIS") {
        console.log("🔄 Running competitive analysis");
        analyzerName = "competitiveAnalyzer";
        validationData = await competitiveAnalyzer(ideaId);
      } else if (type === "CUSTOMER_VALIDATION") {
        console.log("🔄 Running customer validation");
        analyzerName = "customerAnalyzer";
        validationData = await customerAnalyzer(ideaId);
      } else if (type === "BUSINESS_MODEL") {
        console.log("🔄 Running business model analysis");
        analyzerName = "businessModelAnalyzer";
        validationData = await businessModelAnalyzer(ideaId);
      } else if (type === "FINANCIAL_PROJECTIONS") {
        console.log("🔄 Running financial projections");
        analyzerName = "financeAnalyzer";
        validationData = await financeAnalyzer(ideaId);
      } else if (type === "GO_TO_MARKET") {
        console.log("🔄 Running go-to-market analysis");
        analyzerName = "goToMarketAnalyzer";
        validationData = await goToMarketAnalyzer(ideaId);
      } else if (type === "INVESTMENT_RECOMMENDATION") {
        console.log("🔄 Running investment recommendation");
        analyzerName = "investmentAnalyzer";
        validationData = await investmentAnalyzer(ideaId);
      } else if (type === "PRODUCT_MARKET_FIT") {
        console.log("🔄 Running product market fit analysis");
        analyzerName = "marketFitAnalyzer";
        validationData = await marketFitAnalyzer(ideaId);
      } else if (type === "RISK_ANALYSIS") {
        console.log("🔄 Running risk analysis");
        analyzerName = "riskAnalyzer";
        validationData = await riskAnalyzer(ideaId);
      } else if (type === "TECHNICAL_FEASIBILITY") {
        console.log("🔄 Running technical feasibility analysis");
        analyzerName = "techAnalyzer";
        validationData = await techAnalyzer(ideaId);
      } else {
        console.error("❌ Unsupported research type:", type);
        throw new Error(`Unsupported research type: ${type}`);
      }

      console.log("✅ Validation data generated successfully");
      console.log("📝 Validation data length:", validationData.length);
      console.log("🔧 Analyzer used:", analyzerName);

      console.log("🎨 Step 3: Finalizing results with AI formatting");
      const finalResults = await finalizer(validationData);
      console.log("✅ Results finalized successfully");
      console.log("📄 Final results length:", finalResults.length);

      console.log("⭐ Step 4: Rating the research quality");
      const rating = await rater(validationData);
      console.log("✅ Research rated successfully");
      console.log("📊 Rating:", {
        score: rating.score,
        confidenceLevel: rating.confidenceLevel,
      });

      console.log("💾 Step 5: Saving results to database");
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
            marketResearchId: researchId,
            content: finalResults,
            organizationId: idea.organizationId,
          },
        }),
      ]);
      console.log("✅ Database updated successfully");

      const result = { success: true };
      console.log("🎉 Validation process completed successfully");
      console.log("📤 Returning result:", result);

      return result;
    });
  }
);
