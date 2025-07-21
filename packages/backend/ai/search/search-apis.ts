// ============================================================================
// FREE WEB SEARCH APIs INTEGRATION
// ============================================================================

import axios from "axios";
import { UnifiedCrawlerService } from "../crawler";

// ============================================================================
// SEARCH API CONFIGURATION
// ============================================================================

interface SearchAPIConfig {
  enableDuckDuckGo: boolean;
  enableSearx: boolean;
  enableBrave: boolean;
  enableSerpapi: boolean;
  enableSerper: boolean;
  enableSerpstack: boolean;
  maxResults: number;
  timeout: number;
  retryAttempts: number;
}

const DEFAULT_SEARCH_CONFIG: SearchAPIConfig = {
  enableDuckDuckGo: true,
  enableSearx: true,
  enableBrave: false, // Requires API key
  enableSerpapi: false, // Requires API key
  enableSerper: false, // Requires API key
  enableSerpstack: false, // Requires API key
  maxResults: 10,
  timeout: 10000,
  retryAttempts: 3,
};

// ============================================================================
// SEARCH RESULT TYPES
// ============================================================================

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  rank: number;
  confidence: number;
  timestamp: Date;
  metadata?: {
    domain?: string;
    language?: string;
    type?: "web" | "news" | "images" | "videos";
    date?: string;
  };
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  sources: string[];
  success: boolean;
  error?: string;
}

// ============================================================================
// DUCKDUCKGO SEARCH API
// ============================================================================

class DuckDuckGoSearchAPI {
  private baseUrl = "https://api.duckduckgo.com/";

  async search(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    try {
      // DuckDuckGo Instant Answer API (free, no API key required)
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          format: "json",
          no_html: "1",
          skip_disambig: "1",
        },
        timeout: 10000,
      });

      const results: SearchResult[] = [];

      // Extract results from DuckDuckGo response
      if (response.data.AbstractURL) {
        results.push({
          title: response.data.AbstractText || "DuckDuckGo Result",
          url: response.data.AbstractURL,
          snippet: response.data.AbstractText || "",
          source: "duckduckgo",
          rank: 1,
          confidence: 0.8,
          timestamp: new Date(),
          metadata: {
            domain: new URL(response.data.AbstractURL).hostname,
            type: "web",
          },
        });
      }

      // Add related topics
      if (response.data.RelatedTopics) {
        for (
          let i = 0;
          i < Math.min(response.data.RelatedTopics.length, maxResults - 1);
          i++
        ) {
          const topic = response.data.RelatedTopics[i];
          if (topic.FirstURL && topic.Text) {
            results.push({
              title: topic.Text.split(" - ")[0] || "Related Topic",
              url: topic.FirstURL,
              snippet: topic.Text,
              source: "duckduckgo",
              rank: i + 2,
              confidence: 0.6,
              timestamp: new Date(),
              metadata: {
                domain: new URL(topic.FirstURL).hostname,
                type: "web",
              },
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.warn("DuckDuckGo search failed:", error);
      return [];
    }
  }
}

// ============================================================================
// SEARX SEARCH API (META SEARCH ENGINE)
// ============================================================================

class SearxSearchAPI {
  private instances = [
    "https://searx.be",
    "https://searx.tiekoetter.com",
    "https://searx.prvcy.eu",
    "https://searx.space",
    "https://searx.bar",
  ];

  async search(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    for (const instance of this.instances) {
      try {
        const response = await axios.get(`${instance}/search`, {
          params: {
            q: query,
            format: "json",
            engines: "google,bing,duckduckgo",
            categories: "general",
            language: "en",
            time_range: null,
            safesearch: 0,
            theme: "simple",
          },
          timeout: 10000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (response.data && response.data.results) {
          return response.data.results
            .slice(0, maxResults)
            .map((result: any, index: number) => ({
              title: result.title || "",
              url: result.url || "",
              snippet: result.content || "",
              source: "searx",
              rank: index + 1,
              confidence: 0.7,
              timestamp: new Date(),
              metadata: {
                domain: result.url ? new URL(result.url).hostname : undefined,
                type: "web",
                language: "en",
              },
            }));
        }
      } catch (error) {
        console.warn(`Searx instance ${instance} failed:`, error);
        continue;
      }
    }

    return [];
  }
}

// ============================================================================
// BRAVE SEARCH API (FREE TIER)
// ============================================================================

class BraveSearchAPI {
  private apiKey?: string;
  private baseUrl = "https://api.search.brave.com/res/v1/web/search";

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async search(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn("Brave Search API key not provided, skipping...");
      return [];
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          count: maxResults,
          search_lang: "en_US",
          country: "US",
          safesearch: "off",
        },
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data && response.data.web && response.data.web.results) {
        return response.data.web.results.map((result: any, index: number) => ({
          title: result.title || "",
          url: result.url || "",
          snippet: result.description || "",
          source: "brave",
          rank: index + 1,
          confidence: 0.9,
          timestamp: new Date(),
          metadata: {
            domain: result.url ? new URL(result.url).hostname : undefined,
            type: "web",
            language: "en",
          },
        }));
      }

      return [];
    } catch (error) {
      console.warn("Brave Search API failed:", error);
      return [];
    }
  }
}

// ============================================================================
// SERPAPI (FREE TIER - 100 SEARCHES/MONTH)
// ============================================================================

class SerpAPISearchAPI {
  private apiKey?: string;
  private baseUrl = "https://serpapi.com/search";

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async search(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn("SerpAPI key not provided, skipping...");
      return [];
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          api_key: this.apiKey,
          engine: "google",
          num: maxResults,
          hl: "en",
          gl: "us",
        },
        timeout: 10000,
      });

      if (response.data && response.data.organic_results) {
        return response.data.organic_results.map(
          (result: any, index: number) => ({
            title: result.title || "",
            url: result.link || "",
            snippet: result.snippet || "",
            source: "serpapi",
            rank: index + 1,
            confidence: 0.9,
            timestamp: new Date(),
            metadata: {
              domain: result.link ? new URL(result.link).hostname : undefined,
              type: "web",
              language: "en",
            },
          })
        );
      }

      return [];
    } catch (error) {
      console.warn("SerpAPI failed:", error);
      return [];
    }
  }
}

