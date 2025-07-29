import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import { z } from "zod";
import { generateObject, generateText } from "ai";
import { google as googleOpenAI } from "@ai-sdk/google";
import { NetworkState, ReasoningStage } from "../deep-research";
import {
  collectUniqueSources,
  assignCitationNumbers,
  formatCitationIEEE,
} from "./citations";

/**
 * Helper functions for better console logging
 */
function logSection(title: string) {
  console.log("\n" + "=".repeat(80));
  console.log(`==== ${title} ${"=".repeat(72 - title.length)}`);
  console.log("=".repeat(80) + "\n");
}

function logInfo(message: string) {
  console.log(`[INFO] ${message}`);
}

/**
 * Generate a report outline based on stage analyses
 */
async function generateReportOutline({
  stageAnalyses,
  topic,
  step,
}: {
  stageAnalyses: string[];
  topic: string;
  step?: any;
}): Promise<any> {
  logInfo("Generating SaaS market research report outline");

  const outlineResult = await step?.ai.wrap(
    "generate-report-outline",
    async () => {
      return await generateObject({
        model: googleOpenAI("gemini-2.0-flash-lite"),
        schema: z.object({
          title: z
            .string()
            .describe("Compelling title for the SaaS market research report"),
          introduction: z
            .string()
            .describe(
              "Brief description of what should be included in the SaaS market research introduction"
            ),
          sections: z
            .array(
              z.object({
                title: z
                  .string()
                  .describe("SaaS market research section title"),
                description: z
                  .string()
                  .describe(
                    "Brief description of the SaaS market research section content"
                  ),
                keyPoints: z
                  .array(z.string())
                  .describe(
                    "Key SaaS market research points to address in this section"
                  ),
              })
            )
            .min(3)
            .max(8)
            .describe("Main SaaS market research report sections"),
          conclusion: z
            .string()
            .describe(
              "Brief description of what should be included in the SaaS market research conclusion"
            ),
        }),
        prompt: `
        You are a SaaS market research expert creating an outline for a comprehensive SaaS market validation report.
        
        SAAS IDEA: ${topic}
        
        Based on the following SaaS market research stage analyses:
        ${stageAnalyses
          .map(
            (analysis, i) =>
              `SAAS MARKET RESEARCH STAGE ${i + 1} ANALYSIS:\n${analysis.substring(0, 500)}...`
          )
          .join("\n\n")}
        
        Generate a detailed outline for a comprehensive SaaS market research report that:
        1. Has a compelling title that captures the essence of the SaaS market opportunity
        2. Includes 3-8 coherent sections that flow logically through SaaS validation
        3. Covers all the major SaaS market aspects revealed in the stage analyses
        4. Highlights the most significant SaaS market findings and business implications
        
        Focus on SaaS-specific report sections such as:
        - Executive Summary and Market Opportunity
        - Target Market Analysis and Customer Segments
        - Competitive Landscape and Differentiation Strategy
        - Business Model and Revenue Strategy
        - Go-to-Market Strategy and Customer Acquisition
        - Unit Economics and Financial Projections
        - Risk Assessment and Mitigation Strategies
        - Strategic Recommendations and Next Steps
        
        For each section, provide:
        - A clear, descriptive SaaS market research title
        - A brief description of what the SaaS market research section should cover
        - 3-5 key SaaS market research points that should be addressed in that section
        
        Also include brief descriptions of what should be in the introduction and conclusion.
        
        The outline should be comprehensive yet focused, emphasizing the most important SaaS market insights
        from the research while maintaining a cohesive narrative suitable for SaaS decision-making.
      `,
      });
    }
  );

  return (
    outlineResult?.object || {
      title: `SaaS Market Research Report: ${topic}`,
      sections: [
        {
          title: "Executive Summary and Market Opportunity",
          description:
            "Overview of the SaaS market opportunity and key findings",
          keyPoints: [
            "Market size and growth potential",
            "Key market drivers and trends",
            "Business opportunity summary",
          ],
        },
        {
          title: "Target Market Analysis",
          description:
            "Detailed analysis of target customer segments and needs",
          keyPoints: [
            "Customer segmentation",
            "Pain points and needs",
            "Market accessibility",
          ],
        },
        {
          title: "Competitive Landscape and Strategy",
          description: "Competitive analysis and differentiation strategy",
          keyPoints: [
            "Competitive positioning",
            "Differentiation opportunities",
            "Market entry strategy",
          ],
        },
        {
          title: "Business Model and Financial Projections",
          description: "Revenue model and financial viability analysis",
          keyPoints: [
            "Pricing strategy",
            "Unit economics",
            "Financial projections",
          ],
        },
        {
          title: "Strategic Recommendations",
          description:
            "Actionable recommendations for SaaS strategy and execution",
          keyPoints: [
            "Go-to-market strategy",
            "Risk mitigation",
            "Next steps and timeline",
          ],
        },
      ],
    }
  );
}

