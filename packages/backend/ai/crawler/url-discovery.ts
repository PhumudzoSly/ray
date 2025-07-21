import { WebCrawler } from "./web-crawler";
import { CacheManager } from "./cache-manager";

// ============================================================================
// URL DISCOVERY CONFIGURATION
// ============================================================================

interface DiscoveryConfig {
  maxDiscoveryDepth: number;
  maxUrlsPerSource: number;
  enableLinkFollowing: boolean;
  enableSitemapDiscovery: boolean;
  enableRSSDiscovery: boolean;
  enableAPIDiscovery: boolean;
  respectRobotsTxt: boolean;
  discoveryTimeout: number;
}

const DEFAULT_DISCOVERY_CONFIG: DiscoveryConfig = {
  maxDiscoveryDepth: 3,
  maxUrlsPerSource: 50,
  enableLinkFollowing: true,
  enableSitemapDiscovery: true,
  enableRSSDiscovery: true,
  enableAPIDiscovery: true,
  respectRobotsTxt: true,
  discoveryTimeout: 30000,
};

// ============================================================================
// URL DISCOVERY STRATEGIES
// ============================================================================

export interface DiscoveryStrategy {
  name: string;
  priority: number;
  discover: (query: string, context?: any) => Promise<string[]>;
}

// ============================================================================
// SEARCH ENGINE DISCOVERY
// ============================================================================

export class SearchEngineDiscovery implements DiscoveryStrategy {
  name = "search-engine";
  priority = 1;

  async discover(query: string, context?: any): Promise<string[]> {
    const urls: string[] = [];

    // Generate search queries for different search engines
    const searchQueries = this.generateSearchQueries(query, context);

    for (const searchQuery of searchQueries) {
      const searchUrls = this.generateSearchUrls(searchQuery);
      urls.push(...searchUrls);
    }

    return urls;
  }

  private generateSearchQueries(query: string, context?: any): string[] {
    const baseQuery = query.toLowerCase();
    const queries = [
      `${baseQuery} SaaS`,
      `${baseQuery} software`,
      `${baseQuery} platform`,
      `${baseQuery} tools`,
      `${baseQuery} alternatives`,
      `${baseQuery} competitors`,
      `${baseQuery} pricing`,
      `${baseQuery} reviews`,
      `${baseQuery} features`,
      `${baseQuery} market size`,
    ];

    // Add industry-specific queries
    if (context?.industry) {
      queries.push(
        `${context.industry} SaaS companies`,
        `${context.industry} software market`,
        `${context.industry} technology trends`,
        `${context.industry} customer reviews`
      );
    }

    return queries;
  }

  private generateSearchUrls(query: string): string[] {
    const encodedQuery = encodeURIComponent(query);
    return [
      `https://www.google.com/search?q=${encodedQuery}`,
      `https://www.google.com/search?q=${encodedQuery}&tbm=nws`,
      `https://www.bing.com/search?q=${encodedQuery}`,
      `https://duckduckgo.com/?q=${encodedQuery}`,
    ];
  }
}

// ============================================================================
// INDUSTRY PLATFORM DISCOVERY
// ============================================================================

export class IndustryPlatformDiscovery implements DiscoveryStrategy {
  name = "industry-platform";
  priority = 2;

  private readonly platforms = {
    review: [
      "g2.com",
      "capterra.com",
      "trustpilot.com",
      "producthunt.com",
      "alternativeto.net",
      "saasradar.net",
      "saaslist.co",
    ],
    news: [
      "techcrunch.com",
      "venturebeat.com",
      "wired.com",
      "theverge.com",
      "arstechnica.com",
    ],
    business: [
      "crunchbase.com",
      "linkedin.com/company",
      "bloomberg.com",
      "reuters.com",
      "forbes.com",
    ],
    research: [
      "gartner.com",
      "forrester.com",
      "idc.com",
      "statista.com",
      "mckinsey.com",
    ],
  };

  async discover(query: string, context?: any): Promise<string[]> {
    const urls: string[] = [];
    const keywords = this.extractKeywords(query, context);

    for (const [category, sites] of Object.entries(this.platforms)) {
      for (const site of sites) {
        for (const keyword of keywords) {
          if (keyword.length > 2) {
            urls.push(
              `https://${site}/search?q=${encodeURIComponent(keyword)}`
            );
            urls.push(`https://${site}/${encodeURIComponent(keyword)}`);
          }
        }
      }
    }

    return urls;
  }

