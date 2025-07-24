// ============================================================================
// CRAWLER SYSTEM EXPORTS
// ============================================================================

// Core crawler
export { WebCrawler } from "./web-crawler";
export type { CrawlOptions, CrawlResult, ParsedContent } from "./web-crawler";

// Data extractors
export {
  SaasDataExtractor,
  CompanyDataExtractor,
  PricingDataExtractor,
  FeatureDataExtractor,
  MarketDataExtractor,
  ReviewDataExtractor,
} from "./data-extractors";
export type {
  SaasCompanyData,
  SaasPricingData,
  SaasFeatureData,
  SaasMarketData,
  SaasReviewData,
} from "./data-extractors";

// Cache management
export { CacheManager, CacheUtils } from "./cache-manager";

// Search service (no circular dependencies)
export { SearchService } from "./search-service";
export type { SearchResult, SearchQuery } from "./search-service";

// URL discovery service
export { URLDiscoveryService, type DiscoveryStrategy } from "./url-discovery";

// Site crawler service
export { SiteCrawler } from "./site-crawler";
export type { SiteMap, PageData, DataType } from "./site-crawler";

// ============================================================================
// UNIFIED CRAWLER SERVICE
// ============================================================================

import { WebCrawler } from "./web-crawler";
import { CacheManager } from "./cache-manager";
import { SaasDataExtractor } from "./data-extractors";
import { URLDiscoveryService } from "./url-discovery";
import { SiteCrawler } from "./site-crawler";
import { SearchService } from "./search-service";

export class UnifiedCrawlerService {
  private crawler: WebCrawler;
  private cache: CacheManager;
  private searchService: SearchService;
  private discoveryService: URLDiscoveryService;
  private siteCrawler: SiteCrawler;

  constructor() {
    this.crawler = new WebCrawler();
    this.cache = new CacheManager();
    this.searchService = new SearchService();
    this.discoveryService = new URLDiscoveryService();
    this.siteCrawler = new SiteCrawler();
  }

  // ============================================================================
  // CRAWLING METHODS
  // ============================================================================

  async crawl(url: string, options?: any) {
    return this.crawler.crawl(url, options);
  }

  async crawlBatch(urls: string[], options?: any) {
    return this.crawler.crawlBatch(urls, options);
  }

  // ============================================================================
  // SEARCH METHODS (Using SearchService to avoid circular dependencies)
  // ============================================================================

  async search(query: string, options?: any) {
    return this.searchService.search(query, options);
  }

  async searchCompetitors(companyName: string, industry: string) {
    return this.searchService.searchCompetitors(companyName, industry);
  }

  async searchMarketData(industry: string) {
    return this.searchService.searchMarketData(industry);
  }

  async searchCustomerReviews(companyName: string) {
    return this.searchService.searchCustomerReviews(companyName);
  }

  // ============================================================================
  // URL DISCOVERY METHODS
  // ============================================================================

  async discoverURLs(query: string, context?: any) {
    return this.discoveryService.discoverURLs(query, context);
  }

  async discoverCompetitorURLs(companyName: string, industry: string) {
    return this.discoveryService.discoverCompetitorURLs(companyName, industry);
  }

  async discoverMarketDataURLs(industry: string) {
    return this.discoveryService.discoverMarketDataURLs(industry);
  }

  async discoverReviewURLs(companyName: string) {
    return this.discoveryService.discoverReviewURLs(companyName);
  }

  async discoverTechnologyURLs(industry: string) {
    return this.discoveryService.discoverTechnologyURLs(industry);
  }

  // ============================================================================
  // SITE CRAWLING METHODS
  // ============================================================================

  async crawlSite(baseUrl: string, options?: any) {
    return this.siteCrawler.crawlSite(baseUrl);
  }

  async findPagesByDataType(baseUrl: string, dataType: string) {
    return this.siteCrawler.findPagesByDataType(baseUrl, dataType);
  }

  async extractSaaSDataFromSite(baseUrl: string) {
    return this.siteCrawler.extractSaaSDataFromSite(baseUrl);
  }

  // ============================================================================
  // DATA EXTRACTION METHODS
  // ============================================================================

  async extractSaaSData(url: string) {
    const crawlResult = await this.crawl(url);
    if (crawlResult.success) {
      return SaasDataExtractor.extractAll(crawlResult);
    }
    return null;
  }

  async extractSaaSDataBatch(urls: string[]) {
    const crawlResults = await this.crawlBatch(urls);
    const extractedData = [];

    for (const result of crawlResults) {
      if (result.success) {
        const data = SaasDataExtractor.extractAll(result);
        if (data) {
          extractedData.push({
            url: result.url,
            data,
          });
        }
      }
    }

    return extractedData;
  }

  // ============================================================================
  // CACHE METHODS
  // ============================================================================

  async getCached(url: string) {
    return this.cache.get(url);
  }

  async setCached(url: string, data: any) {
    return this.cache.set(url, data);
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    return this.cache.clear();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  destroy() {
    this.cache.destroy();
    this.searchService.destroy();
    this.discoveryService.destroy();
    this.siteCrawler.destroy();
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default UnifiedCrawlerService;
