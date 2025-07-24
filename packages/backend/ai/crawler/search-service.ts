// ============================================================================
// SEARCH SERVICE (No Circular Dependencies)
// ============================================================================

import { UnifiedSearchAPIService } from "../search/search-apis";

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
  options?: any;
}

export class SearchService {
  private searchAPI: UnifiedSearchAPIService;

  constructor() {
    this.searchAPI = new UnifiedSearchAPIService({
      enableDuckDuckGo: true,
      enableSearx: true,
      enableBrave: false,
      enableSerpapi: false,
      enableSerper: false,
      enableSerpstack: false,
      maxResults: 15,
      timeout: 10000,
      retryAttempts: 3,
    });
  }

  async search(query: string | SearchQuery, options?: any): Promise<SearchResult[]> {
    const queryString = typeof query === "string" ? query : query.query;
    
    try {
      const response = await this.searchAPI.search(queryString, {
        maxResults: options?.maxResults || 15,
        includeContent: false, // Disabled to avoid circular dependencies
      });

      if (!response.success) {
        console.warn("Search failed:", response.error);
        return [];
      }

      return response.results.map((result: any) => ({
        url: result.url,
        title: result.title,
        description: result.snippet,
        content: result.snippet,
        relevance: result.confidence || 0.5,
        source: result.source,
        timestamp: result.timestamp,
      }));
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  async searchCompetitors(companyName: string, industry: string): Promise<SearchResult[]> {
    const query = `${companyName} competitors ${industry} SaaS alternatives`;
    return this.search(query, { maxResults: 10 });
  }

  async searchMarketData(industry: string): Promise<SearchResult[]> {
    const query = `${industry} market size growth trends SaaS`;
    return this.search(query, { maxResults: 10 });
  }

  async searchCustomerReviews(companyName: string): Promise<SearchResult[]> {
    const query = `${companyName} customer reviews feedback testimonials`;
    return this.search(query, { maxResults: 10 });
  }

  destroy(): void {
    this.searchAPI.destroy();
  }
} 