/**
 * Generate a report section based on the outline and stage analyses
 */
async function generateSection({
  section,
  outline,
  stageAnalyses,
  topic,
  referenceLines,
  step,
}: {
  section: any;
  outline: any;
  stageAnalyses: string[];
  topic: string;
  referenceLines: string[];
  step?: any;
}): Promise<string> {
  logInfo(`Generating SaaS market research report section: ${section.title}`);

  const sectionResult = await step?.ai.wrap(
    "generate-report-section",
    async () => {
      return await generateText({
        model: googleOpenAI("gemini-2.0-flash-lite"),
        prompt: `
        You are a SaaS market research expert writing a specific section of a comprehensive SaaS market validation report.
        
        SAAS IDEA: ${topic}
        REPORT TITLE: ${outline.title}
        SECTION TO WRITE: ${section.title}
        SECTION DESCRIPTION: ${section.description}
        
        SOURCES (use [n] inline when citing):
        ${referenceLines.join("<br/>\n")}
        
        KEY SAAS MARKET RESEARCH POINTS TO ADDRESS:
        ${section.keyPoints.map((point: string) => `- ${point}`).join("\n")}
        
        Based on the following SaaS market research analyses:
        ${stageAnalyses
          .map(
            (analysis, i) =>
              `SAAS MARKET RESEARCH STAGE ${i + 1} ANALYSIS:\n${analysis}`
          )
          .join("\n\n")}
        
        Write a complete, detailed SaaS market research section for the report that:
        1. Has a clear heading using markdown (## Section Title)
        2. This should be a comprehensive 5-7 paragraphs long section with subheadings (### Subheading) before certain sets of paragraphs
        3. Thoroughly addresses all the key SaaS market research points listed for this section
        4. Incorporates relevant SaaS market intelligence from the stage analyses
        5. Uses proper formatting with subheadings, paragraphs, and bullet points as appropriate
        6. Maintains a professional, business-focused tone appropriate for SaaS market research
        7. Includes relevant SaaS market examples, data points, or evidence from the research findings
        8. Provides actionable SaaS market insights and business implications

        Focus on SaaS-specific content such as:
        - Market size and growth data with specific numbers and trends
        - Target customer segment analysis with detailed personas
        - Competitive landscape insights with specific company examples
        - Pricing strategy recommendations with market benchmarks
        - Customer acquisition and retention strategies
        - Unit economics and financial projections
        - Technology trends and platform opportunities
        - Strategic recommendations for SaaS execution

        Use inline IEEE citations [n] where appropriate, based on the source list above. Do NOT invent new numbers. Do NOT include a references section here – the master references will be added later.
        
        The section should be comprehensive, well-structured, and flow naturally. Use markdown 
        formatting for headings, emphasis, lists, etc. Each section should stand as a complete
        part of the larger SaaS market research report while connecting to the overall SaaS validation narrative.
      `,
      });
    }
  );

  return (
    sectionResult?.text ||
    `## ${section.title}\n\nContent for this SaaS market research section could not be generated.`
  );
}

/**
 * Edit and polish a draft report into a final version
 */