// ============================================================================
// SERPER API (FREE TIER - 100 SEARCHES/MONTH)
// ============================================================================

class SerperSearchAPI {
  private apiKey?: string;
  private baseUrl = "https://google.serper.dev/search";

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async search(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn("Serper API key not provided, skipping...");
      return [];
    }

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          q: query,
          num: maxResults,
          hl: "en",
          gl: "us",
        },
        {
          headers: {
            "X-API-KEY": this.apiKey,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.organic) {
        return response.data.organic.map((result: any, index: number) => ({
          title: result.title || "",
          url: result.link || "",
          snippet: result.snippet || "",
          source: "serper",
          rank: index + 1,
          confidence: 0.9,
          timestamp: new Date(),
          metadata: {
            domain: result.link ? new URL(result.link).hostname : undefined,
            type: "web",
            language: "en",
          },
        }));
      }

      return [];
    } catch (error) {
      console.warn("Serper API failed:", error);
      return [];
    }
  }
}

// ============================================================================
// SERPSTACK API (FREE TIER - 100 SEARCHES/MONTH)
// ============================================================================

class SerpstackSearchAPI {
  private apiKey?: string;
  private baseUrl = "http://api.serpstack.com/search";

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async search(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn("Serpstack API key not provided, skipping...");
      return [];
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          access_key: this.apiKey,
          query: query,
          num: maxResults,
          hl: "en",
          gl: "us",
          safe: 0,
        },
        timeout: 10000,
      });

      if (response.data && response.data.organic_results) {
        return response.data.organic_results.map(
          (result: any, index: number) => ({
            title: result.title || "",
            url: result.url || "",
            snippet: result.snippet || "",
            source: "serpstack",
            rank: index + 1,
            confidence: 0.8,
            timestamp: new Date(),
            metadata: {
              domain: result.url ? new URL(result.url).hostname : undefined,
              type: "web",
              language: "en",
            },
          })
        );
      }

      return [];
    } catch (error) {
      console.warn("Serpstack API failed:", error);
      return [];
    }
  }
}

// ============================================================================
// UNIFIED SEARCH API SERVICE
// ============================================================================

export class UnifiedSearchAPIService {
  private config: SearchAPIConfig;
  private duckDuckGo: DuckDuckGoSearchAPI;
  private searx: SearxSearchAPI;
  private brave: BraveSearchAPI;
  private serpapi: SerpAPISearchAPI;
  private serper: SerperSearchAPI;
  private serpstack: SerpstackSearchAPI;
  private crawler: UnifiedCrawlerService;

