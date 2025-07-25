import { tool } from "ai";
import { z } from "zod";
import {
  searchService,
  scraperService,
  webResearchService,
} from "../../src/services";

// ============================================================================
// SEARCH TOOLS
// ============================================================================

const searchTools = {
  // Basic search tool that returns links and snippets
  search: tool({
    description:
      "Search the web for information and return relevant links and snippets",
    parameters: z.object({
      query: z.string().describe("The search query to look up"),
      limit: z
        .number()
        .optional()
        .describe("Number of results to return (default: 10, max: 20)"),
      country: z
        .string()
        .optional()
        .describe('Country code for localized results (e.g., "us", "uk")'),
      language: z
        .string()
        .optional()
        .describe('Language code for results (e.g., "en", "es")'),
    }),
    execute: async ({ query, limit = 10, country, language }) => {
      try {
        const results = await searchService.search(query, {
          limit: Math.min(limit, 20),
          country,
          language,
        });

        const response = {
          query,
          totalResults: results.totalResults,
          results: results.results.map((result) => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            source: result.source,
          })),
        };

        console.log(
          "[AI Tool - Search] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          query,
        };
        console.log(
          "[AI Tool - Search] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),

  // One-time search with detailed results
  searchDetailed: tool({
    description:
      "Perform a comprehensive search and return detailed information about the top results",
    parameters: z.object({
      query: z.string().describe("The search query to look up"),
      maxResults: z
        .number()
        .optional()
        .describe("Maximum number of results to analyze (default: 5)"),
      includeContent: z
        .boolean()
        .optional()
        .describe("Whether to include scraped content from top results"),
    }),
    execute: async ({ query, maxResults = 5, includeContent = false }) => {
      try {
        const research = await webResearchService.research({
          query,
          maxResults: Math.min(maxResults, 10),
          scrapeTopResults: includeContent ? Math.min(maxResults, 3) : 0,
        });

        const response = {
          query,
          searchResults: research.searchResults.results.map((result) => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            source: result.source,
          })),
          scrapedContent:
            includeContent && research.scrapedContent
              ? research.scrapedContent.map((content) => ({
                  url: content.url,
                  title: content.title,
                  content: content.content
                    ? content.content.substring(0, 1000) +
                      (content.content.length > 1000 ? "..." : "")
                    : "",
                  metadata: content.metadata,
                }))
              : [],
          summary: research.summary,
        };

        console.log(
          "[AI Tool - SearchDetailed] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Detailed search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          query,
        };
        console.log(
          "[AI Tool - SearchDetailed] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),
};

// ============================================================================
// WEB SCRAPING TOOLS
// ============================================================================

const scrapingTools = {
  // Visit URL and extract content
  scrapeUrl: tool({
    description: "Visit a URL and extract its content, metadata, and links",
    parameters: z.object({
      url: z.string().describe("The URL to visit and scrape"),
      extractImages: z
        .boolean()
        .optional()
        .describe("Whether to extract image URLs"),
      extractLinks: z
        .boolean()
        .optional()
        .describe("Whether to extract link URLs"),
      extractMetadata: z
        .boolean()
        .optional()
        .describe("Whether to extract meta tags and structured data"),
    }),
    execute: async ({
      url,
      extractImages = true,
      extractLinks = true,
      extractMetadata = true,
    }) => {
      try {
        const content = await scraperService.scrape(url, {
          extractImages,
          extractLinks,
          extractMetadata,
          timeout: 15000,
        });

        const response = {
          url,
          title: content.title,
          content: content.content
            ? content.content.substring(0, 2000) +
              (content.content.length > 2000 ? "..." : "")
            : "",
          metadata: content.metadata,
          images: extractImages ? content.images?.slice(0, 10) : [],
          links: extractLinks ? content.links?.slice(0, 20) : [],
          wordCount: content.content ? content.content.split(" ").length : 0,
          scrapedAt: new Date().toISOString(),
        };

        console.log(
          "[AI Tool - ScrapeUrl] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Failed to scrape URL: ${error instanceof Error ? error.message : "Unknown error"}`,
          url,
        };
        console.log(
          "[AI Tool - ScrapeUrl] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),

  // Scrape multiple URLs
  scrapeMultipleUrls: tool({
    description: "Visit multiple URLs and extract their content",
    parameters: z.object({
      urls: z.array(z.string()).describe("Array of URLs to scrape"),
    }),
    execute: async ({ urls }) => {
      try {
        const results = await scraperService.scrapeMultiple(urls.slice(0, 10), {
          timeout: 15000,
        });

        const response = {
          totalUrls: urls.length,
          successfulScrapes: results.length,
          results: results.map((content) => ({
            url: content.url,
            title: content.title,
            content: content.content
              ? content.content.substring(0, 500) +
                (content.content.length > 500 ? "..." : "")
              : "",
            wordCount: content.content ? content.content.split(" ").length : 0,
          })),
        };

        console.log(
          "[AI Tool - ScrapeMultipleUrls] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Failed to scrape multiple URLs: ${error instanceof Error ? error.message : "Unknown error"}`,
          totalUrls: urls.length,
        };
        console.log(
          "[AI Tool - ScrapeMultipleUrls] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),
};

// ============================================================================
// RESEARCH TOOLS
// ============================================================================

const researchTools = {
  // Comprehensive research combining search and scraping
  research: tool({
    description:
      "Perform comprehensive research by searching and then scraping top results",
    parameters: z.object({
      query: z.string().describe("The research query to investigate"),
      scrapeTopResults: z
        .number()
        .optional()
        .describe("Number of top search results to scrape (default: 3)"),
      includeSummary: z
        .boolean()
        .optional()
        .describe("Whether to include a research summary"),
    }),
    execute: async ({ query, scrapeTopResults = 3, includeSummary = true }) => {
      try {
        const research = await webResearchService.research(
          {
            query,
            scrapeTopResults: Math.min(scrapeTopResults, 5),
          },
          {
            includeSummary,
            maxConcurrentScrapes: 3,
          }
        );

        const response = {
          query,
          searchResults: research.searchResults.results.map((result) => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
          })),
          scrapedContent: research.scrapedContent
            ? research.scrapedContent.map((content) => ({
                url: content.url,
                title: content.title,
                content: content.content
                  ? content.content.substring(0, 1000) +
                    (content.content.length > 1000 ? "..." : "")
                  : "",
              }))
            : [],
          summary: research.summary,
          totalResults: research.searchResults.totalResults,
        };

        console.log(
          "[AI Tool - Research] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Research failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          query,
        };
        console.log(
          "[AI Tool - Research] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),

  // Competitor research
  competitorResearch: tool({
    description: "Research competitors for a specific company or product",
    parameters: z.object({
      company: z
        .string()
        .describe("The company or product name to research competitors for"),
      includeAnalysis: z
        .boolean()
        .optional()
        .describe("Whether to include competitive analysis"),
    }),
    execute: async ({ company, includeAnalysis = true }) => {
      try {
        const research = await webResearchService.competitorResearch(company);

        const response = {
          company,
          searchResults: research.searchResults.results.map((result) => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
          })),
          scrapedContent: research.scrapedContent
            ? research.scrapedContent.map((content) => ({
                url: content.url,
                title: content.title,
                content: content.content
                  ? content.content.substring(0, 500) +
                    (content.content.length > 500 ? "..." : "")
                  : "",
              }))
            : [],
          summary: research.summary,
          totalResults: research.searchResults.totalResults,
        };

        console.log(
          "[AI Tool - CompetitorResearch] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Competitor research failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          company,
        };
        console.log(
          "[AI Tool - CompetitorResearch] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),

  // Trend research
  trendResearch: tool({
    description:
      "Research trends and developments in a specific topic or industry",
    parameters: z.object({
      topic: z
        .string()
        .describe("The topic or industry to research trends for"),
      timeframe: z
        .enum(["week", "month", "year"])
        .optional()
        .describe("Timeframe for trend analysis"),
    }),
    execute: async ({ topic, timeframe = "month" }) => {
      try {
        const trends = await webResearchService.trendResearch(topic, timeframe);

        const response = {
          topic,
          timeframe,
          searchResults: trends.searchResults.results.map((result) => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
          })),
          scrapedContent: trends.scrapedContent
            ? trends.scrapedContent.map((content) => ({
                url: content.url,
                title: content.title,
                content: content.content
                  ? content.content.substring(0, 500) +
                    (content.content.length > 500 ? "..." : "")
                  : "",
              }))
            : [],
          summary: trends.summary,
          totalResults: trends.searchResults.totalResults,
        };

        console.log(
          "[AI Tool - TrendResearch] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Trend research failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          topic,
          timeframe,
        };
        console.log(
          "[AI Tool - TrendResearch] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),
};

// ============================================================================
// DATA ANALYSIS TOOLS
// ============================================================================

const analysisTools = {
  // Sentiment analysis
  sentimentAnalysis: tool({
    description:
      "Analyze sentiment and public opinion about a topic, company, or product",
    parameters: z.object({
      topic: z
        .string()
        .describe("The topic, company, or product to analyze sentiment for"),
      includeSources: z
        .boolean()
        .optional()
        .describe("Whether to include source URLs"),
    }),
    execute: async ({ topic, includeSources = false }) => {
      try {
        const sentiment = await webResearchService.sentimentResearch(topic);

        const response = {
          topic,
          searchResults: sentiment.searchResults.results.map((result) => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
          })),
          scrapedContent: sentiment.scrapedContent
            ? sentiment.scrapedContent.map((content) => ({
                url: content.url,
                title: content.title,
                content: content.content
                  ? content.content.substring(0, 500) +
                    (content.content.length > 500 ? "..." : "")
                  : "",
              }))
            : [],
          summary: sentiment.summary,
          totalResults: sentiment.searchResults.totalResults,
        };

        console.log(
          "[AI Tool - SentimentAnalysis] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Sentiment analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          topic,
        };
        console.log(
          "[AI Tool - SentimentAnalysis] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),

  // Multi-query research
  multiQueryResearch: tool({
    description:
      "Perform research across multiple related queries and synthesize results",
    parameters: z.object({
      queries: z
        .array(z.string())
        .describe("Array of related research queries"),
    }),
    execute: async ({ queries }) => {
      try {
        const results = await webResearchService.multiQueryResearch(
          queries.slice(0, 5)
        );

        const response = {
          queries,
          results: results.map((result) => ({
            searchResults: result.searchResults.results.map((item) => ({
              title: item.title,
              url: item.url,
              snippet: item.snippet,
            })),
            scrapedContent: result.scrapedContent
              ? result.scrapedContent.map((content) => ({
                  url: content.url,
                  title: content.title,
                  content: content.content
                    ? content.content.substring(0, 500) +
                      (content.content.length > 500 ? "..." : "")
                    : "",
                }))
              : [],
            summary: result.summary,
          })),
        };

        console.log(
          "[AI Tool - MultiQueryResearch] Result:",
          JSON.stringify(response, null, 2)
        );
        return response;
      } catch (error) {
        const errorResponse = {
          error: `Multi-query research failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          queries,
        };
        console.log(
          "[AI Tool - MultiQueryResearch] Error:",
          JSON.stringify(errorResponse, null, 2)
        );
        return errorResponse;
      }
    },
  }),
};

// ============================================================================
// EXPORT ALL TOOLS
// ============================================================================

export const allTools = {
  ...searchTools,
  ...scrapingTools,
  ...researchTools,
  ...analysisTools,
};

// Individual tool exports for specific use cases
export { searchTools, scrapingTools, researchTools, analysisTools };