  private extractKeywords(query: string, context?: any): string[] {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 2);

    if (context?.industry) {
      keywords.push(context.industry.toLowerCase());
    }

    if (context?.companyName) {
      keywords.push(context.companyName.toLowerCase());
    }

    return [...new Set(keywords)];
  }
}

// ============================================================================
// SITEMAP DISCOVERY
// ============================================================================

export class SitemapDiscovery implements DiscoveryStrategy {
  name = "sitemap";
  priority = 3;

  async discover(query: string, context?: any): Promise<string[]> {
    const urls: string[] = [];

    if (!context?.baseUrls) return urls;

    for (const baseUrl of context.baseUrls) {
      try {
        const sitemapUrls = await this.discoverSitemaps(baseUrl);
        urls.push(...sitemapUrls);
      } catch (error) {
        console.warn(`Failed to discover sitemaps for ${baseUrl}:`, error);
      }
    }

    return urls;
  }

  private async discoverSitemaps(baseUrl: string): Promise<string[]> {
    const sitemapUrls: string[] = [];

    try {
      const url = new URL(baseUrl);
      const commonSitemapPaths = [
        "/sitemap.xml",
        "/sitemap_index.xml",
        "/sitemap/sitemap.xml",
        "/robots.txt",
      ];

      for (const path of commonSitemapPaths) {
        const sitemapUrl = `${url.protocol}//${url.host}${path}`;
        sitemapUrls.push(sitemapUrl);
      }

      // Also try to find sitemap in robots.txt
      const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
      sitemapUrls.push(robotsUrl);
    } catch (error) {
      console.warn(`Invalid base URL: ${baseUrl}`);
    }

    return sitemapUrls;
  }
}

// ============================================================================
// LINK DISCOVERY
// ============================================================================

export class LinkDiscovery implements DiscoveryStrategy {
  name = "link-discovery";
  priority = 4;

  constructor(private crawler: WebCrawler) {}

  async discover(query: string, context?: any): Promise<string[]> {
    const urls: string[] = [];

    if (!context?.seedUrls) return urls;

    for (const seedUrl of context.seedUrls.slice(0, 5)) {
      // Limit to avoid too many requests
      try {
        const discoveredUrls = await this.discoverFromPage(seedUrl, query);
        urls.push(...discoveredUrls);
      } catch (error) {
        console.warn(`Failed to discover links from ${seedUrl}:`, error);
      }
    }

    return urls;
  }

  private async discoverFromPage(
    url: string,
    query: string
  ): Promise<string[]> {
    const result = await this.crawler.crawl(url);
    if (!result.success || !result.parsedContent) return [];

    const discoveredUrls: string[] = [];
    const queryKeywords = query.toLowerCase().split(/\s+/);

    if (result.parsedContent.type === "html") {
      const links = result.parsedContent.data.links || [];

      for (const link of links) {
        if (this.isRelevantLink(link, queryKeywords)) {
          discoveredUrls.push(link.href);
        }
      }
    }

    return discoveredUrls;
  }

  private isRelevantLink(link: any, keywords: string[]): boolean {
    const href = link.href?.toLowerCase() || "";
    const text = link.text?.toLowerCase() || "";

    // Skip internal links, ads, and non-relevant content
    if (
      href.includes("#") ||
      href.includes("javascript:") ||
      href.includes("mailto:")
    ) {
      return false;
    }

    // Check if link text or URL contains relevant keywords
    for (const keyword of keywords) {
      if (
        keyword.length > 2 &&
        (href.includes(keyword) || text.includes(keyword))
      ) {
        return true;
      }
    }

    return false;
  }
}

// ============================================================================
// API DISCOVERY
// ============================================================================

export class APIDiscovery implements DiscoveryStrategy {
  name = "api-discovery";
  priority = 5;

  async discover(query: string, context?: any): Promise<string[]> {
    const urls: string[] = [];

    if (!context?.baseUrls) return urls;

    for (const baseUrl of context.baseUrls) {
      const apiUrls = this.generateAPIUrls(baseUrl);
      urls.push(...apiUrls);
    }

    return urls;
  }

