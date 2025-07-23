import { CrawlResult } from "./web-crawler";
import { SaasDataExtractor } from "./data-extractors";

// ============================================================================
// SECURITY CONSTANTS
// ============================================================================

const CACHE_SECURITY_CONFIG = {
  MAX_CACHE_SIZE: 1000,
  MAX_ENTRY_SIZE: 5 * 1024 * 1024, // 5MB per entry
  MAX_URL_LENGTH: 2048,
  MAX_SEARCH_QUERY_LENGTH: 500,
  MAX_BATCH_SIZE: 100,
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

interface CacheConfig {
  maxSize: number; // Maximum number of cached items
  ttl: number; // Time to live in milliseconds (24 hours default)
  cleanupInterval: number; // Cleanup interval in milliseconds
  persistToDatabase: boolean; // Whether to persist cache to database
  maxEntrySize: number; // Maximum size per cache entry
  enableSecurityChecks: boolean; // Enable security validations
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: CACHE_SECURITY_CONFIG.MAX_CACHE_SIZE,
  ttl: CACHE_SECURITY_CONFIG.DEFAULT_TTL,
  cleanupInterval: CACHE_SECURITY_CONFIG.CLEANUP_INTERVAL,
  persistToDatabase: true,
  maxEntrySize: CACHE_SECURITY_CONFIG.MAX_ENTRY_SIZE,
  enableSecurityChecks: true,
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
  size: number; // Estimated size in bytes
}

// ============================================================================
// CACHE MANAGER CLASS
// ============================================================================

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private totalMisses = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.startCleanupTimer();
  }

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  async get(url: string): Promise<CrawlResult | null> {
    if (!this.validateUrl(url)) {
      return null;
    }

    const normalizedUrl = this.normalizeUrl(url);
    const entry = this.cache.get(normalizedUrl);

    if (!entry) {
      this.totalMisses++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(normalizedUrl);
      this.totalMisses++;
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
    if (!this.validateUrl(url)) {
      throw new Error("Invalid URL provided to cache");
    }

    if (!this.validateCrawlResult(crawlResult)) {
      throw new Error("Invalid crawl result provided to cache");
    }

    const normalizedUrl = this.normalizeUrl(url);
    const entrySize = this.estimateEntrySize(url, crawlResult, extractedData);

    // Check entry size limit
    if (entrySize > this.config.maxEntrySize) {
      throw new Error(
        `Cache entry too large: ${entrySize} bytes (max: ${this.config.maxEntrySize})`
      );
    }

    // Check if cache is full and evict if necessary
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
      size: entrySize,
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
    if (!this.validateUrl(url)) {
      return null;
    }

    const normalizedUrl = this.normalizeUrl(url);
    const entry = this.cache.get(normalizedUrl);

    if (!entry) {
      this.totalMisses++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(normalizedUrl);
      this.totalMisses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    // Extract data if not already extracted
    if (!entry.extractedData && entry.crawlResult.success) {
      try {
        entry.extractedData = SaasDataExtractor.extractAll(entry.crawlResult);
        // Recalculate size after extraction
        entry.size = this.estimateEntrySize(
          entry.url,
          entry.crawlResult,
          entry.extractedData
        );
      } catch (error) {
        console.warn(
          `Failed to extract data for ${url}:`,
          this.sanitizeError(error)
        );
      }
    }

    return {
      crawlResult: entry.crawlResult,
      extractedData: entry.extractedData,
    };
  }

  async has(url: string): Promise<boolean> {
    if (!this.validateUrl(url)) {
      return false;
    }

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
    if (!this.validateUrl(url)) {
      return false;
    }

    const normalizedUrl = this.normalizeUrl(url);
    return this.cache.delete(normalizedUrl);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.totalMisses = 0;

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
    totalSize: number;
    averageEntrySize: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );
    const totalMisses = this.totalMisses;
    const hitRate =
      totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const averageEntrySize =
      entries.length > 0 ? totalSize / entries.length : 0;

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
      totalSize,
      averageEntrySize,
    };
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async getBatch(urls: string[]): Promise<Map<string, CrawlResult>> {
    if (!Array.isArray(urls)) {
      throw new Error("URLs must be an array");
    }

    if (urls.length > CACHE_SECURITY_CONFIG.MAX_BATCH_SIZE) {
      throw new Error(
        `Batch too large: ${urls.length} URLs (max: ${CACHE_SECURITY_CONFIG.MAX_BATCH_SIZE})`
      );
    }

    const results = new Map<string, CrawlResult>();

    for (const url of urls) {
      if (this.validateUrl(url)) {
        const result = await this.get(url);
        if (result) {
          results.set(url, result);
        }
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
    if (!Array.isArray(entries)) {
      throw new Error("Entries must be an array");
    }

    if (entries.length > CACHE_SECURITY_CONFIG.MAX_BATCH_SIZE) {
      throw new Error(
        `Batch too large: ${entries.length} entries (max: ${CACHE_SECURITY_CONFIG.MAX_BATCH_SIZE})`
      );
    }

    for (const entry of entries) {
      if (entry.url && entry.crawlResult) {
        await this.set(entry.url, entry.crawlResult, entry.extractedData);
      }
    }
  }

  // ============================================================================
  // SEARCH AND FILTER
  // ============================================================================

  async search(query: string): Promise<CrawlResult[]> {
    if (!this.validateSearchQuery(query)) {
      return [];
    }

    const results: CrawlResult[] = [];

    for (const entry of this.cache.values()) {
      if (this.matchesQuery(entry, query)) {
        results.push(entry.crawlResult);
      }
    }

    return results.slice(0, 100); // Limit search results
  }

  async filterByDomain(domain: string): Promise<CrawlResult[]> {
    if (!this.validateDomain(domain)) {
      return [];
    }

    const results: CrawlResult[] = [];

    for (const entry of this.cache.values()) {
      if (entry.url.includes(domain)) {
        results.push(entry.crawlResult);
      }
    }

    return results.slice(0, 100); // Limit filter results
  }

  async filterByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<CrawlResult[]> {
    if (!this.validateDateRange(startDate, endDate)) {
      return [];
    }

    const results: CrawlResult[] = [];

    for (const entry of this.cache.values()) {
      const entryDate = new Date(entry.timestamp);
      if (entryDate >= startDate && entryDate <= endDate) {
        results.push(entry.crawlResult);
      }
    }

    return results.slice(0, 100); // Limit filter results
  }

  // ============================================================================
  // SECURITY VALIDATION METHODS
  // ============================================================================

  private validateUrl(url: string): boolean {
    if (!url || typeof url !== "string") {
      return false;
    }

    if (url.length > CACHE_SECURITY_CONFIG.MAX_URL_LENGTH) {
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private validateCrawlResult(crawlResult: CrawlResult): boolean {
    if (!crawlResult || typeof crawlResult !== "object") {
      return false;
    }

    if (!crawlResult.url || typeof crawlResult.url !== "string") {
      return false;
    }

    if (typeof crawlResult.success !== "boolean") {
      return false;
    }

    return true;
  }

  private validateSearchQuery(query: string): boolean {
    if (!query || typeof query !== "string") {
      return false;
    }

    if (query.length > CACHE_SECURITY_CONFIG.MAX_SEARCH_QUERY_LENGTH) {
      return false;
    }

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /on\w+\s*=/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        return false;
      }
    }

    return true;
  }

  private validateDomain(domain: string): boolean {
    if (!domain || typeof domain !== "string") {
      return false;
    }

    if (domain.length > 253) {
      // Max domain length
      return false;
    }

    // Check for valid domain pattern
    const domainPattern =
      /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainPattern.test(domain);
  }

  private validateDateRange(startDate: Date, endDate: Date): boolean {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      return false;
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }

    if (startDate > endDate) {
      return false;
    }

    // Check for reasonable date range (not too far in past/future)
    const now = new Date();
    const maxPast = new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000); // 10 years ago
    const maxFuture = new Date(now.getTime() + 1 * 365 * 24 * 60 * 60 * 1000); // 1 year from now

    if (startDate < maxPast || endDate > maxFuture) {
      return false;
    }

    return true;
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

  private estimateEntrySize(
    url: string,
    crawlResult: CrawlResult,
    extractedData?: any
  ): number {
    let size = 0;

    // URL
    size += url.length * 2; // UTF-16

    // Crawl result
    if (crawlResult.content) {
      size += crawlResult.content.length * 2;
    }
    if (crawlResult.headers) {
      size += JSON.stringify(crawlResult.headers).length * 2;
    }

    // Extracted data
    if (extractedData) {
      try {
        size += JSON.stringify(extractedData).length * 2;
      } catch {
        size += 1000; // Fallback size for non-serializable data
      }
    }

    // Metadata
    size += 200; // Timestamps, counters, etc.

    return size;
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

    if (expiredKeys.length > 0) {
      console.log(
        `Cache cleanup: removed ${expiredKeys.length} expired entries`
      );
    }
  }

  private matchesQuery(entry: CacheEntry, query: string): boolean {
    if (!this.validateSearchQuery(query)) {
      return false;
    }

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
      try {
        const extractedText = JSON.stringify(entry.extractedData).toLowerCase();
        if (extractedText.includes(searchText)) {
          return true;
        }
      } catch {
        // Skip non-serializable data
      }
    }

    return false;
  }

  private sanitizeError(error: any): string {
    if (error instanceof Error) {
      // Don't expose internal error details
      if (
        error.message.includes("Invalid") ||
        error.message.includes("too large")
      ) {
        return error.message;
      }
      return "Operation failed";
    }
    return "Unknown error occurred";
  }

  // ============================================================================
  // DATABASE PERSISTENCE (PLACEHOLDER)
  // ============================================================================

  private async persistToDatabase(entry: CacheEntry): Promise<void> {
    // TODO: Implement database persistence with proper security
    // This would save the cache entry to a database table
    // for persistence across application restarts
    try {
      console.log(`Persisting cache entry for ${entry.url} to database`);
    } catch (error) {
      console.warn("Failed to persist cache entry:", this.sanitizeError(error));
    }
  }

  private async clearDatabase(): Promise<void> {
    // TODO: Implement database clearing with proper security
    try {
      console.log("Clearing cache from database");
    } catch (error) {
      console.warn(
        "Failed to clear database cache:",
        this.sanitizeError(error)
      );
    }
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
    if (!url || typeof url !== "string") {
      throw new Error("Invalid URL for cache key generation");
    }

    try {
      const normalizedUrl = new URL(url).toString();
      const optionsHash = options ? JSON.stringify(options) : "";
      return `${normalizedUrl}:${optionsHash}`;
    } catch {
      throw new Error("Invalid URL format for cache key generation");
    }
  }

  static estimateCacheSize(entry: CacheEntry): number {
    if (!entry) {
      return 0;
    }

    let size = 0;

    // URL
    size += (entry.url?.length || 0) * 2; // UTF-16

    // Crawl result
    if (entry.crawlResult?.content) {
      size += entry.crawlResult.content.length * 2;
    }
    if (entry.crawlResult?.headers) {
      size += JSON.stringify(entry.crawlResult.headers).length * 2;
    }

    // Extracted data
    if (entry.extractedData) {
      try {
        size += JSON.stringify(entry.extractedData).length * 2;
      } catch {
        size += 1000; // Fallback size for non-serializable data
      }
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

  static validateCacheConfig(config: Partial<CacheConfig>): boolean {
    if (config.maxSize && (config.maxSize <= 0 || config.maxSize > 10000)) {
      return false;
    }

    if (
      config.ttl &&
      (config.ttl <= 0 || config.ttl > 7 * 24 * 60 * 60 * 1000)
    ) {
      return false; // Max 7 days TTL
    }

    if (
      config.maxEntrySize &&
      (config.maxEntrySize <= 0 || config.maxEntrySize > 50 * 1024 * 1024)
    ) {
      return false; // Max 50MB per entry
    }

    return true;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default CacheManager;
