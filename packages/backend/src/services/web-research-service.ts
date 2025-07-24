import { searchService, SearchOptions, SearchResponse } from "./search-service";
import {
  scraperService,
  ScrapingOptions,
  ScrapedContent,
} from "./scraper-service";

export interface ResearchQuery {
  query: string;
  searchOptions?: SearchOptions;
  scrapingOptions?: ScrapingOptions;
  maxResults?: number;
  scrapeTopResults?: number;
  includeMetadata?: boolean;
}

export interface ResearchResult {
  searchResults: SearchResponse;
  scrapedContent?: ScrapedContent[];
  summary?: {
    totalResults: number;
    scrapedCount: number;
    averageReadingTime: number;
    totalWordCount: number;
    topSources: string[];
  };
}

export interface ResearchOptions {
  searchOnly?: boolean;
  scrapeAllResults?: boolean;
  maxConcurrentScrapes?: number;
  includeSummary?: boolean;
  scrapingOptions?: ScrapingOptions;
}

class WebResearchService {
  private defaultOptions: ResearchOptions = {
    searchOnly: false,
    scrapeAllResults: false,
    maxConcurrentScrapes: 3,
    includeSummary: true,
  };

  /**
   * Perform comprehensive web research: search + scrape top results
   */
  async research(
    query: ResearchQuery,
    options: ResearchOptions = {}
  ): Promise<ResearchResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    console.log(`Starting web research for: "${query.query}"`);

