import {
  searchService,
  scraperService,
  webResearchService,
} from "@workspace/backend";

// ============================================================================
// SEARCH UTILITIES
// ============================================================================

export const researchUtils = {
  // Basic search that returns links and snippets
  search: async (
    query: string,
    options?: {
      limit?: number;
      country?: string;
      language?: string;
    }
  ) => {
    try {
      const results = await searchService.search(query, {
        limit: Math.min(options?.limit || 10, 20),
        country: options?.country,
        language: options?.language,
      });

      return {
        query,
        totalResults: results.totalResults,
        results: results.results.map((result) => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          source: result.source,
        })),
      };
    } catch (error) {
      throw new Error(
        `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  // Comprehensive search with detailed results
  searchDetailed: async (
    query: string,
    options?: {
      maxResults?: number;
      includeContent?: boolean;
    }
  ) => {
    try {
      const research = await webResearchService.research({
        query,
        maxResults: Math.min(options?.maxResults || 5, 10),
        scrapeTopResults: options?.includeContent
          ? Math.min(options?.maxResults || 5, 3)
          : 0,
      });

      return {
        query,
        searchResults: research.searchResults.results.map((result) => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          source: result.source,
        })),
        scrapedContent: research.scrapedContent || [],
        summary: research.summary,
      };
    } catch (error) {
      throw new Error(
        `Detailed search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  // Multi-query research for comprehensive analysis
  multiQueryResearch: async (
    queries: string[],
    options?: {
      maxResultsPerQuery?: number;
      includeContent?: boolean;
    }
  ) => {
    try {
      const results = await Promise.all(
        queries.map(async (query) => {
          const research = await webResearchService.research({
            query,
            maxResults: Math.min(options?.maxResultsPerQuery || 3, 5),
            scrapeTopResults: options?.includeContent ? 1 : 0,
          });

          return {
            query,
            searchResults: research.searchResults.results.map((result) => ({
              title: result.title,
              url: result.url,
              snippet: result.snippet,
              source: result.source,
            })),
            scrapedContent: research.scrapedContent || [],
            summary: research.summary,
          };
        })
      );

      return {
        queries,
        results,
        totalResults: results.length,
      };
    } catch (error) {
      throw new Error(
        `Multi-query research failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  // Scrape content from specific URLs
  scrapeUrl: async (url: string) => {
    try {
      const content = await scraperService.scrape(url);
      return {
        url,
        title: content.title,
        content: content.content,
        metadata: content.metadata,
        links: content.links,
      };
    } catch (error) {
      throw new Error(
        `URL scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  // Scrape multiple URLs
  scrapeMultipleUrls: async (urls: string[]) => {
    try {
      const results = await Promise.all(
        urls.map(async (url) => {
          try {
            const content = await scraperService.scrape(url);
            return {
              url,
              success: true,
              title: content.title,
              content: content.content,
              metadata: content.metadata,
              links: content.links,
            };
          } catch (error) {
            return {
              url,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        })
      );

      return {
        urls,
        results,
        successfulScrapes: results.filter((r) => r.success).length,
        failedScrapes: results.filter((r) => !r.success).length,
      };
    } catch (error) {
      throw new Error(
        `Multiple URL scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  // Competitor research with comprehensive analysis
  competitorResearch: async (
    competitorName: string,
    options?: {
      includePricing?: boolean;
      includeFeatures?: boolean;
      includeReviews?: boolean;
    }
  ) => {
    try {
      const queries = [
        `${competitorName} company overview`,
        `${competitorName} pricing`,
        `${competitorName} features`,
        `${competitorName} reviews`,
        `${competitorName} funding`,
        `${competitorName} revenue`,
      ];

      const research = await researchUtils.multiQueryResearch(queries, {
        maxResultsPerQuery: 3,
        includeContent: true,
      });

      // Extract specific information from results
      const companyInfo = research.results.find((r) =>
        r.query.includes("overview")
      );
      const pricingInfo = research.results.find((r) =>
        r.query.includes("pricing")
      );
      const featuresInfo = research.results.find((r) =>
        r.query.includes("features")
      );
      const reviewsInfo = research.results.find((r) =>
        r.query.includes("reviews")
      );
      const fundingInfo = research.results.find((r) =>
        r.query.includes("funding")
      );
      const revenueInfo = research.results.find((r) =>
        r.query.includes("revenue")
      );

      return {
        competitorName,
        companyInfo: companyInfo?.summary || "",
        pricingInfo: pricingInfo?.summary || "",
        featuresInfo: featuresInfo?.summary || "",
        reviewsInfo: reviewsInfo?.summary || "",
        fundingInfo: fundingInfo?.summary || "",
        revenueInfo: revenueInfo?.summary || "",
        allResults: research.results,
        sources: research.results.flatMap((r) =>
          r.searchResults.map((s) => s.url)
        ),
      };
    } catch (error) {
      throw new Error(
        `Competitor research failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  // Trend research for market analysis
  trendResearch: async (
    trendName: string,
    options?: {
      includeMarketSize?: boolean;
      includeGrowthRate?: boolean;
      includeAdoption?: boolean;
    }
  ) => {
    try {
      const queries = [
        `${trendName} market trends`,
        `${trendName} market size`,
        `${trendName} growth rate`,
        `${trendName} adoption rate`,
        `${trendName} industry analysis`,
        `${trendName} future outlook`,
      ];

      const research = await researchUtils.multiQueryResearch(queries, {
        maxResultsPerQuery: 3,
        includeContent: true,
      });

      // Extract specific information from results
      const trendsInfo = research.results.find((r) =>
        r.query.includes("trends")
      );
      const marketSizeInfo = research.results.find((r) =>
        r.query.includes("market size")
      );
      const growthRateInfo = research.results.find((r) =>
        r.query.includes("growth rate")
      );
      const adoptionInfo = research.results.find((r) =>
        r.query.includes("adoption")
      );
      const industryInfo = research.results.find((r) =>
        r.query.includes("industry")
      );
      const outlookInfo = research.results.find((r) =>
        r.query.includes("outlook")
      );

      return {
        trendName,
        trendsInfo: trendsInfo?.summary || "",
        marketSizeInfo: marketSizeInfo?.summary || "",
        growthRateInfo: growthRateInfo?.summary || "",
        adoptionInfo: adoptionInfo?.summary || "",
        industryInfo: industryInfo?.summary || "",
        outlookInfo: outlookInfo?.summary || "",
        allResults: research.results,
        sources: research.results.flatMap((r) =>
          r.searchResults.map((s) => s.url)
        ),
      };
    } catch (error) {
      throw new Error(
        `Trend research failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  // Sentiment analysis of search results
  sentimentAnalysis: async (
    query: string,
    options?: {
      maxResults?: number;
      includeContent?: boolean;
    }
  ) => {
    try {
      const research = await researchUtils.searchDetailed(query, {
        maxResults: options?.maxResults || 5,
        includeContent: options?.includeContent,
      });

      // Analyze sentiment from search results and scraped content
      const allText = [
        ...research.searchResults.map((r) => r.snippet),
        ...(research.scrapedContent || []).map((c) => c.content),
      ].join(" ");

      // Simple sentiment analysis (in a real implementation, you'd use a proper sentiment analysis service)
      const positiveWords = [
        "good",
        "great",
        "excellent",
        "amazing",
        "fantastic",
        "love",
        "best",
        "top",
        "leading",
        "successful",
      ];
      const negativeWords = [
        "bad",
        "terrible",
        "awful",
        "worst",
        "hate",
        "poor",
        "failing",
        "struggling",
        "declining",
        "problem",
      ];

      const words = allText.toLowerCase().split(/\s+/);
      const positiveCount = words.filter((word) =>
        positiveWords.includes(word)
      ).length;
      const negativeCount = words.filter((word) =>
        negativeWords.includes(word)
      ).length;

      let sentiment = "neutral";
      if (positiveCount > negativeCount) sentiment = "positive";
      else if (negativeCount > positiveCount) sentiment = "negative";

      return {
        query,
        sentiment,
        positiveScore: positiveCount,
        negativeScore: negativeCount,
        confidence:
          Math.abs(positiveCount - negativeCount) /
          Math.max(positiveCount + negativeCount, 1),
        searchResults: research.searchResults,
        scrapedContent: research.scrapedContent,
      };
    } catch (error) {
      throw new Error(
        `Sentiment analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  // General research function
  research: async (
    query: string,
    options?: {
      maxResults?: number;
      includeContent?: boolean;
      includeSentiment?: boolean;
    }
  ) => {
    try {
      const searchResults = await researchUtils.searchDetailed(query, {
        maxResults: options?.maxResults || 5,
        includeContent: options?.includeContent,
      });

      let sentiment = null;
      if (options?.includeSentiment) {
        sentiment = await researchUtils.sentimentAnalysis(query, {
          maxResults: options?.maxResults || 5,
          includeContent: options?.includeContent,
        });
      }

      return {
        query,
        searchResults,
        sentiment,
        summary: searchResults.summary,
        sources: searchResults.searchResults.map((r) => r.url),
      };
    } catch (error) {
      throw new Error(
        `Research failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
};
