import { WebCrawler, CrawlOptions } from "./web-crawler";
import { CacheManager } from "./cache-manager";
import { SaasDataExtractor } from "./data-extractors";

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
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  maxResults: 10,
  maxDepth: 2,
  timeout: 30000,
  enableCache: true,
  searchEngines: ["google", "bing", "duckduckgo"],
  resultFiltering: true,
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
  private config: SearchConfig;

  constructor(config: Partial<SearchConfig> = {}) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config };
    this.crawler = new WebCrawler({
      rateLimit: 1, // Slower rate for search
      maxConcurrent: 3,
    });
    this.cache = new CacheManager({
      maxSize: 500,
      ttl: 12 * 60 * 60 * 1000, // 12 hours
    });
  }

  // ============================================================================
  // MAIN SEARCH METHOD
  // ============================================================================

  async search(query: SearchQuery): Promise<SearchResult[]> {
    console.log(`🔍 Web Search: Searching for "${query.query}"`);

    try {
      // Step 1: Generate search URLs
      const searchUrls = await this.generateSearchUrls(query.query);

      // Step 2: Crawl search results
      const crawlResults = await this.crawlSearchResults(
        searchUrls,
        query.options
      );

      // Step 3: Extract and process content
      const searchResults = await this.processSearchResults(
        crawlResults,
        query
      );

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
  // SEARCH URL GENERATION
  // ============================================================================

  private async generateSearchUrls(query: string): Promise<string[]> {
    const searchUrls: string[] = [];

    // Generate URLs for different search engines
    for (const engine of this.config.searchEngines) {
      const engineUrls = this.generateEngineUrls(engine, query);
      searchUrls.push(...engineUrls);
    }

    // Add direct competitor/industry URLs
    const industryUrls = this.generateIndustryUrls(query);
    searchUrls.push(...industryUrls);

    return searchUrls;
  }

  private generateEngineUrls(engine: string, query: string): string[] {
    const encodedQuery = encodeURIComponent(query);

    switch (engine) {
      case "google":
        return [
          `https://www.google.com/search?q=${encodedQuery}`,
          `https://www.google.com/search?q=${encodedQuery}&tbm=nws`, // News
          `https://www.google.com/search?q=${encodedQuery}&tbm=blg`, // Blogs
        ];

      case "bing":
        return [
          `https://www.bing.com/search?q=${encodedQuery}`,
          `https://www.bing.com/news/search?q=${encodedQuery}`,
        ];

      case "duckduckgo":
        return [`https://duckduckgo.com/?q=${encodedQuery}`];

      default:
        return [];
    }
  }

  private generateIndustryUrls(query: string): string[] {
    const industryUrls: string[] = [];
    const keywords = query.toLowerCase().split(" ");

    // Common SaaS industry sites
    const industrySites = [
      "producthunt.com",
      "saasradar.net",
      "saaslist.co",
      "g2.com",
      "capterra.com",
      "trustpilot.com",
      "crunchbase.com",
      "linkedin.com/company",
      "techcrunch.com",
      "venturebeat.com",
    ];

    for (const site of industrySites) {
      for (const keyword of keywords) {
        if (keyword.length > 3) {
          industryUrls.push(
            `https://${site}/search?q=${encodeURIComponent(keyword)}`
          );
        }
      }
    }

    return industryUrls;
  }

  // ============================================================================
  // CRAWLING SEARCH RESULTS
  // ============================================================================

  private async crawlSearchResults(
    urls: string[],
    options?: CrawlOptions
  ): Promise<any[]> {
    const results: any[] = [];

    for (const url of urls) {
      try {
        // Check cache first
        if (this.config.enableCache) {
          const cached = await this.cache.get(url);
          if (cached) {
            results.push(cached);
            continue;
          }
        }

        // Crawl the URL
        const result = await this.crawler.crawl(url, {
          ...options,
          textSelectors: [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "p",
            "article",
            "section",
            ".search-result",
            ".result",
            ".listing",
            '[data-testid*="result"]',
            '[class*="result"]',
          ],
        });

        // Cache the result
        if (this.config.enableCache && result.success) {
          await this.cache.set(url, result);
        }

        results.push(result);
      } catch (error) {
        console.warn(`Failed to crawl ${url}:`, error);
      }
    }

    return results;
  }

  // ============================================================================
  // PROCESSING SEARCH RESULTS
  // ============================================================================

  private async processSearchResults(
    crawlResults: any[],
    query: SearchQuery
  ): Promise<SearchResult[]> {
    const searchResults: SearchResult[] = [];

    for (const result of crawlResults) {
      if (!result.success || !result.parsedContent) {
        continue;
      }

      // Extract search results from the page
      const extractedResults = this.extractSearchResults(result, query.query);
      searchResults.push(...extractedResults);

      // Extract SaaS-specific data if available
      if (this.isSaaSRelevant(result)) {
        const extractedData = SaasDataExtractor.extractAll(result);
        if (extractedData) {
          // Add extracted data to relevant results
          for (const searchResult of searchResults) {
            if (searchResult.url === result.url) {
              searchResult.extractedData = extractedData;
              break;
            }
          }
        }
      }
    }

    return searchResults;
  }

  private extractSearchResults(
    crawlResult: any,
    query: string
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const { parsedContent } = crawlResult;

    if (parsedContent.type !== "html") {
      return results;
    }

    const document = parsedContent.data;
    const text = document.text || "";

    // Extract search result links
    const links = document.links || [];

    for (const link of links) {
      if (this.isValidSearchResult(link, query)) {
        const result: SearchResult = {
          url: link.href,
          title: link.text || link.href,
          description: this.extractDescription(text, link),
          content: text,
          relevance: this.calculateRelevance(link, query),
          source: this.extractSource(crawlResult.url),
          timestamp: new Date(),
        };

        results.push(result);
      }
    }

    return results;
  }

  private isValidSearchResult(link: any, query: string): boolean {
    const href = link.href || "";
    const text = link.text || "";

    // Skip internal links, ads, and non-relevant content
    if (
      href.includes("#") ||
      href.includes("javascript:") ||
      href.includes("mailto:")
    ) {
      return false;
    }

    // Skip common non-result links
    const skipPatterns = [
      "google.com/search",
      "bing.com/search",
      "duckduckgo.com",
      "youtube.com",
      "facebook.com",
      "twitter.com",
      "instagram.com",
    ];

    for (const pattern of skipPatterns) {
      if (href.includes(pattern)) {
        return false;
      }
    }

    // Check if link text is relevant to query
    const queryWords = query.toLowerCase().split(" ");
    const linkWords = text.toLowerCase().split(" ");

    const relevanceScore = queryWords.filter((word) =>
      linkWords.some((linkWord: string) => linkWord.includes(word))
    ).length;

    return relevanceScore > 0;
  }

  private extractDescription(text: string, link: any): string {
    // Try to find description near the link
    const linkText = link.text || "";
    const linkIndex = text.indexOf(linkText);

    if (linkIndex > -1) {
      const start = Math.max(0, linkIndex - 100);
      const end = Math.min(text.length, linkIndex + linkText.length + 100);
      return text.substring(start, end).trim();
    }

    return linkText;
  }

  private calculateRelevance(link: any, query: string): number {
    let relevance = 0;
    const href = link.href || "";
    const text = link.text || "";
    const queryWords = query.toLowerCase().split(" ");

    // URL relevance
    for (const word of queryWords) {
      if (href.toLowerCase().includes(word)) {
        relevance += 2;
      }
    }

    // Text relevance
    for (const word of queryWords) {
      if (text.toLowerCase().includes(word)) {
        relevance += 1;
      }
    }

    // Domain authority bonus
    if (this.isAuthoritativeDomain(href)) {
      relevance += 3;
    }

    return relevance;
  }

  private isAuthoritativeDomain(url: string): boolean {
    const authoritativeDomains = [
      "crunchbase.com",
      "linkedin.com",
      "techcrunch.com",
      "venturebeat.com",
      "g2.com",
      "capterra.com",
      "producthunt.com",
      "saasradar.net",
    ];

    return authoritativeDomains.some((domain) => url.includes(domain));
  }

  private extractSource(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "unknown";
    }
  }

  private isSaaSRelevant(result: any): boolean {
    const text = result.parsedContent?.text || "";
    const url = result.url || "";

    const saasKeywords = [
      "saas",
      "software as a service",
      "subscription",
      "pricing",
      "features",
      "integrations",
      "api",
      "cloud",
      "platform",
      "startup",
      "company",
      "business",
      "enterprise",
    ];

    return saasKeywords.some(
      (keyword) =>
        text.toLowerCase().includes(keyword) ||
        url.toLowerCase().includes(keyword)
    );
  }

  // ============================================================================
  // FILTERING AND RANKING
  // ============================================================================

  private filterAndRankResults(
    results: SearchResult[],
    query: SearchQuery
  ): SearchResult[] {
    let filteredResults = results;

    // Apply filters
    if (query.filters) {
      if (query.filters.domain) {
        filteredResults = filteredResults.filter((result) =>
          result.url.includes(query.filters!.domain!)
        );
      }

      if (query.filters.dateRange) {
        filteredResults = filteredResults.filter(
          (result) =>
            result.timestamp >= query.filters!.dateRange!.start &&
            result.timestamp <= query.filters!.dateRange!.end
        );
      }
    }

    // Remove duplicates
    filteredResults = this.removeDuplicates(filteredResults);

    // Sort by relevance
    filteredResults.sort((a, b) => b.relevance - a.relevance);

    return filteredResults;
  }

  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter((result) => {
      const key = result.url;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // ============================================================================
  // SPECIALIZED SEARCH METHODS
  // ============================================================================

  async searchCompetitors(
    companyName: string,
    industry: string
  ): Promise<SearchResult[]> {
    const queries = [
      `${companyName} competitors alternatives`,
      `${industry} SaaS companies`,
      `${companyName} vs competitors`,
      `best ${industry} software`,
      `${industry} market leaders`,
    ];

    const results: SearchResult[] = [];

    for (const query of queries) {
      const searchResults = await this.search({ query });
      results.push(...searchResults);
    }

    return this.removeDuplicates(results);
  }

  async searchMarketData(industry: string): Promise<SearchResult[]> {
    const queries = [
      `${industry} market size 2024`,
      `${industry} industry report`,
      `${industry} growth rate`,
      `${industry} market analysis`,
      `${industry} TAM SAM SOM`,
    ];

    const results: SearchResult[] = [];

    for (const query of queries) {
      const searchResults = await this.search({ query });
      results.push(...searchResults);
    }

    return this.removeDuplicates(results);
  }

  async searchCustomerReviews(companyName: string): Promise<SearchResult[]> {
    const queries = [
      `${companyName} reviews`,
      `${companyName} customer feedback`,
      `${companyName} G2 reviews`,
      `${companyName} Capterra reviews`,
      `${companyName} Trustpilot`,
    ];

    const results: SearchResult[] = [];

    for (const query of queries) {
      const searchResults = await this.search({ query });
      results.push(...searchResults);
    }

    return this.removeDuplicates(results);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    return this.cache.clear();
  }

  destroy() {
    this.cache.destroy();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default WebSearchService;
