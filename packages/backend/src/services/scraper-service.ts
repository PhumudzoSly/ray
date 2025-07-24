import { z } from "zod";
import * as cheerio from "cheerio";

// Scraping result schemas
const ScrapedContentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  images: z.array(z.string().url()).optional(),
  links: z.array(z.string().url()).optional(),
  author: z.string().optional(),
  publishedDate: z.string().optional(),
  readingTime: z.number().optional(),
  wordCount: z.number().optional(),
  url: z.string().url(),
  scrapedAt: z.string(),
  status: z.number(),
});

const ScrapingOptionsSchema = z.object({
  timeout: z.number().default(10000),
  userAgent: z.string().default("Mozilla/5.0 (compatible; RayBot/1.0)"),
  followRedirects: z.boolean().default(true),
  extractImages: z.boolean().default(false),
  extractLinks: z.boolean().default(false),
  extractMetadata: z.boolean().default(true),
  maxContentLength: z.number().default(1000000), // 1MB
  selectors: z
    .object({
      title: z.string().optional(),
      content: z.string().optional(),
      description: z.string().optional(),
      author: z.string().optional(),
      date: z.string().optional(),
    })
    .optional(),
});

export type ScrapedContent = z.infer<typeof ScrapedContentSchema>;
export type ScrapingOptions = z.infer<typeof ScrapingOptionsSchema>;

class ScraperService {
  private defaultOptions: ScrapingOptions = {
    timeout: 10000,
    userAgent: "Mozilla/5.0 (compatible; RayBot/1.0)",
    followRedirects: true,
    extractImages: false,
    extractLinks: false,
    extractMetadata: true,
    maxContentLength: 1000000,
  };