    try {
      // Step 1: Perform search
      const searchResults = await searchService.search(
        query.query,
        query.searchOptions
      );

      if (mergedOptions.searchOnly) {
        return { searchResults };
      }

      // Step 2: Determine which results to scrape
      const resultsToScrape = mergedOptions.scrapeAllResults
        ? searchResults.results
        : searchResults.results.slice(0, query.scrapeTopResults || 3);

      // Step 3: Scrape selected results
      const scrapedContent = await this.scrapeResults(
        resultsToScrape.map((r) => r.url),
        query.scrapingOptions,
        mergedOptions.maxConcurrentScrapes
      );

      // Step 4: Generate summary if requested
      let summary;
      if (mergedOptions.includeSummary && scrapedContent.length > 0) {
        summary = this.generateSummary(searchResults, scrapedContent);
      }

      return {
        searchResults,
        scrapedContent,
        summary,
      };
    } catch (error) {
      console.error("Web research failed:", error);
      throw error;
    }
  }

  /**
   * Search and scrape a single URL
   */
  async searchAndScrape(
    query: string,
    url: string,
    options: ResearchOptions = {}
  ): Promise<{
    searchResults: SearchResponse;
    scrapedContent: ScrapedContent;
  }> {
    const searchResults = await searchService.search(query);
    const scrapedContent = await scraperService.scrape(
      url,
      options.scrapingOptions
    );

    return { searchResults, scrapedContent };
  }

  /**
   * Perform research with multiple queries and combine results
   */
  async multiQueryResearch(
    queries: string[],
    options: ResearchOptions = {}
  ): Promise<ResearchResult[]> {
    const results = await Promise.all(
      queries.map((query) => this.research({ query }, options))
    );

    return results;
  }

  /**
   * Research with automatic query expansion
   */
  async expandedResearch(
    baseQuery: string,
    expansionTerms: string[] = [],
    options: ResearchOptions = {}
  ): Promise<ResearchResult[]> {
    const queries = [
      baseQuery,
      ...expansionTerms.map((term) => `${baseQuery} ${term}`),
    ];

    return this.multiQueryResearch(queries, options);
  }

  /**
   * Research with competitor analysis
   */
  async competitorResearch(
    companyName: string,
    options: ResearchOptions = {}
  ): Promise<ResearchResult> {
    const queries = [
      `${companyName} company`,
      `${companyName} competitors`,
      `${companyName} market share`,
      `${companyName} revenue`,
      `${companyName} products`,
    ];

    const results = await this.multiQueryResearch(queries, options);

    // Combine and deduplicate results
    return this.combineResults(results);
  }

  /**
   * Research with trend analysis
   */
  async trendResearch(
    topic: string,
    timeRange: "week" | "month" | "year" = "month",
    options: ResearchOptions = {}
  ): Promise<ResearchResult> {
    const queries = [
      `${topic} trends ${timeRange}`,
      `${topic} latest news`,
      `${topic} market analysis`,
      `${topic} future predictions`,
    ];

    const results = await this.multiQueryResearch(queries, options);
    return this.combineResults(results);
  }

  /**
   * Research with sentiment analysis
   */
  async sentimentResearch(
    topic: string,
    options: ResearchOptions = {}
  ): Promise<ResearchResult> {
    const queries = [
      `${topic} reviews`,
      `${topic} complaints`,
      `${topic} positive feedback`,
      `${topic} negative feedback`,
    ];

    const results = await this.multiQueryResearch(queries, options);
    return this.combineResults(results);
  }

  private async scrapeResults(
    urls: string[],
    scrapingOptions?: ScrapingOptions,
    maxConcurrent: number = 3
  ): Promise<ScrapedContent[]> {
    const results: ScrapedContent[] = [];

    // Process URLs in batches to avoid overwhelming servers
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent);
      const batchPromises = batch.map((url) =>
        scraperService.scrape(url, scrapingOptions).catch((error) => {
          console.warn(`Failed to scrape ${url}:`, error);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...(batchResults.filter(Boolean) as ScrapedContent[]));

      // Small delay between batches to be respectful
      if (i + maxConcurrent < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  private generateSummary(
    searchResults: SearchResponse,
    scrapedContent: ScrapedContent[]
  ) {
    const totalResults = searchResults.results.length;
    const scrapedCount = scrapedContent.length;

    const readingTimes = scrapedContent
      .map((content) => content.readingTime || 0)
      .filter((time) => time > 0);

    const averageReadingTime =
      readingTimes.length > 0
        ? Math.round(
            readingTimes.reduce((a, b) => a + b, 0) / readingTimes.length
          )
        : 0;

    const totalWordCount = scrapedContent.reduce(
      (sum, content) => sum + (content.wordCount || 0),
      0
    );

    const sources = scrapedContent
      .map((content) => new URL(content.url).hostname)
      .filter((hostname, index, arr) => arr.indexOf(hostname) === index);

    const topSources = sources.slice(0, 5);

    return {
      totalResults,
      scrapedCount,
      averageReadingTime,
      totalWordCount,
      topSources,
    };
  }

  private combineResults(results: ResearchResult[]): ResearchResult {
    // Combine search results
    const allSearchResults = results.flatMap((r) => r.searchResults.results);
    const uniqueSearchResults = this.deduplicateResults(allSearchResults);

    const combinedSearchResults: SearchResponse = {
      results: uniqueSearchResults,
      totalResults: uniqueSearchResults.length,
      provider: "combined",
    };

    // Combine scraped content
    const allScrapedContent = results.flatMap((r) => r.scrapedContent || []);
    const uniqueScrapedContent =
      this.deduplicateScrapedContent(allScrapedContent);

    // Generate combined summary
    const summary = this.generateSummary(
      combinedSearchResults,
      uniqueScrapedContent
    );

    return {
      searchResults: combinedSearchResults,
      scrapedContent: uniqueScrapedContent,
      summary,
    };
  }

  private deduplicateResults(results: any[]): any[] {
    const seen = new Set();
    return results.filter((result) => {
      const key = result.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicateScrapedContent(
    content: ScrapedContent[]
  ): ScrapedContent[] {
    const seen = new Set();
    return content.filter((item) => {
      const key = item.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Get research statistics
   */
  async getStats(): Promise<{
    searchProviders: string[];
    searchProviderStatus: Record<
      string,
      { available: boolean; requiresApiKey: boolean }
    >;
    lastSearchTime?: string;
    totalSearches: number;
    totalScrapes: number;
  }> {
    return {
      searchProviders: searchService.getAvailableProviders(),
      searchProviderStatus: searchService.getProviderStatus(),
      totalSearches: 0, // Could be tracked with a counter
      totalScrapes: 0, // Could be tracked with a counter
    };
  }
}

// Export singleton instance
export const webResearchService = new WebResearchService();

// Export the class for testing
export { WebResearchService };
