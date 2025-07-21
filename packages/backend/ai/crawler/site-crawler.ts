import { WebCrawler, CrawlResult } from "./web-crawler";
import { CacheManager } from "./cache-manager";
import { SaasDataExtractor } from "./data-extractors";

// ============================================================================
// SITE CRAWLER CONFIGURATION
// ============================================================================

interface SiteCrawlerConfig {
  maxDepth: number;
  maxPages: number;
  maxConcurrent: number;
  respectRobotsTxt: boolean;
  followExternalLinks: boolean;
  crawlDelay: number;
  timeout: number;
  userAgent: string;
  enableDataDetection: boolean;
  dataDetectionThreshold: number;
}

const DEFAULT_SITE_CONFIG: SiteCrawlerConfig = {
  maxDepth: 3,
  maxPages: 100,
  maxConcurrent: 5,
  respectRobotsTxt: true,
  followExternalLinks: false,
  crawlDelay: 1000,
  timeout: 30000,
  userAgent: "SiteCrawler/1.0",
  enableDataDetection: true,
  dataDetectionThreshold: 0.7,
};

// ============================================================================
// PAGE DATA TYPES
// ============================================================================

export interface PageData {
  url: string;
  title: string;
  description?: string;
  dataTypes: DataType[];
  confidence: number;
  lastModified?: Date;
  crawlDepth: number;
  parentUrl?: string;
}

export interface DataType {
  type:
    | "pricing"
    | "company"
    | "features"
    | "reviews"
    | "contact"
    | "about"
    | "blog"
    | "docs"
    | "api";
  confidence: number;
  indicators: string[];
  extractedData?: any;
}

export interface SiteMap {
  baseUrl: string;
  pages: PageData[];
  dataTypeSummary: Record<string, number>;
  crawlStats: {
    totalPages: number;
    successfulCrawls: number;
    failedCrawls: number;
    averageDepth: number;
    crawlTime: number;
  };
}

// ============================================================================
// DATA DETECTION PATTERNS
// ============================================================================

const DATA_DETECTION_PATTERNS = {
  pricing: {
    urlPatterns: [
      /pricing/i,
      /prices/i,
      /plans/i,
      /subscription/i,
      /billing/i,
      /cost/i,
      /price/i,
    ],
    contentPatterns: [
      /\$\d+/g,
      /per month/i,
      /per year/i,
      /annual/i,
      /monthly/i,
      /pricing/i,
      /plans/i,
      /subscription/i,
      /billing/i,
      /cost/i,
      /price/i,
    ],
    keywords: [
      "pricing",
      "price",
      "plans",
      "subscription",
      "billing",
      "cost",
      "monthly",
      "annual",
      "yearly",
      "pro",
      "enterprise",
      "starter",
      "basic",
      "premium",
      "free",
      "trial",
      "dollars",
      "euros",
    ],
  },
  company: {
    urlPatterns: [
      /about/i,
      /company/i,
      /team/i,
      /leadership/i,
      /careers/i,
      /jobs/i,
      /mission/i,
      /vision/i,
    ],
    contentPatterns: [
      /about us/i,
      /our company/i,
      /our team/i,
      /leadership/i,
      /mission/i,
      /vision/i,
      /founded/i,
      /established/i,
      /headquarters/i,
      /office/i,
    ],
    keywords: [
      "about",
      "company",
      "team",
      "leadership",
      "mission",
      "vision",
      "founded",
      "established",
      "headquarters",
      "office",
      "careers",
      "jobs",
      "culture",
      "values",
      "story",
      "history",
    ],
  },
  features: {
    urlPatterns: [
      /features/i,
      /product/i,
      /solutions/i,
      /capabilities/i,
      /functionality/i,
      /tools/i,
    ],
    contentPatterns: [
      /features/i,
      /capabilities/i,
      /functionality/i,
      /tools/i,
      /solutions/i,
      /product/i,
      /what you can do/i,
      /key features/i,
    ],
    keywords: [
      "features",
      "capabilities",
      "functionality",
      "tools",
      "solutions",
      "product",
      "what you can do",
      "key features",
      "benefits",
      "advantages",
      "capabilities",
      "functions",
    ],
  },
  reviews: {
    urlPatterns: [
      /reviews/i,
      /testimonials/i,
      /customers/i,
      /case-studies/i,
      /success-stories/i,
      /feedback/i,
    ],
    contentPatterns: [
      /reviews/i,
      /testimonials/i,
      /customers/i,
      /case studies/i,
      /success stories/i,
      /feedback/i,
      /what customers say/i,
      /customer stories/i,
    ],
    keywords: [
      "reviews",
      "testimonials",
      "customers",
      "case studies",
      "success stories",
      "feedback",
      "what customers say",
      "customer stories",
      "ratings",
      "stars",
    ],
  },
  contact: {
    urlPatterns: [
      /contact/i,
      /support/i,
      /help/i,
      /get-in-touch/i,
      /reach-us/i,
    ],
    contentPatterns: [
      /contact us/i,
      /get in touch/i,
      /reach us/i,
      /support/i,
      /help/i,
      /email/i,
      /phone/i,
      /address/i,
    ],
    keywords: [
      "contact",
      "support",
      "help",
      "get in touch",
      "reach us",
      "email",
      "phone",
      "address",
      "location",
      "office",
    ],
  },
  about: {
    urlPatterns: [/about/i, /who-we-are/i, /our-story/i, /mission/i],
    contentPatterns: [
      /about us/i,
      /who we are/i,
      /our story/i,
      /mission/i,
      /vision/i,
      /values/i,
    ],
    keywords: [
      "about",
      "who we are",
      "our story",
      "mission",
      "vision",
      "values",
      "culture",
      "team",
      "leadership",
    ],
  },
  blog: {
    urlPatterns: [/blog/i, /news/i, /articles/i, /insights/i, /resources/i],
    contentPatterns: [
      /blog/i,
      /news/i,
      /articles/i,
      /insights/i,
      /resources/i,
      /latest/i,
      /updates/i,
    ],
    keywords: [
      "blog",
      "news",
      "articles",
      "insights",
      "resources",
      "latest",
      "updates",
      "posts",
      "content",
    ],
  },
  docs: {
    urlPatterns: [
      /docs/i,
      /documentation/i,
      /help/i,
      /guides/i,
      /tutorials/i,
      /api/i,
    ],
    contentPatterns: [
      /documentation/i,
      /docs/i,
      /help/i,
      /guides/i,
      /tutorials/i,
      /api/i,
      /reference/i,
    ],
    keywords: [
      "documentation",
      "docs",
      "help",
      "guides",
      "tutorials",
      "api",
      "reference",
      "manual",
      "guide",
    ],
  },
  api: {
    urlPatterns: [/api/i, /developers/i, /developer/i, /integrations/i, /sdk/i],
    contentPatterns: [
      /api/i,
      /developers/i,
      /developer/i,
      /integrations/i,
      /sdk/i,
      /endpoints/i,
      /authentication/i,
    ],
    keywords: [
      "api",
      "developers",
      "developer",
      "integrations",
      "sdk",
      "endpoints",
      "authentication",
      "webhooks",
      "rest",
    ],
  },
};

