// ============================================================================
// WEB SEARCH SERVICE - UPDATED TO USE SEARCH APIS
// ============================================================================

import { WebCrawler } from "./web-crawler";
import { CacheManager } from "./cache-manager";
import { UnifiedSearchAPIService } from "../search/search-apis";
import type { CrawlOptions } from "./web-crawler";

// ============================================================================
// SEARCH CONFIGURATION
// ============================================================================

interface SearchConfig {
  maxResults: number;
  maxDepth: number;
  timeout: number;
  enableCache: boolean;
  searchEngines: string[];
  resultFiltering: boolean;
  includeContent: boolean;
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  maxResults: 10,
  maxDepth: 2,
  timeout: 30000,
  enableCache: true,
  searchEngines: ["duckduckgo", "searx"],
  resultFiltering: true,
  includeContent: true,
};

// ============================================================================
// SEARCH RESULT INTERFACE
// ============================================================================

export interface SearchResult {
  url: string;
  title: string;
  description: string;
  content: string;
  relevance: number;
  source: string;
  timestamp: Date;
  extractedData?: any;
}

export interface SearchQuery {
  query: string;
  filters?: {
    domain?: string;
    dateRange?: { start: Date; end: Date };
    contentType?: string[];
    language?: string;
  };
  options?: CrawlOptions;
}

// ============================================================================
// WEB SEARCH SERVICE
// ============================================================================

export class WebSearchService {
  private crawler: WebCrawler;
  private cache: CacheManager;
  private searchAPI: UnifiedSearchAPIService;
  private config: SearchConfig;

