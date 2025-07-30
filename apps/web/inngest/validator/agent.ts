import { deepSearch, generateQuestions, webSearch } from "@/lib/exa";
import { google } from "@ai-sdk/google";
import { prisma, PROMPT } from "@workspace/backend";
import { generateText, tool } from "ai";

export const fullValidator = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.SAAS_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const marketAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.MARKET_OPPORTUNITY_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const businessModelAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.BUSINESS_MODEL_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const competitiveAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.COMPETITIVE_ANALYSIS_PROMPT}
    `,
  });

  return text;
};

export const customerAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.CUSTOMER_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const financeAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.FINANCIAL_PROJECTIONS_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const goToMarketAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.GO_TO_MARKET_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const investmentAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.INVESTMENT_RECOMMENDATION_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const marketFitAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.PRODUCT_MARKET_FIT_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const riskAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.RISK_ANALYSIS_VALIDATION_PROMPT}
    `,
  });

  return text;
};

export const techAnalyzer = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id: id,
    },
    include: {
      Competitor: {
        include: {
          competitiveMoves: true,
        },
      },
    },
  });

  if (!idea) throw new Error("Idea not found");

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    tools: {
      webSearch,
      deepSearch,
      generateQuestions,
    },
    prompt: `
    Given the following SaaS idea, I need you to validate the SaaS idea under the following criteria:

    The idea: ${JSON.stringify(idea)}

    PROMPT: ${PROMPT.TECHNICAL_FEASIBILITY_VALIDATION_PROMPT}
    `,
  });

  return text;
};
