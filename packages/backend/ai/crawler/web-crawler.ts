import axios, { AxiosResponse, AxiosError } from "axios";
import { JSDOM } from "jsdom";
import { setTimeout } from "timers/promises";
import { randomBytes } from "crypto";

// ============================================================================
// SECURITY CONSTANTS
// ============================================================================

const SECURITY_CONFIG = {
  MAX_CONTENT_SIZE: 10 * 1024 * 1024, // 10MB max content size
  MAX_JSON_SIZE: 1 * 1024 * 1024, // 1MB max JSON size
  MAX_URL_LENGTH: 2048, // Max URL length
  DANGEROUS_PROTOCOLS: [
    "file:",
    "ftp:",
    "ssh:",
    "telnet:",
    "gopher:",
    "data:",
    "javascript:",
  ] as string[],
  PRIVATE_IP_RANGES: [
    /^127\./, // 127.0.0.0/8
    /^10\./, // 10.0.0.0/8
    /^192\.168\./, // 192.168.0.0/16
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^169\.254\./, // Link-local
    /^::1$/, // IPv6 localhost
    /^fe80:/, // IPv6 link-local
  ] as RegExp[],
  RESERVED_DOMAINS: [
    "localhost",
    "localhost.localdomain",
    "broadcasthost",
  ] as string[],
  MAX_REDIRECTS: 10,
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 30000,
  RATE_LIMIT_PER_DOMAIN: 2, // requests per second per domain
  GLOBAL_RATE_LIMIT: 10, // requests per second globally
};

// ============================================================================
// WEB CRAWLER CONFIGURATION
// ============================================================================

interface CrawlerConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  rateLimit: number; // requests per second
  userAgents: string[];
  maxConcurrent: number;
  respectRobotsTxt: boolean;
  followRedirects: boolean;
  maxRedirects: number;
  maxContentSize: number;
  maxJsonSize: number;
  enableSecurityChecks: boolean;
}

const DEFAULT_CONFIG: CrawlerConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  rateLimit: 2, // 2 requests per second
  userAgents: [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  ],
  maxConcurrent: 5,
  respectRobotsTxt: true,
  followRedirects: true,
  maxRedirects: 5,
  maxContentSize: SECURITY_CONFIG.MAX_CONTENT_SIZE,
  maxJsonSize: SECURITY_CONFIG.MAX_JSON_SIZE,
  enableSecurityChecks: true,
};

// ============================================================================
// RATE LIMITING INTERFACE
// ============================================================================

interface RateLimitEntry {
  lastRequest: number;
  requestCount: number;
  windowStart: number;
}

// ============================================================================
// ROBOTS.TXT PARSER
// ============================================================================

interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

class RobotsTxtParser {
  private rules: Map<string, RobotsRule> = new Map();
  private defaultRule: RobotsRule = { userAgent: "*", allow: [], disallow: [] };

  parse(content: string): void {
    const lines = content.split("\n").map((line) => line.trim());
    let currentRule: RobotsRule | null = null;

    for (const line of lines) {
      if (line.startsWith("User-agent:")) {
        const userAgent = line.substring(11).trim();
        currentRule = { userAgent, allow: [], disallow: [] };
        this.rules.set(userAgent, currentRule);
      } else if (line.startsWith("Allow:") && currentRule) {
        currentRule.allow.push(line.substring(6).trim());
      } else if (line.startsWith("Disallow:") && currentRule) {
        currentRule.disallow.push(line.substring(9).trim());
      } else if (line.startsWith("Crawl-delay:") && currentRule) {
        currentRule.crawlDelay = parseInt(line.substring(12).trim());
      }
    }

    // Set default rule if no specific rule exists
    if (!this.rules.has("*")) {
      this.rules.set("*", this.defaultRule);
    }
  }

  isAllowed(url: string, userAgent: string = "*"): boolean {
    const rule =
      this.rules.get(userAgent) || this.rules.get("*") || this.defaultRule;
    const path = new URL(url).pathname;

    // Check disallow rules first
    for (const disallow of rule.disallow) {
      if (this.matchesPath(path, disallow)) {
        return false;
      }
    }

    // Check allow rules
    for (const allow of rule.allow) {
      if (this.matchesPath(path, allow)) {
        return true;
      }
    }

    // Default to allowed if no specific rules match
    return true;
  }