  private generateAPIUrls(baseUrl: string): string[] {
    const apiUrls: string[] = [];

    try {
      const url = new URL(baseUrl);
      const commonAPIPaths = [
        "/api",
        "/api/v1",
        "/api/v2",
        "/rest",
        "/graphql",
        "/swagger",
        "/openapi",
        "/docs",
        "/documentation",
      ];

      for (const path of commonAPIPaths) {
        apiUrls.push(`${url.protocol}//${url.host}${path}`);
      }
    } catch (error) {
      console.warn(`Invalid base URL: ${baseUrl}`);
    }

    return apiUrls;
  }
}

// ============================================================================
// RSS DISCOVERY
// ============================================================================

export class RSSDiscovery implements DiscoveryStrategy {
  name = "rss-discovery";
  priority = 6;

  async discover(query: string, context?: any): Promise<string[]> {
    const urls: string[] = [];

    if (!context?.baseUrls) return urls;

    for (const baseUrl of context.baseUrls) {
      const rssUrls = this.generateRSSUrls(baseUrl);
      urls.push(...rssUrls);
    }

    return urls;
  }

  private generateRSSUrls(baseUrl: string): string[] {
    const rssUrls: string[] = [];

    try {
      const url = new URL(baseUrl);
      const commonRSSPaths = [
        "/rss",
        "/feed",
        "/rss.xml",
        "/feed.xml",
        "/atom.xml",
        "/blog/rss",
        "/news/rss",
      ];

      for (const path of commonRSSPaths) {
        rssUrls.push(`${url.protocol}//${url.host}${path}`);
      }
    } catch (error) {
      console.warn(`Invalid base URL: ${baseUrl}`);
    }

    return rssUrls;
  }
}

// ============================================================================
// MAIN URL DISCOVERY SERVICE
// ============================================================================

export class URLDiscoveryService {
  private config: DiscoveryConfig;
  private strategies: DiscoveryStrategy[];
  private crawler: WebCrawler;
  private cache: CacheManager;

