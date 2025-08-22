import { prisma } from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";
import {
  createCompetitor,
  editCompetitor,
  getCompetitor,
  getAllCompetitors,
  updateCompetitiveMove,
  getCompetitiveMoves,
  createCompetitorSwot,
  updateCompetitorSwot,
  getCompetitorSwots,
  createCompetitiveMove,
} from "@/actions/idea/competitor";

export const getCompetitors = tool({
  description: "Get all competitors for a specific idea.",
  inputSchema: z.object({
    ideaId: z
      .string()
      .min(1)
      .max(100)
      .describe("The idea ID to get competitors for"),
  }),
  execute: async ({ ideaId }: { ideaId: string }) => {
    const { org } = await getSession();
    const competitors = await getAllCompetitors(ideaId);
    return competitors;
  },
});

export const getCompetitorMoves = tool({
  description: "Get all competitive moves for a specific competitor.",
  inputSchema: z.object({
    competitorId: z
      .string()
      .min(1)
      .max(100)
      .describe("The competitor ID to get competitive moves for"),
  }),
  execute: async ({ competitorId }: { competitorId: string }) => {
    const competitiveMoves = await getCompetitiveMoves(competitorId);
    return competitiveMoves;
  },
});

export const addNewCompetitiveMove = tool({
  description: "Create a new competitive move for a competitor.",
  inputSchema: z.object({
    competitorId: z.string().min(1).max(100).describe("The competitor ID"),
    moveType: z.string().min(1).max(100).describe("Type of competitive move"),
    title: z.string().min(1).max(200).describe("Title of the competitive move"),
    description: z
      .string()
      .min(1)
      .max(1000)
      .describe("Description of the competitive move"),
    impactLevel: z
      .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .describe("Impact level of this move"),
    targetAudience: z
      .string()
      .optional()
      .describe("Target audience for this move"),
    affectedFeatures: z
      .array(z.string())
      .optional()
      .describe("Features affected by this move"),
    announcedDate: z
      .string()
      .optional()
      .describe("Date when the move was announced (ISO string)"),
    launchDate: z
      .string()
      .optional()
      .describe("Date when the move was launched (ISO string)"),
    completionDate: z
      .string()
      .optional()
      .describe("Date when the move was completed (ISO string)"),
    opportunities: z
      .array(z.string())
      .optional()
      .describe("Opportunities this move creates"),
    threats: z.array(z.string()).optional().describe("Threats this move poses"),
    responseRequired: z
      .boolean()
      .optional()
      .describe("Whether a response is required"),
    responseStrategy: z
      .string()
      .optional()
      .describe("Strategy for responding to this move"),
  }),
  execute: async ({
    competitorId,
    moveType,
    title,
    description,
    impactLevel,
    targetAudience,
    affectedFeatures = [],
    announcedDate,
    launchDate,
    completionDate,
    opportunities = [],
    threats = [],
    responseRequired = false,
    responseStrategy,
  }: {
    competitorId: string;
    moveType: string;
    title: string;
    description: string;
    impactLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    targetAudience?: string;
    affectedFeatures?: string[];
    announcedDate?: string;
    launchDate?: string;
    completionDate?: string;
    opportunities?: string[];
    threats?: string[];
    responseRequired?: boolean;
    responseStrategy?: string;
  }) => {
    const moveData: any = {
      competitorId,
      moveType,
      title,
      description,
      impactLevel,
      targetAudience,
      affectedFeatures,
      opportunities,
      threats,
      responseRequired,
      responseStrategy,
    };

    if (announcedDate) moveData.announcedDate = new Date(announcedDate);
    if (launchDate) moveData.launchDate = new Date(launchDate);
    if (completionDate) moveData.completionDate = new Date(completionDate);

    const competitiveMove = await createCompetitiveMove({
      move: moveData,
    });
    return competitiveMove;
  },
});