  getCrawlDelay(userAgent: string = "*"): number {
    const rule = this.rules.get(userAgent) || this.rules.get("*");
    return rule?.crawlDelay || 0;
  }

  private matchesPath(path: string, pattern: string): boolean {
    if (pattern === "/") return path === "/";
    if (pattern.endsWith("*")) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path.startsWith(pattern);
  }
}

// ============================================================================
// CRAWLER CLASS
// ============================================================================

export class WebCrawler {
  private config: CrawlerConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private activeRequests = 0;
  private lastRequestTime = 0;
  private robotsTxtCache = new Map<string, RobotsTxtParser>();
  private domainRateLimits = new Map<string, RateLimitEntry>();
  private globalRateLimit: RateLimitEntry = {
    lastRequest: 0,
    requestCount: 0,
    windowStart: Date.now(),
  };

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // MAIN CRAWL METHOD
  // ============================================================================

  async crawl(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      // Validate URL with security checks
      const validatedUrl = this.validateAndNormalizeUrl(url);

      // Check robots.txt if enabled
      if (this.config.respectRobotsTxt) {
        const canCrawl = await this.checkRobotsTxt(validatedUrl);
        if (!canCrawl) {
          throw new Error(
            `Crawling not allowed by robots.txt for ${validatedUrl}`
          );
        }
      }

      // Rate limiting (both global and per-domain)
      await this.rateLimit(validatedUrl);

      // Execute request with retry logic
      const response = await this.executeWithRetry(() =>
        this.makeRequest(validatedUrl, options)
      );

      // Validate response size
      this.validateResponseSize(response);

      // Parse content with security checks
      const parsedContent = await this.parseContent(response, options);

      const result: CrawlResult = {
        url: validatedUrl,
        status: response.status,
        statusText: response.statusText,
        headers: this.sanitizeHeaders(response.headers),
        content: response.data,
        parsedContent,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        success: true,
      };

      return result;
    } catch (error) {
      return {
        url,
        status: 0,
        statusText: "ERROR",
        headers: {},
        content: "",
        parsedContent: null,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        success: false,
        error: this.sanitizeError(error),
      };
    }
  }

  // ============================================================================
  // SECURITY VALIDATION METHODS
  // ============================================================================

  private validateAndNormalizeUrl(url: string): string {
    if (!url || typeof url !== "string") {
      throw new Error("Invalid URL: URL must be a non-empty string");
    }

    if (url.length > SECURITY_CONFIG.MAX_URL_LENGTH) {
      throw new Error(
        `URL too long: ${url.length} characters (max: ${SECURITY_CONFIG.MAX_URL_LENGTH})`
      );
    }

    try {
      const urlObj = new URL(url);

      // Block dangerous protocols
      if (SECURITY_CONFIG.DANGEROUS_PROTOCOLS.includes(urlObj.protocol)) {
        throw new Error(`Dangerous protocol not allowed: ${urlObj.protocol}`);
      }

      // Block local/private IPs
      const hostname = urlObj.hostname;
      if (SECURITY_CONFIG.RESERVED_DOMAINS.includes(hostname.toLowerCase())) {
        throw new Error(`Reserved domain not allowed: ${hostname}`);
      }

      // Check for private IP ranges
      for (const pattern of SECURITY_CONFIG.PRIVATE_IP_RANGES) {
        if (pattern.test(hostname)) {
          throw new Error(`Private IP range not allowed: ${hostname}`);
        }
      }

      // Validate port (block common dangerous ports)
      const dangerousPorts = [
        21, 22, 23, 25, 53, 80, 443, 1433, 3306, 5432, 6379, 27017,
      ];
      if (urlObj.port && dangerousPorts.includes(parseInt(urlObj.port))) {
        throw new Error(`Dangerous port not allowed: ${urlObj.port}`);
      }

      return urlObj.toString();
    } catch (error) {
      if (error instanceof Error && error.message.includes("not allowed")) {
        throw error;
      }
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  private validateResponseSize(response: AxiosResponse): void {
    const contentLength = response.headers["content-length"];
    if (contentLength) {
      const size = parseInt(contentLength);
      if (size > this.config.maxContentSize) {
        throw new Error(
          `Response too large: ${size} bytes (max: ${this.config.maxContentSize})`
        );
      }
    }

    // Check actual content size
    if (response.data && typeof response.data === "string") {
      if (response.data.length > this.config.maxContentSize) {
        throw new Error(
          `Content too large: ${response.data.length} characters (max: ${this.config.maxContentSize})`
        );
      }
    }
  }

  private sanitizeHeaders(
    headers: Record<string, any>
  ): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const allowedHeaders = [
      "content-type",
      "content-length",
      "last-modified",
      "etag",
      "cache-control",
      "expires",
      "server",
      "x-powered-by",
    ];

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (allowedHeaders.includes(lowerKey) && value) {
        sanitized[key] = value.toString().substring(0, 1000); // Limit header value length
      }
    }

    return sanitized;
  }

  private sanitizeError(error: any): string {
    if (error instanceof Error) {
      // Don't expose internal error details
      if (
        error.message.includes("not allowed") ||
        error.message.includes("Invalid URL")
      ) {
        return error.message;
      }
      return "Request failed";
    }
    return "Unknown error occurred";
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  private async rateLimit(url: string): Promise<void> {
    const domain = new URL(url).hostname;
    const now = Date.now();
    const windowSize = 1000; // 1 second window

    // Global rate limiting
    if (now - this.globalRateLimit.windowStart >= windowSize) {
      this.globalRateLimit.windowStart = now;
      this.globalRateLimit.requestCount = 0;
    }

    if (
      this.globalRateLimit.requestCount >= SECURITY_CONFIG.GLOBAL_RATE_LIMIT
    ) {
      const waitTime = windowSize - (now - this.globalRateLimit.windowStart);
      await setTimeout(waitTime);
    }

    // Per-domain rate limiting
    if (!this.domainRateLimits.has(domain)) {
      this.domainRateLimits.set(domain, {
        lastRequest: 0,
        requestCount: 0,
        windowStart: now,
      });
    }

    const domainLimit = this.domainRateLimits.get(domain)!;

    if (now - domainLimit.windowStart >= windowSize) {
      domainLimit.windowStart = now;
      domainLimit.requestCount = 0;
    }

    if (domainLimit.requestCount >= SECURITY_CONFIG.RATE_LIMIT_PER_DOMAIN) {
      const waitTime = windowSize - (now - domainLimit.windowStart);
      await setTimeout(waitTime);
    }

    // Update counters
    this.globalRateLimit.requestCount++;
    domainLimit.requestCount++;
    domainLimit.lastRequest = now;
    this.globalRateLimit.lastRequest = now;
  }

  // ============================================================================
  // BATCH CRAWLING
  // ============================================================================

  async crawlBatch(
    urls: string[],
    options: CrawlOptions = {}
  ): Promise<CrawlResult[]> {
    if (!Array.isArray(urls)) {
      throw new Error("URLs must be an array");
    }

    if (urls.length > 100) {
      throw new Error("Too many URLs in batch (max: 100)");
    }

    const results: CrawlResult[] = [];

    for (const url of urls) {
      try {
        const result = await this.crawl(url, options);
        results.push(result);
      } catch (error) {
        results.push({
          url,
          status: 0,
          statusText: "ERROR",
          headers: {},
          content: "",
          parsedContent: null,
          timestamp: new Date(),
          duration: 0,
          success: false,
          error: this.sanitizeError(error),
        });
      }
    }

    return results;
  }

  // ============================================================================
  // RETRY LOGIC
  // ============================================================================

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Don't retry on security-related errors
        if (
          lastError.message.includes("not allowed") ||
          lastError.message.includes("Invalid URL") ||
          lastError.message.includes("too large")
        ) {
          throw lastError;
        }

        if (attempt === this.config.maxRetries) {
          throw lastError;
        }

        // Exponential backoff with jitter
        const delay =
          this.config.retryDelay * Math.pow(2, attempt - 1) +
          Math.random() * 1000;
        await setTimeout(delay);
      }
    }

    throw lastError!;
  }

  // ============================================================================
  // HTTP REQUEST
  // ============================================================================

  private async makeRequest(
    url: string,
    options: CrawlOptions
  ): Promise<AxiosResponse> {
    const userAgent = this.getRandomUserAgent();

    const axiosConfig = {
      timeout: this.config.timeout,
      maxRedirects: Math.min(
        this.config.maxRedirects,
        SECURITY_CONFIG.MAX_REDIRECTS
      ),
      maxContentLength: this.config.maxContentSize,
      maxBodyLength: this.config.maxContentSize,
      headers: {
        "User-Agent": userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        ...this.sanitizeRequestHeaders(options.headers),
      },
      ...this.sanitizeAxiosConfig(options.axiosConfig),
    };

    return axios.get(url, axiosConfig);
  }

  private sanitizeRequestHeaders(
    headers?: Record<string, string>
  ): Record<string, string> {
    if (!headers) return {};

    const sanitized: Record<string, string> = {};
    const allowedHeaders = [
      "authorization",
      "cookie",
      "referer",
      "origin",
      "x-requested-with",
    ];

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (allowedHeaders.includes(lowerKey) && value) {
        sanitized[key] = value.substring(0, 1000); // Limit header value length
      }
    }

    return sanitized;
  }

  private sanitizeAxiosConfig(config?: any): any {
    if (!config) return {};

    // Only allow safe axios config options
    const safeConfig: any = {};
    const allowedKeys = [
      "timeout",
      "maxRedirects",
      "maxContentLength",
      "maxBodyLength",
    ];

    for (const key of allowedKeys) {
      if (config[key] !== undefined) {
        safeConfig[key] = config[key];
      }
    }

    return safeConfig;
  }

  // ============================================================================
  // CONTENT PARSING
  // ============================================================================

  private async parseContent(
    response: AxiosResponse,
    options: CrawlOptions
  ): Promise<ParsedContent | null> {
    const contentType = response.headers["content-type"] || "";
    const content = response.data;

    // Validate content size before parsing
    if (
      typeof content === "string" &&
      content.length > this.config.maxContentSize
    ) {
      throw new Error(
        `Content too large for parsing: ${content.length} characters`
      );
    }

    if (contentType.includes("application/json")) {
      return this.parseJson(content);
    } else if (contentType.includes("text/html")) {
      return this.parseHtml(content, options);
    } else if (
      contentType.includes("application/xml") ||
      contentType.includes("text/xml")
    ) {
      return this.parseXml(content);
    } else if (contentType.includes("text/plain")) {
      return this.parseText(content);
    }

    return null;
  }

  private parseJson(content: string): ParsedContent {
    if (content.length > this.config.maxJsonSize) {
      throw new Error(`JSON content too large: ${content.length} characters`);
    }

    try {
      const data = JSON.parse(content);
      return {
        type: "json",
        data,
        text: JSON.stringify(data, null, 2),
        metadata: {
          keys: Object.keys(data),
          size: content.length,
        },
      };
    } catch (error) {
      throw new Error("Invalid JSON content");
    }
  }

  private parseHtml(content: string, options: CrawlOptions): ParsedContent {
    if (content.length > this.config.maxContentSize) {
      throw new Error(`HTML content too large: ${content.length} characters`);
    }

    try {
      const dom = new JSDOM(content, {
        url: "http://localhost", // Safe default
        pretendToBeVisual: false,
        runScripts: "outside-only", // Don't execute scripts
        resources: "usable",
      });

      const document = dom.window.document;
      const text = this.extractTextContent(document, options);
      const links = this.extractLinks(document);
      const metadata = this.extractMetadata(document);
      const structuredData = options.extractStructuredData
        ? this.extractStructuredData(document)
        : {};

      return {
        type: "html",
        data: {
          text,
          links,
          metadata,
          structuredData,
        },
        text,
        metadata,
      };
    } catch (error) {
      throw new Error("Failed to parse HTML content");
    }
  }

  private parseXml(content: string): ParsedContent {
    if (content.length > this.config.maxContentSize) {
      throw new Error(`XML content too large: ${content.length} characters`);
    }

    try {
      // Basic XML parsing - could be enhanced with proper XML parser
      return {
        type: "xml",
        data: { content },
        text: content,
        metadata: {
          size: content.length,
        },
      };
    } catch (error) {
      throw new Error("Failed to parse XML content");
    }
  }

  private parseText(content: string): ParsedContent {
    if (content.length > this.config.maxContentSize) {
      throw new Error(`Text content too large: ${content.length} characters`);
    }

    return {
      type: "text",
      data: { content },
      text: content,
      metadata: {
        size: content.length,
      },
    };
  }

  // ============================================================================
  // CONTENT EXTRACTION
  // ============================================================================

  private extractTextContent(
    document: Document,
    options: CrawlOptions
  ): string {
    // Remove script and style elements
    const scripts = document.querySelectorAll("script, style, noscript");
    scripts.forEach((script) => script.remove());

    let text =
      document.body?.textContent || document.documentElement.textContent || "";

    // Apply text selectors if provided
    if (options.textSelectors && options.textSelectors.length > 0) {
      const selectedTexts: string[] = [];
      for (const selector of options.textSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const elementText = element.textContent?.trim();
          if (elementText) {
            selectedTexts.push(elementText);
          }
        });
      }
      text = selectedTexts.join(" ");
    }

    // Clean and normalize text
    text = text
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, this.config.maxContentSize); // Limit text size

    return text;
  }

  private extractLinks(
    document: Document
  ): Array<{ href: string; text: string; title?: string }> {
    const links: Array<{ href: string; text: string; title?: string }> = [];
    const linkElements = document.querySelectorAll("a[href]");

    for (const link of linkElements) {
      const href = link.getAttribute("href");
      const text = link.textContent?.trim() || "";
      const title = link.getAttribute("title") || undefined;

      if (href && href.length <= SECURITY_CONFIG.MAX_URL_LENGTH) {
        links.push({ href, text, title });
      }
    }

    return links.slice(0, 1000); // Limit number of links
  }

  private extractMetadata(document: Document): Record<string, string> {
    const metadata: Record<string, string> = {};
    const metaTags = document.querySelectorAll("meta");

    for (const meta of metaTags) {
      const name = meta.getAttribute("name") || meta.getAttribute("property");
      const content = meta.getAttribute("content");

      if (name && content) {
        metadata[name] = content.substring(0, 1000); // Limit metadata value length
      }
    }

    // Extract title
    const title = document.querySelector("title");
    if (title?.textContent) {
      metadata.title = title.textContent.substring(0, 200);
    }

    return metadata;
  }

  private extractStructuredData(document: Document): Record<string, any> {
    const structuredData: Record<string, any> = {};

    // JSON-LD
    const jsonLdScripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    jsonLdScripts.forEach((script, index) => {
      try {
        const content = script.textContent || "";
        if (content.length > this.config.maxJsonSize) {
          return; // Skip large JSON-LD
        }
        const data = JSON.parse(content);
        structuredData[`jsonLd_${index}`] = data;
      } catch (error) {
        // Ignore invalid JSON-LD
      }
    });

    // Microdata
    const microdataElements = document.querySelectorAll("[itemtype]");
    if (microdataElements.length > 0) {
      structuredData.microdata = Array.from(microdataElements)
        .slice(0, 100)
        .map((element) => ({
          itemtype: element.getAttribute("itemtype"),
          itemprops: Array.from(element.querySelectorAll("[itemprop]"))
            .slice(0, 50)
            .map((prop) => ({
              prop: prop.getAttribute("itemprop"),
              content: (
                prop.getAttribute("content") ||
                prop.textContent ||
                ""
              ).substring(0, 500),
            })),
        }));
    }

    return structuredData;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getRandomUserAgent(): string {
    return this.config.userAgents[
      Math.floor(Math.random() * this.config.userAgents.length)
    ]!;
  }

  private async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      if (this.robotsTxtCache.has(robotsUrl)) {
        const parser = this.robotsTxtCache.get(robotsUrl)!;
        return parser.isAllowed(url);
      }

      const response = await axios.get(robotsUrl, {
        timeout: 10000,
        maxContentLength: 1024 * 1024, // 1MB max for robots.txt
      });

      const robotsContent = response.data;

      if (
        typeof robotsContent !== "string" ||
        robotsContent.length > 1024 * 1024
      ) {
        // If robots.txt is too large or invalid, assume crawling is allowed
        return true;
      }

      const parser = new RobotsTxtParser();
      parser.parse(robotsContent);
      this.robotsTxtCache.set(robotsUrl, parser);

      return parser.isAllowed(url);
    } catch (error) {
      // If robots.txt is not accessible, assume crawling is allowed
      return true;
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    this.robotsTxtCache.clear();
    this.domainRateLimits.clear();
    this.requestQueue.length = 0;
  }
}

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface CrawlOptions {
  headers?: Record<string, string>;
  axiosConfig?: any;
  textSelectors?: string[];
  extractStructuredData?: boolean;
  followLinks?: boolean;
  maxDepth?: number;
}

export interface CrawlResult {
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  content: string;
  parsedContent: ParsedContent | null;
  timestamp: Date;
  duration: number;
  success: boolean;
  error?: string;
}

export interface ParsedContent {
  type: "html" | "json" | "xml" | "text";
  data: any;
  text: string;
  metadata: Record<string, any>;
}

export default WebCrawler;