  constructor(config: Partial<DiscoveryConfig> = {}) {
    this.config = { ...DEFAULT_DISCOVERY_CONFIG, ...config };
    this.crawler = new WebCrawler();
    this.cache = new CacheManager();

    this.strategies = [
      new SearchEngineDiscovery(),
      new IndustryPlatformDiscovery(),
      new SitemapDiscovery(),
      new LinkDiscovery(this.crawler),
      new APIDiscovery(),
      new RSSDiscovery(),
    ];

    // Sort strategies by priority
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  // ============================================================================
  // MAIN DISCOVERY METHOD
  // ============================================================================

  async discoverURLs(query: string, context?: any): Promise<string[]> {
    console.log(`🔍 URL Discovery: Discovering URLs for "${query}"`);

    const allUrls = new Set<string>();
    const discoveryContext = this.buildDiscoveryContext(query, context);

    // Run all discovery strategies
    for (const strategy of this.strategies) {
      try {
        console.log(`📡 Running ${strategy.name} discovery strategy...`);
        const urls = await strategy.discover(query, discoveryContext);

        // Filter and add URLs
        const filteredUrls = this.filterURLs(urls, query);
        filteredUrls.forEach((url) => allUrls.add(url));

        console.log(
          `✅ ${strategy.name}: Found ${filteredUrls.length} relevant URLs`
        );
      } catch (error) {
        console.warn(`❌ ${strategy.name} discovery failed:`, error);
      }
    }

    // Convert to array and limit results
    const result = Array.from(allUrls).slice(0, this.config.maxUrlsPerSource);

    console.log(`🎯 URL Discovery: Found ${result.length} total relevant URLs`);
    return result;
  }

  // ============================================================================
  // SPECIALIZED DISCOVERY METHODS
  // ============================================================================

  async discoverCompetitorURLs(
    companyName: string,
    industry: string
  ): Promise<string[]> {
    const queries = [
      `${companyName} competitors`,
      `${companyName} alternatives`,
      `${industry} SaaS companies`,
      `best ${industry} software`,
    ];

    const allUrls = new Set<string>();

    for (const query of queries) {
      const urls = await this.discoverURLs(query, { companyName, industry });
      urls.forEach((url) => allUrls.add(url));
    }

    return Array.from(allUrls);
  }

  async discoverMarketDataURLs(industry: string): Promise<string[]> {
    const queries = [
      `${industry} market size`,
      `${industry} industry report`,
      `${industry} market analysis`,
      `${industry} growth rate`,
      `${industry} TAM SAM SOM`,
    ];

    const allUrls = new Set<string>();

    for (const query of queries) {
      const urls = await this.discoverURLs(query, { industry });
      urls.forEach((url) => allUrls.add(url));
    }

    return Array.from(allUrls);
  }

  async discoverReviewURLs(companyName: string): Promise<string[]> {
    const queries = [
      `${companyName} reviews`,
      `${companyName} customer feedback`,
      `${companyName} ratings`,
      `${companyName} pros cons`,
    ];

    const allUrls = new Set<string>();

    for (const query of queries) {
      const urls = await this.discoverURLs(query, { companyName });
      urls.forEach((url) => allUrls.add(url));
    }

    return Array.from(allUrls);
  }

  async discoverTechnologyURLs(industry: string): Promise<string[]> {
    const queries = [
      `${industry} technology trends`,
      `${industry} tech stack`,
      `${industry} emerging technologies`,
      `${industry} technical requirements`,
    ];

    const allUrls = new Set<string>();

    for (const query of queries) {
      const urls = await this.discoverURLs(query, { industry });
      urls.forEach((url) => allUrls.add(url));
    }

    return Array.from(allUrls);
  }

  // ============================================================================
  // URL VALIDATION AND FILTERING
  // ============================================================================

  private filterURLs(urls: string[], query: string): string[] {
    const filtered: string[] = [];
    const queryKeywords = query.toLowerCase().split(/\s+/);

    for (const url of urls) {
      if (this.isValidURL(url) && this.isRelevantURL(url, queryKeywords)) {
        filtered.push(url);
      }
    }

    return filtered;
  }

  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isRelevantURL(url: string, keywords: string[]): boolean {
    const urlLower = url.toLowerCase();

    // Skip common non-relevant patterns
    const skipPatterns = [
      "google.com/search",
      "bing.com/search",
      "duckduckgo.com",
      "youtube.com",
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "linkedin.com/feed",
      "mailto:",
      "tel:",
      "javascript:",
      "#",
    ];

    for (const pattern of skipPatterns) {
      if (urlLower.includes(pattern)) {
        return false;
      }
    }

    // Check if URL contains relevant keywords
    for (const keyword of keywords) {
      if (keyword.length > 2 && urlLower.includes(keyword)) {
        return true;
      }
    }

    // Check for SaaS-relevant domains
    const saasDomains = [
      "saas",
      "software",
      "platform",
      "tool",
      "app",
      "cloud",
      "g2.com",
      "capterra.com",
      "producthunt.com",
      "crunchbase.com",
      "techcrunch.com",
      "venturebeat.com",
      "gartner.com",
      "forrester.com",
    ];

    for (const domain of saasDomains) {
      if (urlLower.includes(domain)) {
        return true;
      }
    }

    return false;
  }

  // ============================================================================
  // CONTEXT BUILDING
  // ============================================================================

  private buildDiscoveryContext(query: string, context?: any): any {
    const baseContext = {
      query,
      timestamp: new Date(),
      ...context,
    };

    // Extract potential base URLs from context
    if (context?.companyName) {
      baseContext.baseUrls = this.generateBaseUrls(context.companyName);
    }

    if (context?.industry) {
      baseContext.seedUrls = this.generateSeedUrls(context.industry);
    }

    return baseContext;
  }

  private generateBaseUrls(companyName: string): string[] {
    const domains = [
      `${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
      `${companyName.toLowerCase().replace(/\s+/g, "")}.io`,
      `${companyName.toLowerCase().replace(/\s+/g, "")}.co`,
    ];

    return domains.map((domain) => `https://${domain}`);
  }

  private generateSeedUrls(industry: string): string[] {
    const industryLower = industry.toLowerCase();
    return [
      `https://g2.com/categories/${industryLower}`,
      `https://capterra.com/categories/${industryLower}`,
      `https://producthunt.com/topics/${industryLower}`,
      `https://crunchbase.com/hub/${industryLower}`,
    ];
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getDiscoveryStats(): {
    strategiesCount: number;
    config: DiscoveryConfig;
  } {
    return {
      strategiesCount: this.strategies.length,
      config: this.config,
    };
  }

  destroy(): void {
    this.cache.destroy();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default URLDiscoveryService;
