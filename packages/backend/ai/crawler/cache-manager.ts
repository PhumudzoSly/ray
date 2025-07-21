import { CrawlResult } from "./web-crawler";
import { SaasDataExtractor } from "./data-extractors";

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

interface CacheConfig {
  maxSize: number; // Maximum number of cached items
  ttl: number; // Time to live in milliseconds (24 hours default)
  cleanupInterval: number; // Cleanup interval in milliseconds
  persistToDatabase: boolean; // Whether to persist cache to database
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 1000,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  persistToDatabase: true,
};

// ============================================================================
// CACHE ENTRY INTERFACE
// ============================================================================

interface CacheEntry {
  url: string;
  crawlResult: CrawlResult;
  extractedData?: any;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

// ============================================================================
// CACHE MANAGER CLASS
// ============================================================================

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.startCleanupTimer();
  }

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  async get(url: string): Promise<CrawlResult | null> {
    const normalizedUrl = this.normalizeUrl(url);
    const entry = this.cache.get(normalizedUrl);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(normalizedUrl);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.crawlResult;
  }

  async set(
    url: string,
    crawlResult: CrawlResult,
    extractedData?: any
  ): Promise<void> {
    const normalizedUrl = this.normalizeUrl(url);

    // Check if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      url: normalizedUrl,
      crawlResult,
      extractedData,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(normalizedUrl, entry);

    // Persist to database if enabled
    if (this.config.persistToDatabase) {
      await this.persistToDatabase(entry);
    }
  }

  async getWithExtraction(
    url: string
  ): Promise<{ crawlResult: CrawlResult; extractedData: any } | null> {
    const normalizedUrl = this.normalizeUrl(url);
    const entry = this.cache.get(normalizedUrl);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(normalizedUrl);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    // Extract data if not already extracted
    if (!entry.extractedData && entry.crawlResult.success) {
      entry.extractedData = SaasDataExtractor.extractAll(entry.crawlResult);
    }

    return {
      crawlResult: entry.crawlResult,
      extractedData: entry.extractedData,
    };
  }

  async has(url: string): Promise<boolean> {
    const normalizedUrl = this.normalizeUrl(url);
    const entry = this.cache.get(normalizedUrl);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(normalizedUrl);
      return false;
    }

    return true;
  }

  async delete(url: string): Promise<boolean> {
    const normalizedUrl = this.normalizeUrl(url);
    return this.cache.delete(normalizedUrl);
  }

  async clear(): Promise<void> {
    this.cache.clear();

    // Clear from database if enabled
    if (this.config.persistToDatabase) {
      await this.clearDatabase();
    }
  }

  // ============================================================================
  // CACHE STATISTICS
  // ============================================================================

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );
    const totalMisses = this.totalMisses || 0;
    const hitRate =
      totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate,
      totalHits,
      totalMisses,
      oldestEntry:
        entries.length > 0
          ? new Date(Math.min(...entries.map((e) => e.timestamp)))
          : null,
      newestEntry:
        entries.length > 0
          ? new Date(Math.max(...entries.map((e) => e.timestamp)))
          : null,
    };
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async getBatch(urls: string[]): Promise<Map<string, CrawlResult>> {
    const results = new Map<string, CrawlResult>();

    for (const url of urls) {
      const result = await this.get(url);
      if (result) {
        results.set(url, result);
      }
    }

    return results;
  }

  async setBatch(
    entries: Array<{
      url: string;
      crawlResult: CrawlResult;
      extractedData?: any;
    }>
  ): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.url, entry.crawlResult, entry.extractedData);
    }
  }

  // ============================================================================
  // SEARCH AND FILTER
  // ============================================================================

  async search(query: string): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const entry of this.cache.values()) {
      if (this.matchesQuery(entry, query)) {
        results.push(entry.crawlResult);
      }
    }

    return results;
  }

  async filterByDomain(domain: string): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const entry of this.cache.values()) {
      if (entry.url.includes(domain)) {
        results.push(entry.crawlResult);
      }
    }

    return results;
  }

  async filterByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const entry of this.cache.values()) {
      const entryDate = new Date(entry.timestamp);
      if (entryDate >= startDate && entryDate <= endDate) {
        results.push(entry.crawlResult);
      }
    }

    return results;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.config.ttl;
  }

  private evictOldest(): void {
    let oldestEntry: CacheEntry | null = null;
    let oldestKey: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed) {
        oldestEntry = entry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
  }

  private matchesQuery(entry: CacheEntry, query: string): boolean {
    const searchText = query.toLowerCase();

    // Search in URL
    if (entry.url.toLowerCase().includes(searchText)) {
      return true;
    }

    // Search in crawl result content
    if (
      entry.crawlResult.parsedContent?.text?.toLowerCase().includes(searchText)
    ) {
      return true;
    }

    // Search in extracted data
    if (entry.extractedData) {
      const extractedText = JSON.stringify(entry.extractedData).toLowerCase();
      if (extractedText.includes(searchText)) {
        return true;
      }
    }

    return false;
  }

  // ============================================================================
  // DATABASE PERSISTENCE (PLACEHOLDER)
  // ============================================================================

  private async persistToDatabase(entry: CacheEntry): Promise<void> {
    // TODO: Implement database persistence
    // This would save the cache entry to a database table
    // for persistence across application restarts
    console.log(`Persisting cache entry for ${entry.url} to database`);
  }

  private async clearDatabase(): Promise<void> {
    // TODO: Implement database clearing
    console.log("Clearing cache from database");
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

export class CacheUtils {
  static generateCacheKey(url: string, options?: any): string {
    const normalizedUrl = new URL(url).toString();
    const optionsHash = options ? JSON.stringify(options) : "";
    return `${normalizedUrl}:${optionsHash}`;
  }

  static estimateCacheSize(entry: CacheEntry): number {
    // Rough estimation of memory usage
    let size = 0;

    // URL
    size += entry.url.length * 2; // UTF-16

    // Crawl result
    size += entry.crawlResult.content.length * 2;
    size += JSON.stringify(entry.crawlResult.headers).length * 2;

    // Extracted data
    if (entry.extractedData) {
      size += JSON.stringify(entry.extractedData).length * 2;
    }

    // Metadata
    size += 100; // Timestamps, counters, etc.

    return size;
  }

  static getRecommendedCacheSize(): number {
    // Recommend cache size based on available memory
    const memoryLimit = 100 * 1024 * 1024; // 100MB
    const averageEntrySize = 50 * 1024; // 50KB per entry
    return Math.floor(memoryLimit / averageEntrySize);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default CacheManager;
