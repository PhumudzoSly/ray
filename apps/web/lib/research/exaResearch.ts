import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { exa, webSearch, deepSearch } from "@/lib/exa";
import type { ResearchContext } from "@/types/research";

export interface ResearchFindings {
  overview: string;
  keyFindings: string[];
  sources: string[];
  confidence: number;
  methodology: string;
}

export class ExaResearcher {
  private model = google("gemini-2.0-flash");

  async conductResearch(
    topic: string,
    context: ResearchContext,
    searchQueries: string[]
  ): Promise<ResearchFindings> {
    console.log(`🔍 Starting research on: ${topic}`);

    // Step 1: Gather web search results for each query
    const searchResults = await Promise.all(
      searchQueries.map(async (query) => {
        try {
          const results = await exa.searchAndContents(query, {
            livecrawl: "always",
            numResults: 3,
            text: true,
          });

          return {
            query,
            results: results.results.map((r) => ({
              title: r.title,
              url: r.url,
              content: r.text?.slice(0, 1500) || "",
              publishedDate: r.publishedDate,
            })),
          };
        } catch (error) {
          console.error(`Search failed for query: ${query}`, error);
          return { query, results: [] };
        }
      })
    );

    // Step 2: Compile all search data
    const allSearchData = searchResults
      .flatMap((sr) => sr.results)
      .filter((r) => r.content.length > 100); // Filter out low-quality results

    // Step 3: Use AI to analyze and synthesize findings
    const analysisPrompt = this.buildAnalysisPrompt(
      topic,
      context,
      allSearchData
    );

    const { text } = await generateText({
      model: this.model,
      prompt: analysisPrompt,
    });

    // Step 4: Parse and structure the findings
    const findings = this.parseFindings(text, allSearchData);

    console.log(
      `✅ Research completed for: ${topic} (${findings.confidence}% confidence)`
    );

    return findings;
  }

  private buildAnalysisPrompt(
    topic: string,
    context: ResearchContext,
    searchData: any[]
  ): string {
    const contextInfo = `
Business Idea: ${context.ideaName}
Description: ${context.ideaDescription}
Industry: ${context.industry}
Target Audience: ${context.targetAudience || "Not specified"}
Problem Solved: ${context.problemSolved || "Not specified"}
Solution Offered: ${context.solutionOffered || "Not specified"}
    `.trim();

    const searchContent = searchData
      .map(
        (item, index) => `
Source ${index + 1}: ${item.title}
URL: ${item.url}
Content: ${item.content}
Published: ${item.publishedDate || "Unknown"}
---
      `
      )
      .join("\n");

    return `
You are a professional business research analyst. Analyze the following research topic in the context of the given business idea.

RESEARCH TOPIC: ${topic}

BUSINESS CONTEXT:
${contextInfo}

RESEARCH DATA:
${searchContent}

Please provide a comprehensive analysis in the following format:

OVERVIEW:
[2-3 paragraph overview of your findings]

KEY FINDINGS:
- [Finding 1 with specific data/evidence]
- [Finding 2 with specific data/evidence]
- [Finding 3 with specific data/evidence]
- [Finding 4 with specific data/evidence]
- [Finding 5 with specific data/evidence]

METHODOLOGY:
[Brief description of how you analyzed the data]

CONFIDENCE LEVEL:
[Rate your confidence in these findings from 1-100 based on data quality and completeness]

Focus on actionable insights that would help validate or invalidate the business idea. Include specific numbers, trends, and market data where available.
    `;
  }

  private parseFindings(
    analysisText: string,
    searchData: any[]
  ): ResearchFindings {
    // Extract sections using regex patterns
    const overviewMatch = analysisText.match(
      /OVERVIEW:\s*([\s\S]*?)(?=KEY FINDINGS:|$)/i
    );
    const findingsMatch = analysisText.match(
      /KEY FINDINGS:\s*([\s\S]*?)(?=METHODOLOGY:|$)/i
    );
    const methodologyMatch = analysisText.match(
      /METHODOLOGY:\s*([\s\S]*?)(?=CONFIDENCE LEVEL:|$)/i
    );
    const confidenceMatch = analysisText.match(/CONFIDENCE LEVEL:\s*(\d+)/i);

    // Parse key findings into array
    const findingsText = findingsMatch?.[1] || "";
    const keyFindings = findingsText
      .split(/[-•]\s*/)
      .filter((f) => f.trim().length > 10)
      .map((f) => f.trim())
      .slice(0, 8); // Limit to 8 findings

    // Extract unique sources
    const sources = Array.from(
      new Set(searchData.map((item) => item.url).filter(Boolean))
    ).slice(0, 10); // Limit to 10 sources

    return {
      overview:
        overviewMatch?.[1]?.trim() ||
        "Analysis completed but overview not found.",
      keyFindings:
        keyFindings.length > 0
          ? keyFindings
          : ["No specific findings extracted."],
      sources,
      confidence: confidenceMatch?.[1] ? parseInt(confidenceMatch[1]) : 70,
      methodology:
        methodologyMatch?.[1]?.trim() || "Web search and AI analysis",
    };
  }

  // Helper method for quick searches without deep analysis
  async quickSearch(query: string, numResults: number = 5): Promise<any[]> {
    try {
      const results = await exa.searchAndContents(query, {
        livecrawl: "always",
        numResults,
        text: true,
      });

      return results.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.text?.slice(0, 800) || "",
        publishedDate: r.publishedDate,
      }));
    } catch (error) {
      console.error(`Quick search failed for: ${query}`, error);
      return [];
    }
  }
}
