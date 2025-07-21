import axios, { AxiosResponse, AxiosError } from "axios";
import { JSDOM } from "jsdom";
import { setTimeout } from "timers/promises";
import { randomBytes } from "crypto";

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
};

// ============================================================================
// CRAWLER CLASS
// ============================================================================

export class WebCrawler {
  private config: CrawlerConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private activeRequests = 0;
  private lastRequestTime = 0;
  private robotsTxtCache = new Map<string, any>();

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // MAIN CRAWL METHOD
  // ============================================================================

  async crawl(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      // Validate URL
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

      // Rate limiting
      await this.rateLimit();

      // Execute request with retry logic
      const response = await this.executeWithRetry(() =>
        this.makeRequest(validatedUrl, options)
      );

      // Parse content
      const parsedContent = await this.parseContent(response, options);

      const result: CrawlResult = {
        url: validatedUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(
          Object.entries(response.headers).map(([key, value]) => [
            key,
            value?.toString() || "",
          ])
        ),
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
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================================
  // BATCH CRAWLING
  // ============================================================================

  async crawlBatch(
    urls: string[],
    options: CrawlOptions = {}
  ): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const batchSize = this.config.maxConcurrent;

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map((url) => this.crawl(url, options));

      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          results.push({
            url: "unknown",
            status: 0,
            statusText: "ERROR",
            headers: {},
            content: "",
            parsedContent: null,
            timestamp: new Date(),
            duration: 0,
            success: false,
            error: result.reason?.message || "Unknown error",
          });
        }
      }
    }

    return results;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private validateAndNormalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.config.rateLimit;

    if (timeSinceLastRequest < minInterval) {
      await setTimeout(minInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt === this.config.maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await setTimeout(delay);
      }
    }

    throw lastError!;
  }

  private async makeRequest(
    url: string,
    options: CrawlOptions
  ): Promise<AxiosResponse> {
    const userAgent = this.getRandomUserAgent();

    const axiosConfig = {
      timeout: this.config.timeout,
      maxRedirects: this.config.maxRedirects,
      headers: {
        "User-Agent": userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        ...options.headers,
      },
      ...options.axiosConfig,
    };

    return axios.get(url, axiosConfig);
  }

  private async parseContent(
    response: AxiosResponse,
    options: CrawlOptions
  ): Promise<ParsedContent | null> {
    const contentType = response.headers["content-type"] || "";
    const content = response.data;

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
    try {
      const data = JSON.parse(content);
      return {
        type: "json",
        data,
        text: JSON.stringify(data, null, 2),
        metadata: {
          keys: Object.keys(data),
          size: JSON.stringify(data).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  }

  private parseHtml(content: string, options: CrawlOptions): ParsedContent {
    try {
      const dom = new JSDOM(content);
      const document = dom.window.document;

      // Extract text content
      const textContent = this.extractTextContent(document, options);

      // Extract links
      const links = this.extractLinks(document);

      // Extract metadata
      const metadata = this.extractMetadata(document);

      // Extract structured data
      const structuredData = this.extractStructuredData(document);

      return {
        type: "html",
        data: {
          title: metadata.title,
          description: metadata.description,
          text: textContent,
          links,
          metadata,
          structuredData,
        },
        text: textContent,
        metadata: {
          title: metadata.title,
          description: metadata.description,
          linksCount: links.length,
          hasStructuredData: Object.keys(structuredData).length > 0,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse HTML: ${error}`);
    }
  }

  private parseXml(content: string): ParsedContent {
    try {
      const dom = new JSDOM(content, { contentType: "text/xml" });
      const document = dom.window.document;

      return {
        type: "xml",
        data: document,
        text: document.textContent || "",
        metadata: {
          rootElement: document.documentElement?.tagName,
          childElements: Array.from(document.children).map(
            (child) => (child as Element).tagName
          ),
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse XML: ${error}`);
    }
  }

  private parseText(content: string): ParsedContent {
    return {
      type: "text",
      data: content,
      text: content,
      metadata: {
        length: content.length,
        lines: content.split("\n").length,
      },
    };
  }

  private extractTextContent(
    document: Document,
    options: CrawlOptions
  ): string {
    // Remove script and style elements
    const scripts = document.querySelectorAll("script, style, noscript");
    scripts.forEach((script) => script.remove());

    // Extract text from specific selectors if provided
    if (options.textSelectors && options.textSelectors.length > 0) {
      const textParts: string[] = [];
      for (const selector of options.textSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const text = element.textContent?.trim();
          if (text) textParts.push(text);
        });
      }
      return textParts.join("\n\n");
    }

    // Default text extraction
    const body = document.body;
    if (!body) return "";

    return body.textContent?.trim() || "";
  }

  private extractLinks(
    document: Document
  ): Array<{ href: string; text: string; title?: string }> {
    const links: Array<{ href: string; text: string; title?: string }> = [];
    const linkElements = document.querySelectorAll("a[href]");

    linkElements.forEach((link) => {
      const href = link.getAttribute("href");
      const text = link.textContent?.trim();
      const title = link.getAttribute("title");

      if (href && text) {
        links.push({ href, text, title: title || undefined });
      }
    });

    return links;
  }

  private extractMetadata(document: Document): Record<string, string> {
    const metadata: Record<string, string> = {};

    // Basic metadata
    metadata.title = document.title || "";

    // Meta tags
    const metaTags = document.querySelectorAll("meta");
    metaTags.forEach((meta) => {
      const name = meta.getAttribute("name") || meta.getAttribute("property");
      const content = meta.getAttribute("content");
      if (name && content) {
        metadata[name] = content;
      }
    });

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
        const data = JSON.parse(script.textContent || "");
        structuredData[`jsonLd_${index}`] = data;
      } catch (error) {
        // Ignore invalid JSON-LD
      }
    });

    // Microdata
    const microdataElements = document.querySelectorAll("[itemtype]");
    if (microdataElements.length > 0) {
      structuredData.microdata = Array.from(microdataElements).map(
        (element) => ({
          itemtype: element.getAttribute("itemtype"),
          itemprops: Array.from(element.querySelectorAll("[itemprop]")).map(
            (prop) => ({
              prop: prop.getAttribute("itemprop"),
              content: prop.getAttribute("content") || prop.textContent,
            })
          ),
        })
      );
    }

    return structuredData;
  }

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
        return this.robotsTxtCache.get(robotsUrl);
      }

      const response = await axios.get(robotsUrl, { timeout: 10000 });
      const robotsContent = response.data;

      // Simple robots.txt parsing (can be enhanced)
      const isAllowed = !robotsContent.includes("Disallow: /");
      this.robotsTxtCache.set(robotsUrl, isAllowed);

      return isAllowed;
    } catch (error) {
      // If robots.txt is not accessible, assume crawling is allowed
      return true;
    }
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

// ============================================================================
// EXPORT
// ============================================================================

export default WebCrawler;