export const editCompetitiveMove = tool({
  description: "Edit an existing competitive move.",
  inputSchema: z.object({
    moveId: z.string().min(1).max(100).describe("The competitive move ID"),
    moveType: z.string().optional().describe("Type of competitive move"),
    title: z.string().optional().describe("Title of the competitive move"),
    description: z
      .string()
      .optional()
      .describe("Description of the competitive move"),
    impactLevel: z
      .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .optional()
      .describe("Impact level of this move"),
    targetAudience: z
      .string()
      .optional()
      .describe("Target audience for this move"),
    affectedFeatures: z
      .array(z.string())
      .optional()
      .describe("Features affected by this move"),
    announcedDate: z
      .string()
      .optional()
      .describe("Date when the move was announced (ISO string)"),
    launchDate: z
      .string()
      .optional()
      .describe("Date when the move was launched (ISO string)"),
    completionDate: z
      .string()
      .optional()
      .describe("Date when the move was completed (ISO string)"),
    opportunities: z
      .array(z.string())
      .optional()
      .describe("Opportunities this move creates"),
    threats: z.array(z.string()).optional().describe("Threats this move poses"),
    responseRequired: z
      .boolean()
      .optional()
      .describe("Whether a response is required"),
    responseStrategy: z
      .string()
      .optional()
      .describe("Strategy for responding to this move"),
  }),
  execute: async ({
    moveId,
    moveType,
    title,
    description,
    impactLevel,
    targetAudience,
    affectedFeatures,
    announcedDate,
    launchDate,
    completionDate,
    opportunities,
    threats,
    responseRequired,
    responseStrategy,
  }: {
    moveId: string;
    moveType?: string;
    title?: string;
    description?: string;
    impactLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    targetAudience?: string;
    affectedFeatures?: string[];
    announcedDate?: string;
    launchDate?: string;
    completionDate?: string;
    opportunities?: string[];
    threats?: string[];
    responseRequired?: boolean;
    responseStrategy?: string;
  }) => {
    const updateData: any = {};
    if (moveType !== undefined) updateData.moveType = moveType;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (impactLevel !== undefined) updateData.impactLevel = impactLevel;
    if (targetAudience !== undefined)
      updateData.targetAudience = targetAudience;
    if (affectedFeatures !== undefined)
      updateData.affectedFeatures = affectedFeatures;
    if (opportunities !== undefined) updateData.opportunities = opportunities;
    if (threats !== undefined) updateData.threats = threats;
    if (responseRequired !== undefined)
      updateData.responseRequired = responseRequired;
    if (responseStrategy !== undefined)
      updateData.responseStrategy = responseStrategy;

    if (announcedDate !== undefined)
      updateData.announcedDate = announcedDate ? new Date(announcedDate) : null;
    if (launchDate !== undefined)
      updateData.launchDate = launchDate ? new Date(launchDate) : null;
    if (completionDate !== undefined)
      updateData.completionDate = completionDate
        ? new Date(completionDate)
        : null;

    const competitiveMove = await updateCompetitiveMove({
      id: moveId,
      move: updateData,
    });
    return competitiveMove;
  },
});

export const getCompetitorSwotAnalysis = tool({
  description: "Get all SWOT analysis entries for a specific competitor.",
  inputSchema: z.object({
    competitorId: z
      .string()
      .min(1)
      .max(100)
      .describe("The competitor ID to get SWOT analysis for"),
  }),
  execute: async ({ competitorId }: { competitorId: string }) => {
    const swotEntries = await getCompetitorSwots(competitorId);
    return swotEntries;
  },
});

export const createCompetitorSwotEntry = tool({
  description: "Create a new SWOT analysis entry for a competitor.",
  inputSchema: z.object({
    competitorId: z.string().min(1).max(100).describe("The competitor ID"),
    type: z
      .enum(["Strength", "Weakness", "Opportunity", "Threat"])
      .describe("Type of SWOT entry"),
    swotAnalysis: z
      .string()
      .min(1)
      .max(1000)
      .describe("The SWOT analysis content"),
    impact: z
      .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .optional()
      .describe("Impact level of this SWOT entry"),
  }),
  execute: async ({
    competitorId,
    type,
    swotAnalysis,
    impact = "MEDIUM",
  }: {
    competitorId: string;
    type: "Strength" | "Weakness" | "Opportunity" | "Threat";
    swotAnalysis: string;
    impact?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }) => {
    const swotEntry = await createCompetitorSwot({
      swot: {
        competitorId,
        type,
        swotAnalysis,
        impact,
      },
    });
    return swotEntry;
  },
});

export const editCompetitorSwotEntry = tool({
  description: "Edit an existing SWOT analysis entry.",
  inputSchema: z.object({
    swotId: z.string().min(1).max(100).describe("The SWOT entry ID"),
    type: z
      .enum(["Strength", "Weakness", "Opportunity", "Threat"])
      .optional()
      .describe("Type of SWOT entry"),
    swotAnalysis: z
      .string()
      .min(1)
      .max(1000)
      .optional()
      .describe("The SWOT analysis content"),
    impact: z
      .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .optional()
      .describe("Impact level of this SWOT entry"),
  }),
  execute: async ({
    swotId,
    type,
    swotAnalysis,
    impact,
  }: {
    swotId: string;
    type?: "Strength" | "Weakness" | "Opportunity" | "Threat";
    swotAnalysis?: string;
    impact?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }) => {
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (swotAnalysis !== undefined) updateData.swotAnalysis = swotAnalysis;
    if (impact !== undefined) updateData.impact = impact;

    const swotEntry = await updateCompetitorSwot({
      id: swotId,
      swot: updateData,
    });
    return swotEntry;
  },
});