  constructor(config: Partial<SearchConfig> = {}) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config };
    this.crawler = new WebCrawler({
      rateLimit: 2, // Faster rate since we're not hitting search engines
      maxConcurrent: 5,
    });
    this.cache = new CacheManager({
      maxSize: 500,
      ttl: 12 * 60 * 60 * 1000, // 12 hours
    });

    // Initialize search API with free engines
    this.searchAPI = new UnifiedSearchAPIService({
      enableDuckDuckGo: true,
      enableSearx: true,
      enableBrave: false, // Requires API key
      enableSerpapi: false, // Requires API key
      enableSerper: false, // Requires API key
      enableSerpstack: false, // Requires API key
      maxResults: this.config.maxResults,
      timeout: this.config.timeout,
      retryAttempts: 3,
    });
  }

  // ============================================================================
  // MAIN SEARCH METHOD
  // ============================================================================

  async search(query: SearchQuery): Promise<SearchResult[]> {
    console.log(`🔍 Web Search: Searching for "${query.query}"`);

    try {
      // Step 1: Use search APIs to find URLs
      const searchResponse = await this.searchAPI.search(query.query, {
        maxResults: this.config.maxResults,
        includeContent: this.config.includeContent,
      });

      if (!searchResponse.success || searchResponse.results.length === 0) {
        console.log("❌ No search results found");
        return [];
      }

      // Step 2: Convert search results to our format
      const searchResults = await this.convertSearchResults(
        searchResponse.results
      );

      // Step 3: Optionally enrich with content crawling
      if (this.config.includeContent) {
        await this.enrichWithContent(searchResults);
      }

      // Step 4: Filter and rank results
      const filteredResults = this.filterAndRankResults(searchResults, query);

      console.log(
        `✅ Web Search: Found ${filteredResults.length} relevant results`
      );

      return filteredResults.slice(0, this.config.maxResults);
    } catch (error) {
      console.error("❌ Web Search failed:", error);
      return [];
    }
  }

  // ============================================================================
  // SEARCH RESULT CONVERSION
  // ============================================================================

  private async convertSearchResults(
    apiResults: any[]
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const apiResult of apiResults) {
      const result: SearchResult = {
        url: apiResult.url,
        title: apiResult.title,
        description: apiResult.snippet,
        content: apiResult.snippet, // Will be enriched later if needed
        relevance: this.calculateRelevance(apiResult),
        source: apiResult.source,
        timestamp: apiResult.timestamp,
      };

      results.push(result);
    }

    return results;
  }

  private calculateRelevance(apiResult: any): number {
    let relevance = 0.5; // Base relevance

    // Boost based on confidence
    if (apiResult.confidence) {
      relevance += apiResult.confidence * 0.3;
    }

    // Boost based on rank (lower rank = higher relevance)
    if (apiResult.rank) {
      relevance += (1 / apiResult.rank) * 0.2;
    }

    return Math.min(relevance, 1.0);
  }

  // ============================================================================
  // CONTENT ENRICHMENT
  // ============================================================================

  private async enrichWithContent(results: SearchResult[]): Promise<void> {
    console.log("📄 Enriching results with content...");

    const enrichmentPromises = results.slice(0, 5).map(async (result) => {
      try {
        // Check cache first
        const cached = await this.cache.get(result.url);
        if (cached && cached.success) {
          result.content = this.extractRelevantContent(cached.parsedContent);
          return;
        }

        // Crawl the URL
        const crawlResult = await this.crawler.crawl(result.url, {
          timeout: 10000,
        });

        if (crawlResult.success && crawlResult.parsedContent) {
          result.content = this.extractRelevantContent(
            crawlResult.parsedContent
          );

          // Cache the result
          await this.cache.set(result.url, crawlResult);
        }
      } catch (error) {
        console.warn(`Failed to enrich ${result.url}:`, error);
      }
    });

    await Promise.allSettled(enrichmentPromises);
  }

  private extractRelevantContent(parsedContent: any): string {
    if (!parsedContent || parsedContent.type !== "html") {
      return "";
    }

    const data = parsedContent.data;
    if (!data) return "";

    // Extract title and description
    const title = data.title || "";
    const description = data.description || "";
    const text = data.text || "";

    // Combine relevant content
    const content = [title, description, text.substring(0, 500)]
      .filter(Boolean)
      .join(" ");

    return content.substring(0, 1000);
  }

  // ============================================================================
  // FILTERING AND RANKING
  // ============================================================================

  private filterAndRankResults(
    results: SearchResult[],
    query: SearchQuery
  ): SearchResult[] {
    let filtered = results;

    // Apply domain filter
    if (query.filters?.domain) {
      filtered = filtered.filter((result) =>
        result.url.includes(query.filters!.domain!)
      );
    }

    // Apply content type filter
    if (query.filters?.contentType) {
      filtered = filtered.filter((result) =>
        query.filters!.contentType!.some((type) => result.url.includes(type))
      );
    }

    // Apply language filter
    if (query.filters?.language) {
      // Simple language detection based on URL
      filtered = filtered.filter((result) => {
        const url = result.url.toLowerCase();
        return url.includes(query.filters!.language!.toLowerCase());
      });
    }

    // Remove duplicates
    filtered = this.removeDuplicates(filtered);

    // Sort by relevance
    filtered.sort((a, b) => b.relevance - a.relevance);

    return filtered;
  }

  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const unique: SearchResult[] = [];

    for (const result of results) {
      const normalizedUrl = this.normalizeUrl(result.url);
      if (!seen.has(normalizedUrl)) {
        seen.add(normalizedUrl);
        unique.push(result);
      }
    }

    return unique;
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  // ============================================================================
  // SPECIALIZED SEARCH METHODS
  // ============================================================================

  async searchCompetitors(
    companyName: string,
    industry: string
  ): Promise<SearchResult[]> {
    const query = `${companyName} competitors ${industry}`;
    return this.search({ query });
  }

  async searchMarketData(industry: string): Promise<SearchResult[]> {
    const query = `${industry} market size TAM SAM SOM`;
    return this.search({ query });
  }

  async searchCustomerReviews(companyName: string): Promise<SearchResult[]> {
    const query = `${companyName} reviews customer feedback`;
    return this.search({ query });
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    return this.cache.clear();
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    this.cache.destroy();
    this.searchAPI.destroy();
  }
}
