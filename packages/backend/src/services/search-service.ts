import { z } from "zod";

// Search result schemas
const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  snippet: z.string().optional(),
  source: z.string().optional(),
  favicon: z.string().url().optional(),
});

const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  totalResults: z.number().optional(),
  searchTime: z.number().optional(),
  provider: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// Provider configurations
interface SearchProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
  transformResponse: (data: any) => SearchResult[];
  isAvailable: () => boolean;
  requiresApiKey: boolean;
}

class SearchService {
  private providers: SearchProvider[] = [];
  private currentProviderIndex = 0;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // DuckDuckGo Instant Answer API (FREE - no API key required)
    this.providers.push({
      name: "duckduckgo",
      endpoint: "https://api.duckduckgo.com/",
      requiresApiKey: false,
      isAvailable: () => true, // Always available
      transformResponse: (data: any) => {
        const results: SearchResult[] = [];

        // Add instant answer if available
        if (data.AbstractURL && data.Abstract) {
          results.push({
            title: data.Heading || "Instant Answer",
            url: data.AbstractURL,
            description: data.Abstract,
            snippet: data.Abstract,
            source: "DuckDuckGo",
            favicon: data.Image || undefined,
          });
        }

        // Add related topics
        if (data.RelatedTopics) {
          data.RelatedTopics.forEach((topic: any) => {
            if (topic.FirstURL && topic.Text) {
              results.push({
                title: topic.Text.split(" - ")[0] || topic.Text,
                url: topic.FirstURL,
                description: topic.Text,
                snippet: topic.Text,
                source: "DuckDuckGo",
              });
            }
          });
        }

        return results;
      },
    });

    // Brave Search API
    this.providers.push({
      name: "brave",
      endpoint: "https://api.search.brave.com/res/v1/web/search",
      apiKey: process.env.BRAVE_SEARCH_API_KEY,
      requiresApiKey: true,
      headers: {
        "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY || "",
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
      isAvailable: () => !!process.env.BRAVE_SEARCH_API_KEY,
      transformResponse: (data: any) => {
        if (!data.web?.results) return [];
        return data.web.results.map((result: any) => ({
          title: result.title,
          url: result.url,
          description: result.description,
          snippet: result.description,
          source: result.profile?.name,
          favicon: result.profile?.img,
        }));
      },
    });

    // SerpApi (Google results)
    this.providers.push({
      name: "serpapi",
      endpoint: "https://serpapi.com/search.json",
      apiKey: process.env.SERPAPI_KEY,
      requiresApiKey: true,
      isAvailable: () => !!process.env.SERPAPI_KEY,
      transformResponse: (data: any) => {
        if (!data.organic_results) return [];
        return data.organic_results.map((result: any) => ({
          title: result.title,
          url: result.link,
          description: result.snippet,
          snippet: result.snippet,
          source: result.source,
          favicon: result.favicon,
        }));
      },
    });

    // SearchApi.io (DuckDuckGo)
    this.providers.push({
      name: "searchapi",
      endpoint: "https://www.searchapi.io/api/v1/search",
      apiKey: process.env.SEARCHAPI_KEY,
      requiresApiKey: true,
      isAvailable: () => !!process.env.SEARCHAPI_KEY,
      transformResponse: (data: any) => {
        if (!data.organic_results) return [];
        return data.organic_results.map((result: any) => ({
          title: result.title,
          url: result.link,
          description: result.snippet,
          snippet: result.snippet,
          source: result.source,
          favicon: result.favicon,
        }));
      },
    });
  }

  private async makeRequest(
    provider: SearchProvider,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    const startTime = Date.now();

    let url: string;
    let headers = provider.headers || {};

    if (provider.name === "duckduckgo") {
      // DuckDuckGo Instant Answer API
      const params = new URLSearchParams({
        q: query,
        format: "json",
        no_html: "1",
        skip_disambig: "1",
      });
      url = `${provider.endpoint}?${params.toString()}`;
    } else {
      // Other providers
      const params = new URLSearchParams({
        q: query,
        count: options.limit?.toString() || "10",
        ...(options.country && { country: options.country }),
        ...(options.language && { search_lang: options.language }),
      });

      // Add provider-specific parameters
      if (provider.name === "serpapi") {
        params.set("engine", "google");
        params.set("api_key", provider.apiKey!);
      } else if (provider.name === "searchapi") {
        params.set("engine", "duckduckgo");
        params.set("api_key", provider.apiKey!);
      }

      url = `${provider.endpoint}?${params.toString()}`;
    }

    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const results = provider.transformResponse(data);

      return {
        results,
        totalResults: results.length,
        searchTime: Date.now() - startTime,
        provider: provider.name,
      };
    } catch (error) {
      console.error(`Search request failed for ${provider.name}:`, error);
      throw error;
    }
  }

  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    const availableProviders = this.providers.filter((p) => p.isAvailable());

    if (availableProviders.length === 0) {
      throw new Error(
        "No search providers available. Please configure API keys or use free providers."
      );
    }

    // Try providers in order, with fallback
    for (const provider of availableProviders) {
      if (!provider) continue;

      try {
        const result = await this.makeRequest(provider, query, options);
        console.log(
          `Search completed using ${provider.name} in ${result.searchTime}ms`
        );
        return result;
      } catch (error) {
        console.warn(`Provider ${provider.name} failed, trying next...`);
      }
    }

    throw new Error("No search providers available");
  }

  async searchWithRetry(
    query: string,
    options: SearchOptions = {},
    maxRetries = 3
  ): Promise<SearchResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.search(query, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Search attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError!;
  }

  // Get available providers
  getAvailableProviders(): string[] {
    return this.providers.filter((p) => p.isAvailable()).map((p) => p.name);
  }

  // Get provider status
  getProviderStatus(): Record<
    string,
    { available: boolean; requiresApiKey: boolean }
  > {
    const status: Record<
      string,
      { available: boolean; requiresApiKey: boolean }
    > = {};
    this.providers.forEach((provider) => {
      status[provider.name] = {
        available: provider.isAvailable(),
        requiresApiKey: provider.requiresApiKey,
      };
    });
    return status;
  }

  // Get free providers
  getFreeProviders(): string[] {
    return this.providers
      .filter((p) => !p.requiresApiKey && p.isAvailable())
      .map((p) => p.name);
  }
}

export interface SearchOptions {
  limit?: number;
  country?: string;
  language?: string;
  safeSearch?: boolean;
}

// Export singleton instance
export const searchService = new SearchService();

// Export the class for testing
export { SearchService };