export const createNewCompetitor = tool({
  description: "Create a new competitor for an idea.",
  inputSchema: z.object({
    ideaId: z.string().min(1).max(100).describe("The idea ID"),
    name: z.string().min(1).max(200).describe("The competitor name"),
    website: z.string().optional().describe("The competitor website URL"),
    description: z
      .string()
      .optional()
      .describe("Description of the competitor"),
    threatLevel: z
      .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .describe("Threat level of the competitor"),
    marketShare: z.number().optional().describe("Market share percentage"),
    annualRevenue: z
      .number()
      .optional()
      .describe("Annual revenue in millions USD"),
    employeeCount: z.string().optional().describe("Number of employees"),
    foundedYear: z.number().optional().describe("Year the company was founded"),
    headquarters: z
      .string()
      .optional()
      .describe("Company headquarters location"),
    targetAudience: z
      .string()
      .optional()
      .describe("Target audience description"),
  }),
  execute: async ({
    ideaId,
    name,
    website,
    description,
    threatLevel,
    marketShare,
    annualRevenue,
    employeeCount,
    foundedYear,
    headquarters,
    targetAudience,
  }: {
    ideaId: string;
    name: string;
    website?: string;
    description?: string;
    threatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    marketShare?: number;
    annualRevenue?: number;
    employeeCount?: string;
    foundedYear?: number;
    headquarters?: string;
    targetAudience?: string;
  }) => {
    const competitor = await createCompetitor({
      competitor: {
        ideaId,
        name,
        website,
        description,
        threatLevel,
        marketShare,
        annualRevenue,
        employeeCount,
        foundedYear,
        headquarters,
        targetAudience,
      },
    });
    return competitor;
  },
});

export const getCurrentCompetitor = tool({
  description: "Get a specific competitor by ID.",
  inputSchema: z.object({
    competitorId: z.string().min(1).max(100).describe("The competitor ID"),
  }),
  execute: async ({ competitorId }: { competitorId: string }) => {
    const competitor = await getCompetitor({ id: competitorId });
    if (!competitor) {
      return `Competitor with ID ${competitorId} was not found.`;
    }
    return competitor;
  },
});

export const editCurrentCompetitor = tool({
  description: "Edit an existing competitor.",
  inputSchema: z.object({
    competitorId: z.string().min(1).max(100).describe("The competitor ID"),
    name: z.string().min(1).max(200).optional().describe("The competitor name"),
    website: z.string().optional().describe("The competitor website URL"),
    description: z
      .string()
      .optional()
      .describe("Description of the competitor"),
    threatLevel: z
      .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .optional()
      .describe("Threat level of the competitor"),
    marketShare: z.number().optional().describe("Market share percentage"),
    annualRevenue: z
      .number()
      .optional()
      .describe("Annual revenue in millions USD"),
    employeeCount: z.string().optional().describe("Number of employees"),
    foundedYear: z.number().optional().describe("Year the company was founded"),
    headquarters: z
      .string()
      .optional()
      .describe("Company headquarters location"),
    targetAudience: z
      .string()
      .optional()
      .describe("Target audience description"),
  }),
  execute: async ({
    competitorId,
    name,
    website,
    description,
    threatLevel,
    marketShare,
    annualRevenue,
    employeeCount,
    foundedYear,
    headquarters,
    targetAudience,
  }: {
    competitorId: string;
    name?: string;
    website?: string;
    description?: string;
    threatLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    marketShare?: number;
    annualRevenue?: number;
    employeeCount?: string;
    foundedYear?: number;
    headquarters?: string;
    targetAudience?: string;
  }) => {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.description = description;
    if (threatLevel !== undefined) updateData.threatLevel = threatLevel;
    if (marketShare !== undefined) updateData.marketShare = marketShare;
    if (annualRevenue !== undefined) updateData.annualRevenue = annualRevenue;
    if (employeeCount !== undefined) updateData.employeeCount = employeeCount;
    if (foundedYear !== undefined) updateData.foundedYear = foundedYear;
    if (headquarters !== undefined) updateData.headquarters = headquarters;
    if (targetAudience !== undefined)
      updateData.targetAudience = targetAudience;

    const competitor = await editCompetitor({
      id: competitorId,
      data: updateData,
    });
    return competitor;
  },
});
