# Web Research Services

This package provides comprehensive web research capabilities including search, web scraping, and combined research functionality.

## Services Overview

### 1. Search Service (`search-service.ts`)
Performs web searches across multiple providers with automatic fallback.

**Supported Providers:**
- Brave Search API (recommended)
- SerpApi (Google results)
- SearchApi.io (DuckDuckGo)

### 2. Scraper Service (`scraper-service.ts`)
Extracts content from web pages with intelligent parsing and metadata extraction.

### 3. Web Research Service (`web-research-service.ts`)
Combines search and scraping for comprehensive research workflows.

## Quick Start

### Basic Search
```typescript
import { searchService } from "@workspace/backend/services";

// Simple search
const results = await searchService.search("artificial intelligence trends 2024");

// Search with options
const results = await searchService.search("machine learning", {
  limit: 20,
  country: "us",
  language: "en"
});
```

### Basic Scraping
```typescript
import { scraperService } from "@workspace/backend/services";

// Scrape a single URL
const content = await scraperService.scrape("https://example.com");

// Scrape with custom options
const content = await scraperService.scrape("https://example.com", {
  timeout: 15000,
  extractImages: true,
  extractLinks: true,
  selectors: {
    title: "h1.article-title",
    content: ".article-body",
    author: ".author-name"
  }
});
```

### Comprehensive Research
```typescript
import { webResearchService } from "@workspace/backend/services";

// Basic research (search + scrape top 3 results)
const research = await webResearchService.research({
  query: "AI market analysis 2024",
  scrapeTopResults: 3
});

// Advanced research with custom options
const research = await webResearchService.research({
  query: "competitor analysis",
  searchOptions: { limit: 10, country: "us" },
  scrapingOptions: { 
    extractImages: true,
    extractLinks: true,
    timeout: 15000 
  },
  scrapeTopResults: 5
}, {
  includeSummary: true,
  maxConcurrentScrapes: 3
});
```

## Advanced Usage

### Competitor Research
```typescript
const competitorAnalysis = await webResearchService.competitorResearch("OpenAI");
```

### Trend Analysis
```typescript
const trends = await webResearchService.trendResearch("blockchain", "month");
```

### Sentiment Research
```typescript
const sentiment = await webResearchService.sentimentResearch("ChatGPT");
```

### Multi-Query Research
```typescript
const results = await webResearchService.multiQueryResearch([
  "AI trends 2024",
  "machine learning developments",
  "neural networks advances"
]);
```

## Configuration

### Environment Variables
Add these to your `.env` file:

```bash
# Brave Search API (recommended - 5,000 free queries/month)
BRAVE_SEARCH_API_KEY=your_brave_api_key

# SerpApi (Google results - 100 free queries/month)
SERPAPI_KEY=your_serpapi_key

# SearchApi.io (DuckDuckGo - 100 free queries/month)
SEARCHAPI_KEY=your_searchapi_key
```

### Provider Priority
The services automatically try providers in this order:
1. Brave Search API
2. SerpApi
3. SearchApi.io

If one fails, it automatically falls back to the next available provider.

## API Reference

### SearchService

#### `search(query: string, options?: SearchOptions): Promise<SearchResponse>`
Performs a web search.

**Options:**
- `limit`: Number of results (default: 10)
- `country`: Country code (e.g., "us", "uk")
- `language`: Language code (e.g., "en", "es")
- `safeSearch`: Enable safe search

#### `searchWithRetry(query: string, options?: SearchOptions, maxRetries?: number): Promise<SearchResponse>`
Performs search with automatic retry on failure.

### ScraperService

#### `scrape(url: string, options?: ScrapingOptions): Promise<ScrapedContent>`
Scrapes content from a URL.

**Options:**
- `timeout`: Request timeout in ms (default: 10000)
- `userAgent`: Custom user agent string
- `extractImages`: Extract image URLs
- `extractLinks`: Extract link URLs
- `extractMetadata`: Extract meta tags and structured data
- `selectors`: Custom CSS selectors for content extraction

#### `scrapeMultiple(urls: string[], options?: ScrapingOptions): Promise<ScrapedContent[]>`
Scrapes multiple URLs concurrently.

### WebResearchService

#### `research(query: ResearchQuery, options?: ResearchOptions): Promise<ResearchResult>`
Performs comprehensive research combining search and scraping.

**Query Options:**
- `query`: Search query string
- `searchOptions`: Search-specific options
- `scrapingOptions`: Scraping-specific options
- `maxResults`: Maximum search results
- `scrapeTopResults`: Number of top results to scrape

**Research Options:**
- `searchOnly`: Only perform search, no scraping
- `scrapeAllResults`: Scrape all search results
- `maxConcurrentScrapes`: Concurrent scraping limit
- `includeSummary`: Include research summary

## Error Handling

All services include comprehensive error handling:

```typescript
try {
  const results = await searchService.search("query");
} catch (error) {
  if (error.message.includes("No search providers available")) {
    // Handle missing API keys
  } else if (error.message.includes("HTTP")) {
    // Handle HTTP errors
  } else {
    // Handle other errors
  }
}
```

## Performance Considerations

- **Rate Limiting**: Services respect provider rate limits
- **Concurrent Scraping**: Limited to 3 concurrent requests by default
- **Timeout**: 10-second timeout for requests
- **Retry Logic**: Automatic retry with exponential backoff
- **Content Size**: 1MB limit for scraped content

## Best Practices

1. **Use Brave Search API** for the highest free tier (5,000 queries/month)
2. **Implement caching** for repeated searches
3. **Respect robots.txt** and website terms of service
4. **Add delays** between scraping requests
5. **Handle errors gracefully** with fallback providers
6. **Monitor usage** to stay within free tier limits

## Examples

See the `examples/` directory for complete usage examples:

- Basic search and scraping
- Competitor analysis
- Market research
- Content monitoring
- Sentiment analysis 