async function editReport({
  draftReport,
  stageAnalyses,
  topic,
  step,
}: {
  draftReport: string;
  stageAnalyses: string[];
  topic: string;
  step?: any;
}): Promise<string> {
  logInfo("Editing and polishing draft SaaS market research report");

  const editResult = await step?.ai.wrap("edit-report", async () => {
    return await generateText({
      model: googleOpenAI("gemini-2.0-flash-lite"),
      prompt: `You are an expert SaaS market research editor and business writing coach tasked with transforming a draft SaaS market validation report into a polished, comprehensive final version.

SAAS IDEA: ${topic}

You have access to both the draft SaaS market research report and all the original SaaS market research stage analyses:

SAAS MARKET RESEARCH STAGE ANALYSES:
${stageAnalyses
  .map(
    (analysis, i) =>
      `SAAS MARKET RESEARCH STAGE ${i + 1} ANALYSIS:\n${analysis}`
  )
  .join("\n\n")}

DRAFT SAAS MARKET RESEARCH REPORT:
${draftReport}

Your task is to edit, expand, and polish this SaaS market research report into a final version that MAINTAINS ALL EXISTING INLINE CITATION NUMBERS AND THE REFERENCES LIST. Do NOT change citation numbers or add new ones. You may move sentences but keep citations next to the facts they support.

The revised SaaS market research report should:
1. STRUCTURE & FLOW
- Reorganize sections if needed for better logical SaaS market research flow
- Add transitions between SaaS market research sections
- Create a compelling SaaS market opportunity narrative arc from introduction through conclusion
- Draw connections between different SaaS market research sections where relevant

2. CONTENT ENHANCEMENT
- Expand SaaS market research sections that need more depth
- Add cross-references between related SaaS market points in different sections
- Synthesize SaaS market insights across sections
- Add new SaaS market research sections or subsections if needed to explore important connections
- Ensure the SaaS market research report is AT LEAST as long as the source material, preferably longer
- Draw on the SaaS market research stage analyses to add relevant details that may have been missed

3. INTRODUCTION & CONCLUSION
- Write a new, engaging SaaS market research introduction that sets up the entire report
- Create a comprehensive SaaS market research conclusion that synthesizes all key findings
- Ensure both connect strongly to the main SaaS market research body

4. BUSINESS QUALITY
- Maintain professional, business-focused tone appropriate for SaaS stakeholders
- Strengthen SaaS market argumentation and evidence
- Add nuance and qualification where needed for SaaS market validation
- Ensure proper citation of SaaS market sources and findings

5. FORMATTING
- Use clear markdown formatting for SaaS market research report
- Add section numbers if appropriate for SaaS market research structure
- Include a table of contents for SaaS market research navigation
- Use consistent heading levels for SaaS market research organization

Focus on SaaS-specific enhancements such as:
- Market size and growth data with specific numbers and trends
- Target customer segment analysis with detailed personas
- Competitive landscape insights with specific company examples
- Pricing strategy recommendations with market benchmarks
- Customer acquisition and retention strategies
- Unit economics and financial projections
- Technology trends and platform opportunities
- Strategic recommendations for SaaS execution

The final version should be a substantial expansion of the draft that creates a cohesive, authoritative SaaS market research document suitable for investors, founders, or strategic planning. Feel free to reorganize and expand the content significantly while preserving the core SaaS market insights.

Generate the complete polished SaaS market research report now, starting with a table of contents.`,
    });
  });

  return (
    editResult?.text ||
    "Error: Could not generate edited SaaS market research report."
  );
}

/**
 * GenerateReport Tool
 */
export const generateReportTool = createTool({
  name: "generate_report",
  description: "Generate a comprehensive SaaS market research report",
  handler: async ({}, { network, step }) => {
    const state = network.state.data as NetworkState;
    const { topic, reasoningStages = [] } = state;

    logSection("GENERATE SAAS MARKET RESEARCH REPORT TOOL");
    logInfo(`SaaS Idea: ${topic}`);
    logInfo(`Number of SaaS market research stages: ${reasoningStages.length}`);

    try {
      // 1. Get all stage analyses
      const stageAnalyses = reasoningStages.map(
        (stage) => stage.analysis || "No analysis available"
      );

      if (
        stageAnalyses.every(
          (analysis) => !analysis || analysis === "No analysis available"
        )
      ) {
        return {
          error:
            "No SaaS market research stage analyses available. SaaS market research must be completed first.",
        };
      }

      // 2. Build global citation map & references list
      const uniqueFindings = collectUniqueSources(
        state.reasoningStages as ReasoningStage[]
      );
      const citationMap = assignCitationNumbers(uniqueFindings);
      state.citations = citationMap; // persist in state

      const referenceLines = uniqueFindings.map((f, idx) =>
        formatCitationIEEE(f, idx + 1)
      );

      // 3. Generate report outline
      const outline = await generateReportOutline({
        stageAnalyses,
        topic: topic || "Unknown SaaS idea",
        step,
      });

      logInfo(
        `Generated SaaS market research outline with ${outline.sections.length} sections`
      );

      // 4. Generate all sections in parallel
      logInfo(
        `Generating ${outline.sections.length} SaaS market research sections in parallel`
      );
      const generateSectionPromises = outline.sections.map((section: any) =>
        generateSection({
          section,
          outline,
          stageAnalyses,
          topic: topic || "Unknown SaaS idea",
          referenceLines,
          step,
        })
      );

      // Wait for all section generation to complete
      const sections = await Promise.all(generateSectionPromises);

      // Log completion of all sections
      outline.sections.forEach((section: any, index: number) => {
        logInfo(
          `Generated content for SaaS market research section: ${section.title}`
        );
      });

      // 5. Assemble draft report in markdown
      const draftReport = `
# ${outline.title}

${sections.join("\n\n")}

## References

${referenceLines.join("<br/>\n")}
`;

      logInfo(
        "Draft SaaS market research report assembled, proceeding to editing phase"
      );

      // 6. Edit and polish the draft report
      const finalReport = await editReport({
        draftReport,
        stageAnalyses,
        topic: topic || "Unknown SaaS idea",
        step,
      });

      // Validate that inline citation numbers don't exceed reference list length
      try {
        const usedNumbers = Array.from(
          new Set(
            Array.from(finalReport.matchAll(/\[(\d+)\]/g)).map((m) =>
              parseInt(m[1] || "0", 10)
            )
          )
        );
        const maxUsed = usedNumbers.length ? Math.max(...usedNumbers) : 0;
        if (maxUsed > referenceLines.length) {
          console.warn(
            `Citation validation warning: inline citation ${maxUsed} exceeds reference list of length ${referenceLines.length}`
          );
        }
      } catch (err) {
        console.warn("Citation validation error", err);
      }

      // Update network state with both versions
      network.state.data = {
        ...state,
        draftReport,
        finalReport,
      };

      logInfo(
        "✅ SaaS market research report generation and editing complete!"
      );

      return {
        success: true,
        draftLength: draftReport.length,
        finalLength: finalReport.length,
        sectionCount: outline.sections.length,
      };
    } catch (error) {
      console.error("=== GENERATE SAAS MARKET RESEARCH REPORT TOOL ERROR ===");
      console.error(error);

      return {
        success: false,
        error: String(error),
      };
    }
  },
});