  private async fetchWithRetry(
    url: string,
    options: ScrapingOptions,
    maxRetries = 3
  ): Promise<Response> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);

        const response = await fetch(url, {
          headers: {
            "User-Agent": options.userAgent,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
          },
          signal: controller.signal,
          redirect: options.followRedirects ? "follow" : "manual",
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Fetch attempt ${attempt} failed for ${url}:`, error);

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

  private extractTextContent($: cheerio.CheerioAPI, selector?: string): string {
    if (selector) {
      return $(selector).text().trim();
    }

    // Default content extraction - remove script, style, nav, header, footer
    const contentSelectors = [
      "article",
      "main",
      ".content",
      ".post-content",
      ".entry-content",
      "#content",
      ".article-content",
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        return element.text().trim();
      }
    }

    // Fallback to body content
    return $("body").text().trim();
  }

  private extractMetadata($: cheerio.CheerioAPI): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Meta tags
    $("meta").each((_, element) => {
      const name = $(element).attr("name") || $(element).attr("property");
      const content = $(element).attr("content");
      if (name && content) {
        metadata[name] = content;
      }
    });

    // Open Graph tags
    $("meta[property^='og:']").each((_, element) => {
      const property = $(element).attr("property");
      const content = $(element).attr("content");
      if (property && content) {
        metadata[property] = content;
      }
    });

    // Twitter Card tags
    $("meta[name^='twitter:']").each((_, element) => {
      const name = $(element).attr("name");
      const content = $(element).attr("content");
      if (name && content) {
        metadata[name] = content;
      }
    });

    // JSON-LD structured data
    $("script[type='application/ld+json']").each((_, element) => {
      try {
        const jsonContent = $(element).html();
        if (jsonContent) {
          const parsed = JSON.parse(jsonContent);
          metadata["json-ld"] = parsed;
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    });

    return metadata;
  }

  private extractImages($: cheerio.CheerioAPI): string[] {
    const images: string[] = [];

    $("img").each((_, element) => {
      const src = $(element).attr("src");
      if (src) {
        images.push(src);
      }
    });

    return images;
  }

  private extractLinks($: cheerio.CheerioAPI): string[] {
    const links: string[] = [];

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href && href.startsWith("http")) {
        links.push(href);
      }
    });

    return links;
  }

  private calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
      .trim();
  }

  async scrape(
    url: string,
    options: Partial<ScrapingOptions> = {}
  ): Promise<ScrapedContent> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      console.log(`Scraping URL: ${url}`);

      const response = await this.fetchWithRetry(url, mergedOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("text/html")) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      const html = await response.text();

      if (html.length > mergedOptions.maxContentLength) {
        throw new Error(`Content too large: ${html.length} bytes`);
      }

      const $ = cheerio.load(html);

      // Extract title
      const title = mergedOptions.selectors?.title
        ? $(mergedOptions.selectors.title).text().trim()
        : $("title").text().trim() || $("h1").first().text().trim();

      // Extract description
      const description = mergedOptions.selectors?.description
        ? $(mergedOptions.selectors.description).text().trim()
        : $('meta[name="description"]').attr("content") ||
          $('meta[property="og:description"]').attr("content") ||
          "";

      // Extract main content
      const content = mergedOptions.selectors?.content
        ? this.extractTextContent($, mergedOptions.selectors.content)
        : this.extractTextContent($);

      // Extract author
      const author = mergedOptions.selectors?.author
        ? $(mergedOptions.selectors.author).text().trim()
        : $('meta[name="author"]').attr("content") || "";

      // Extract published date
      const publishedDate = mergedOptions.selectors?.date
        ? $(mergedOptions.selectors.date).text().trim()
        : $('meta[property="article:published_time"]').attr("content") || "";

      // Extract metadata if requested
      const metadata = mergedOptions.extractMetadata
        ? this.extractMetadata($)
        : {};

      // Extract images if requested
      const images = mergedOptions.extractImages ? this.extractImages($) : [];

      // Extract links if requested
      const links = mergedOptions.extractLinks ? this.extractLinks($) : [];

      // Calculate reading time and word count
      const cleanContent = this.cleanText(content);
      const readingTime = this.calculateReadingTime(cleanContent);
      const wordCount = cleanContent.split(/\s+/).length;

      const result: ScrapedContent = {
        title,
        description,
        content: cleanContent,
        text: cleanContent, // Alias for content
        html: mergedOptions.extractMetadata ? html : undefined,
        metadata,
        images,
        links,
        author,
        publishedDate,
        readingTime,
        wordCount,
        url: response.url, // Final URL after redirects
        scrapedAt: new Date().toISOString(),
        status: response.status,
      };

      console.log(
        `Successfully scraped ${url} (${wordCount} words, ${readingTime} min read)`
      );
      return result;
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      throw error;
    }
  }

  async scrapeMultiple(
    urls: string[],
    options: Partial<ScrapingOptions> = {}
  ): Promise<ScrapedContent[]> {
    const results: ScrapedContent[] = [];
    const concurrency = 3; // Limit concurrent requests

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map((url) =>
        this.scrape(url, options).catch((error) => {
          console.error(`Failed to scrape ${url}:`, error);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...(batchResults.filter(Boolean) as ScrapedContent[]));
    }

    return results;
  }

  async scrapeWithRetry(
    url: string,
    options: Partial<ScrapingOptions> = {},
    maxRetries = 3
  ): Promise<ScrapedContent> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.scrape(url, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Scraping attempt ${attempt} failed for ${url}:`, error);

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

  // Utility method to extract specific data using CSS selectors
  async extractData(
    url: string,
    selectors: Record<string, string>
  ): Promise<Record<string, string>> {
    const scraped = await this.scrape(url, { selectors });
    const extracted: Record<string, string> = {};

    for (const [key, selector] of Object.entries(selectors)) {
      const $ = cheerio.load(scraped.html || "");
      extracted[key] = $(selector).text().trim();
    }

    return extracted;
  }
}

// Export singleton instance
export const scraperService = new ScraperService();

// Export the class for testing
export { ScraperService };