// ============================================================================
// MAIN SITE CRAWLER CLASS
// ============================================================================

export class SiteCrawler {
  private config: SiteCrawlerConfig;
  private crawler: WebCrawler;
  private cache: CacheManager;
  private crawledUrls: Set<string> = new Set();
  private queue: Array<{ url: string; depth: number; parentUrl?: string }> = [];
  private activeCrawls = 0;
  private startTime: number = 0;

  constructor(config: Partial<SiteCrawlerConfig> = {}) {
    this.config = { ...DEFAULT_SITE_CONFIG, ...config };
    this.crawler = new WebCrawler({
      maxRetries: 3,
      retryDelay: 2000,
      timeout: this.config.timeout,
      rateLimit: this.config.crawlDelay,
      userAgents: [this.config.userAgent],
      maxConcurrent: this.config.maxConcurrent,
      respectRobotsTxt: this.config.respectRobotsTxt,
    });
    this.cache = new CacheManager();
  }

  // ============================================================================
  // MAIN CRAWL METHOD
  // ============================================================================

  async crawlSite(baseUrl: string): Promise<SiteMap> {
    console.log(`🌐 Starting site crawl for: ${baseUrl}`);
    this.startTime = Date.now();

    // Normalize base URL
    const normalizedUrl = this.normalizeUrl(baseUrl);
    const baseDomain = new URL(normalizedUrl).hostname;

    // Initialize queue with base URL
    this.queue.push({ url: normalizedUrl, depth: 0 });
    this.crawledUrls.add(normalizedUrl);

    const pages: PageData[] = [];

    // Process queue
    while (this.queue.length > 0 && pages.length < this.config.maxPages) {
      const batch = this.queue.splice(0, this.config.maxConcurrent);

      const batchPromises = batch.map((item) =>
        this.processPage(item, baseDomain)
      );
      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value) {
          pages.push(result.value);

          // Add discovered links to queue
          if (result.value.links && result.value.depth < this.config.maxDepth) {
            this.addLinksToQueue(
              result.value.links,
              result.value.url,
              result.value.depth + 1,
              baseDomain
            );
          }
        }
      }
    }

    const crawlTime = Date.now() - this.startTime;
    const successfulCrawls = pages.length;
    const failedCrawls = this.crawledUrls.size - successfulCrawls;
    const averageDepth =
      pages.reduce((sum, page) => sum + page.crawlDepth, 0) / pages.length;

    // Generate data type summary
    const dataTypeSummary = this.generateDataTypeSummary(pages);

    const siteMap: SiteMap = {
      baseUrl: normalizedUrl,
      pages,
      dataTypeSummary,
      crawlStats: {
        totalPages: this.crawledUrls.size,
        successfulCrawls,
        failedCrawls,
        averageDepth,
        crawlTime,
      },
    };

    console.log(`✅ Site crawl completed in ${crawlTime}ms`);
    console.log(
      `📊 Crawled ${successfulCrawls} pages, found ${Object.keys(dataTypeSummary).length} data types`
    );

    return siteMap;
  }

  // ============================================================================
  // PAGE PROCESSING
  // ============================================================================

  private async processPage(
    item: { url: string; depth: number; parentUrl?: string },
    baseDomain: string
  ): Promise<PageData | null> {
    try {
      const { url, depth, parentUrl } = item;

      // Check cache first
      const cached = await this.cache.get(url);
      if (cached) {
        return this.createPageData(url, cached, depth, parentUrl);
      }

      // Crawl the page
      const crawlResult = await this.crawler.crawl(url);
      if (!crawlResult.success) {
        console.warn(`❌ Failed to crawl ${url}: ${crawlResult.error}`);
        return null;
      }

      // Cache the result
      await this.cache.set(url, crawlResult);

      // Create page data
      const pageData = this.createPageData(url, crawlResult, depth, parentUrl);

      // Extract links if it's HTML content
      if (crawlResult.parsedContent?.type === "html") {
        pageData.links = this.extractLinks(
          crawlResult.parsedContent.data.links || [],
          baseDomain
        );
      }

      return pageData;
    } catch (error) {
      console.warn(`❌ Error processing ${item.url}:`, error);
      return null;
    }
  }

  private createPageData(
    url: string,
    crawlResult: CrawlResult,
    depth: number,
    parentUrl?: string
  ): PageData {
    const title = this.extractTitle(crawlResult);
    const description = this.extractDescription(crawlResult);
    const dataTypes = this.detectDataTypes(url, crawlResult);
    const confidence = this.calculateConfidence(dataTypes);

    return {
      url,
      title,
      description,
      dataTypes,
      confidence,
      lastModified: new Date(),
      crawlDepth: depth,
      parentUrl,
    };
  }

  // ============================================================================
  // DATA TYPE DETECTION
  // ============================================================================

  private detectDataTypes(url: string, crawlResult: CrawlResult): DataType[] {
    if (!this.config.enableDataDetection) return [];

    const dataTypes: DataType[] = [];
    const urlLower = url.toLowerCase();
    const content = this.extractTextContent(crawlResult);
    const contentLower = content.toLowerCase();

    for (const [type, patterns] of Object.entries(DATA_DETECTION_PATTERNS)) {
      const indicators: string[] = [];
      let confidence = 0;

      // Check URL patterns
      for (const pattern of patterns.urlPatterns) {
        if (pattern.test(urlLower)) {
          confidence += 0.3;
          indicators.push(`URL pattern: ${pattern.source}`);
        }
      }

      // Check content patterns
      for (const pattern of patterns.contentPatterns) {
        const matches = contentLower.match(pattern);
        if (matches) {
          confidence += 0.2;
          indicators.push(
            `Content pattern: ${pattern.source} (${matches.length} matches)`
          );
        }
      }

      // Check keywords
      for (const keyword of patterns.keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          confidence += 0.1;
          indicators.push(`Keyword: ${keyword}`);
        }
      }

      // Additional confidence for specific data types
      if (type === "pricing" && this.hasPricingData(content)) {
        confidence += 0.3;
        indicators.push("Pricing data detected");
      }

      if (type === "company" && this.hasCompanyData(content)) {
        confidence += 0.3;
        indicators.push("Company data detected");
      }

      if (type === "features" && this.hasFeatureData(content)) {
        confidence += 0.3;
        indicators.push("Feature data detected");
      }

      // Normalize confidence to 0-1 range
      confidence = Math.min(confidence, 1);

      if (confidence >= this.config.dataDetectionThreshold) {
        dataTypes.push({
          type: type as any,
          confidence,
          indicators,
        });
      }
    }

    return dataTypes.sort((a, b) => b.confidence - a.confidence);
  }

  private hasPricingData(content: string): boolean {
    const pricingIndicators = [
      /\$\d+/, // Dollar amounts
      /\d+\s*(?:USD|EUR|GBP)/i, // Currency codes
      /per\s+(?:month|year|day)/i, // Time periods
      /subscription/i,
      /billing/i,
      /pricing/i,
    ];

    return pricingIndicators.some((pattern) => pattern.test(content));
  }

  private hasCompanyData(content: string): boolean {
    const companyIndicators = [
      /founded\s+in/i,
      /established\s+in/i,
      /headquarters/i,
      /office/i,
      /team/i,
      /leadership/i,
      /mission/i,
      /vision/i,
    ];

    return companyIndicators.some((pattern) => pattern.test(content));
  }

  private hasFeatureData(content: string): boolean {
    const featureIndicators = [
      /features/i,
      /capabilities/i,
      /functionality/i,
      /tools/i,
      /solutions/i,
      /benefits/i,
      /advantages/i,
    ];

    return featureIndicators.some((pattern) => pattern.test(content));
  }

  private calculateConfidence(dataTypes: DataType[]): number {
    if (dataTypes.length === 0) return 0;
    return (
      dataTypes.reduce((sum, dt) => sum + dt.confidence, 0) / dataTypes.length
    );
  }

  // ============================================================================
  // LINK EXTRACTION AND PROCESSING
  // ============================================================================

  private extractLinks(links: any[], baseDomain: string): string[] {
    const validLinks: string[] = [];

    for (const link of links) {
      if (!link.href) continue;

      try {
        const url = new URL(link.href, `https://${baseDomain}`);

        // Only include links from the same domain
        if (url.hostname === baseDomain) {
          const normalizedUrl = this.normalizeUrl(url.toString());
          if (!this.crawledUrls.has(normalizedUrl)) {
            validLinks.push(normalizedUrl);
          }
        }
      } catch (error) {
        // Skip invalid URLs
        continue;
      }
    }

    return [...new Set(validLinks)]; // Remove duplicates
  }

  private addLinksToQueue(
    links: string[],
    parentUrl: string,
    depth: number,
    baseDomain: string
  ) {
    for (const link of links) {
      if (!this.crawledUrls.has(link)) {
        this.crawledUrls.add(link);
        this.queue.push({ url: link, depth, parentUrl });
      }
    }
  }

  // ============================================================================
  // CONTENT EXTRACTION
  // ============================================================================

  private extractTitle(crawlResult: CrawlResult): string {
    if (crawlResult.parsedContent?.type === "html") {
      return crawlResult.parsedContent.data.metadata?.title || "";
    }
    return "";
  }

  private extractDescription(crawlResult: CrawlResult): string {
    if (crawlResult.parsedContent?.type === "html") {
      return crawlResult.parsedContent.data.metadata?.description || "";
    }
    return "";
  }

  private extractTextContent(crawlResult: CrawlResult): string {
    if (crawlResult.parsedContent?.type === "html") {
      return crawlResult.parsedContent.data.text || "";
    }
    return "";
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      // If it's a relative URL, assume it's relative to the base
      return url;
    }
  }

  private generateDataTypeSummary(pages: PageData[]): Record<string, number> {
    const summary: Record<string, number> = {};

    for (const page of pages) {
      for (const dataType of page.dataTypes) {
        summary[dataType.type] = (summary[dataType.type] || 0) + 1;
      }
    }

    return summary;
  }

  // ============================================================================
  // SPECIALIZED METHODS
  // ============================================================================

  async findPagesByDataType(
    baseUrl: string,
    dataType: string
  ): Promise<PageData[]> {
    const siteMap = await this.crawlSite(baseUrl);
    return siteMap.pages.filter((page) =>
      page.dataTypes.some((dt) => dt.type === dataType)
    );
  }

  async extractSaaSDataFromSite(baseUrl: string): Promise<any[]> {
    const siteMap = await this.crawlSite(baseUrl);
    const relevantPages = siteMap.pages.filter((page) =>
      page.dataTypes.some((dt) =>
        ["pricing", "company", "features", "reviews"].includes(dt.type)
      )
    );

    const extractedData = [];

    for (const page of relevantPages) {
      try {
        const crawlResult = await this.crawler.crawl(page.url);
        if (crawlResult.success) {
          const data = SaasDataExtractor.extractAll(crawlResult);
          if (data) {
            extractedData.push({
              url: page.url,
              pageData: page,
              extractedData: data,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to extract data from ${page.url}:`, error);
      }
    }

    return extractedData;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    this.cache.destroy();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default SiteCrawler;