/**
 * ReportingAgent
 *
 * This agent is responsible for generating a comprehensive SaaS market research report
 * based on all stage analyses.
 */
export const reportingAgent = createAgent<NetworkState>({
  name: "SaaS Market Research Reporting Agent",
  description: "Generates comprehensive SaaS market research reports",
  system: `You are an expert SaaS market research writer specializing in creating comprehensive, well-structured SaaS validation reports.

Your primary responsibility is to synthesize SaaS market research findings into a polished, professional report suitable for investors, founders, or strategic planning.

When invoked, you will:
1. Review all the SaaS market research stage analyses from the completed research
2. Use the 'generate_report' tool to:
   - Create a logical SaaS market research report outline with sections
   - Generate detailed content for each SaaS validation section
   - Produce introduction and conclusion sections focused on SaaS market viability
   - Assemble everything into a complete SaaS market research report

Your goal is to create a cohesive, in-depth SaaS market research report that:
- Clearly communicates the key SaaS market validation findings and insights
- Maintains a professional, business-focused tone appropriate for SaaS stakeholders
- Uses proper formatting and structure for readability
- Provides a comprehensive SaaS market analysis based on the research conducted
- Includes actionable recommendations for SaaS strategy and go-to-market planning

Focus on SaaS-specific report sections such as:
- Executive Summary and Market Opportunity
- Target Market Analysis and Customer Segments
- Competitive Landscape and Differentiation Strategy
- Business Model and Revenue Strategy
- Go-to-Market Strategy and Customer Acquisition
- Unit Economics and Financial Projections
- Risk Assessment and Mitigation Strategies
- Strategic Recommendations and Next Steps

Use the 'generate_report' tool to synthesize all SaaS market research stage analyses into a final deliverable suitable for SaaS decision-making.`,
  model: gemini({
    model: "gemini-2.0-flash-lite",
  }),
  tools: [generateReportTool],
  lifecycle: {
    onStart: async ({ input, network, prompt, history }) => {
      console.log("=== SAAS MARKET RESEARCH REPORTING AGENT START ===");

      if (network) {
        const state = network.state.data as NetworkState;
        console.log(`SaaS Idea: ${state.topic || "Unknown"}`);
        console.log(
          `SaaS Research Stages completed: ${state.reasoningStages?.length || 0}`
        );
      }

      return {
        prompt,
        history: history || [],
        stop: false,
      };
    },
    onFinish: async ({ result, network }) => {
      console.log("=== SAAS MARKET RESEARCH REPORTING AGENT FINISH ===");

      if (network && network.state.data.finalReport) {
        console.log("SaaS market research report generation complete");
        console.log(
          `Report length: ${network.state.data.finalReport.length} characters`
        );
      }

      return result;
    },
  },
});