  constructor(
    config: Partial<SearchAPIConfig> = {},
    apiKeys?: {
      brave?: string;
      serpapi?: string;
      serper?: string;
      serpstack?: string;
    }
  ) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config };
    this.duckDuckGo = new DuckDuckGoSearchAPI();
    this.searx = new SearxSearchAPI();
    this.brave = new BraveSearchAPI(apiKeys?.brave);
    this.serpapi = new SerpAPISearchAPI(apiKeys?.serpapi);
    this.serper = new SerperSearchAPI(apiKeys?.serper);
    this.serpstack = new SerpstackSearchAPI(apiKeys?.serpstack);
    this.crawler = new UnifiedCrawlerService();
  }

  // ============================================================================
  // MAIN SEARCH METHOD
  // ============================================================================

  async search(
    query: string,
    options?: {
      maxResults?: number;
      sources?: string[];
      includeContent?: boolean;
    }
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const maxResults = options?.maxResults || this.config.maxResults;
    const includeContent = options?.includeContent || false;

    console.log(`🔍 Unified Search: Searching for "${query}"...`);

    const allResults: SearchResult[] = [];
    const sources: string[] = [];

    try {
      // Execute searches in parallel
      const searchPromises: Promise<SearchResult[]>[] = [];

      if (this.config.enableDuckDuckGo) {
        searchPromises.push(this.duckDuckGo.search(query, maxResults));
        sources.push("duckduckgo");
      }

      if (this.config.enableSearx) {
        searchPromises.push(this.searx.search(query, maxResults));
        sources.push("searx");
      }

      if (this.config.enableBrave && this.brave) {
        searchPromises.push(this.brave.search(query, maxResults));
        sources.push("brave");
      }

      if (this.config.enableSerpapi && this.serpapi) {
        searchPromises.push(this.serpapi.search(query, maxResults));
        sources.push("serpapi");
      }

      if (this.config.enableSerper && this.serper) {
        searchPromises.push(this.serper.search(query, maxResults));
        sources.push("serper");
      }

      if (this.config.enableSerpstack && this.serpstack) {
        searchPromises.push(this.serpstack.search(query, maxResults));
        sources.push("serpstack");
      }

      // Wait for all searches to complete
      const searchResults = await Promise.allSettled(searchPromises);

      // Combine and deduplicate results
      for (const result of searchResults) {
        if (result.status === "fulfilled") {
          allResults.push(...result.value);
        }
      }

      // Deduplicate results by URL
      const uniqueResults = this.deduplicateResults(allResults);

      // Sort by confidence and rank
      const sortedResults = uniqueResults
        .sort((a, b) => {
          // Primary sort by confidence
          if (b.confidence !== a.confidence) {
            return b.confidence - a.confidence;
          }
          // Secondary sort by rank
          return a.rank - b.rank;
        })
        .slice(0, maxResults);

      // Optionally fetch content for top results
      if (includeContent && sortedResults.length > 0) {
        await this.enrichResultsWithContent(sortedResults.slice(0, 5));
      }

      const searchTime = Date.now() - startTime;

      return {
        query,
        results: sortedResults,
        totalResults: sortedResults.length,
        searchTime,
        sources,
        success: true,
      };
    } catch (error) {
      console.error("Unified search failed:", error);
      return {
        query,
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        sources,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
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

  private async enrichResultsWithContent(
    results: SearchResult[]
  ): Promise<void> {
    console.log("📄 Enriching results with content...");

    for (const result of results) {
      try {
        const crawlResult = await this.crawler.crawl(result.url);
        if (crawlResult.success && crawlResult.parsedContent?.type === "html") {
          const content = crawlResult.parsedContent.data.text || "";
          result.snippet =
            content.substring(0, 300) + (content.length > 300 ? "..." : "");
          result.confidence += 0.1; // Boost confidence for content-enriched results
        }
      } catch (error) {
        console.warn(`Failed to enrich result ${result.url}:`, error);
      }
    }
  }

  // ============================================================================
  // SPECIALIZED SEARCH METHODS
  // ============================================================================

  async searchNews(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResponse> {
    return this.search(`${query} news`, { maxResults });
  }

  async searchReviews(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResponse> {
    return this.search(`${query} reviews`, { maxResults });
  }

  async searchCompetitors(
    companyName: string,
    industry: string,
    maxResults: number = 10
  ): Promise<SearchResponse> {
    return this.search(`${companyName} competitors ${industry}`, {
      maxResults,
    });
  }

  async searchPricing(
    companyName: string,
    maxResults: number = 10
  ): Promise<SearchResponse> {
    return this.search(`${companyName} pricing plans`, { maxResults });
  }

  async searchFeatures(
    companyName: string,
    maxResults: number = 10
  ): Promise<SearchResponse> {
    return this.search(`${companyName} features capabilities`, { maxResults });
  }

  destroy(): void {
    this.crawler.destroy();
  }
}

export default UnifiedSearchAPIService;
