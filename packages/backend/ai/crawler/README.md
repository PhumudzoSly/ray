# Web Crawler & Data Extraction System

A comprehensive web crawling and data extraction system built specifically for SaaS validation and market research. This system uses reliable search APIs combined with intelligent web crawling for robust data collection.

## 🚀 Features

### Core Crawling
- **Rate-limited crawling** with configurable limits
- **Retry logic** with exponential backoff
- **User agent rotation** to avoid detection
- **Robots.txt compliance** (optional)
- **Batch crawling** for multiple URLs
- **Content parsing** for HTML, JSON, XML, and text

### Data Extraction
- **SaaS-specific extractors** for company, pricing, features, market, and review data
- **Structured data extraction** (JSON-LD, microdata)
- **Metadata extraction** (title, description, links)
- **Content cleaning** and text extraction

### Search Capabilities (Now Using Reliable APIs)
- **DuckDuckGo API** - Free, no API key required
- **Searx meta-search** - Free, aggregates multiple search engines
- **Optional paid APIs** - Brave, SerpAPI, Serper, Serpstack (with API keys)
- **Industry-specific search** on SaaS platforms
- **Specialized search methods** for competitors, market data, and reviews
- **Result filtering** and relevance scoring

### URL Discovery
- **Intelligent URL discovery** using multiple strategies
- **Search engine discovery** with query expansion
- **Industry platform discovery** (G2, Capterra, ProductHunt, etc.)
- **Sitemap and RSS discovery** for comprehensive coverage
- **Link following** to discover related content
- **Context-aware discovery** based on industry and company data

### Site Crawling
- **Complete site crawling** with depth control
- **Intelligent data type detection** (pricing, company, features, reviews, etc.)
- **Automatic sublink discovery** and filtering
- **Confidence scoring** for data type detection
- **Site mapping** with comprehensive statistics
- **SaaS data extraction** from entire sites

### Caching & Performance
- **In-memory caching** with TTL
- **Cache statistics** and monitoring
- **Batch operations** for efficiency
- **Database persistence** (placeholder for future implementation)

## 📦 Installation

The crawler system is already included in the backend package. Required dependencies:

```json
{
  "axios": "^1.7.9",
  "jsdom": "^24.0.0"
}
```

## 🔧 Usage

### Basic Crawling

```typescript
import { UnifiedCrawlerService } from './ai/crawler';

const crawler = new UnifiedCrawlerService();

// Crawl a single URL
const result = await crawler.crawl('https://example.com');
console.log('Success:', result.success);
console.log('Content:', result.parsedContent?.text);

// Crawl multiple URLs
const batchResults = await crawler.crawlBatch([
  'https://example.com',
  'https://example.org',
]);

crawler.destroy(); // Cleanup
```

### Data Extraction

```typescript
// Extract SaaS data from a company website
const saasData = await crawler.extractSaaSData('https://slack.com');

if (saasData) {
  console.log('Company:', saasData.company?.name);
  console.log('Pricing:', saasData.pricing?.model);
  console.log('Features:', saasData.features?.features?.length);
  console.log('Reviews:', saasData.reviews?.rating);
}

// Batch extraction
const urls = ['https://slack.com', 'https://notion.so'];
const batchData = await crawler.extractSaaSDataBatch(urls);
```

### Web Search (Now Using Reliable APIs)

```typescript
// Basic search using DuckDuckGo and Searx APIs
const results = await crawler.search('SaaS project management tools');

// Specialized searches
const competitors = await crawler.searchCompetitors('Slack', 'communication');
const marketData = await crawler.searchMarketData('project management');
const reviews = await crawler.searchCustomerReviews('Notion');

// Search with filters
const filteredResults = await crawler.search('SaaS pricing', {
  filters: {
    domain: 'g2.com',
    contentType: ['reviews', 'pricing'],
  },
});
```

### URL Discovery

```typescript
// Basic URL discovery
const urls = await crawler.discoverURLs('project management SaaS');

// Contextual discovery
const contextualUrls = await crawler.discoverURLs('CRM software', {
  industry: 'customer relationship management',
  companyName: 'Salesforce',
});

// Specialized discovery
const competitorUrls = await crawler.discoverCompetitorURLs('Slack', 'communication');
const marketUrls = await crawler.discoverMarketDataURLs('project management');
const reviewUrls = await crawler.discoverReviewURLs('Notion');
const techUrls = await crawler.discoverTechnologyURLs('artificial intelligence');
```

### Site Crawling

```typescript
// Basic site crawling
const siteMap = await crawler.crawlSite('https://vercel.com');

// Find pages by data type
const pricingPages = await crawler.findPagesByDataType('https://notion.so', 'pricing');
const companyPages = await crawler.findPagesByDataType('https://notion.so', 'company');
const featurePages = await crawler.findPagesByDataType('https://notion.so', 'features');

// Extract SaaS data from entire site
const extractedData = await crawler.extractSaaSDataFromSite('https://slack.com');

// Analyze site structure
console.log(`Pages crawled: ${siteMap.crawlStats.successfulCrawls}`);
console.log(`Data types found: ${Object.keys(siteMap.dataTypeSummary).join(', ')}`);
console.log(`Average confidence: ${(siteMap.pages.reduce((sum, p) => sum + p.confidence, 0) / siteMap.pages.length * 100).toFixed(1)}%`);
```

### Caching

```typescript
// Check cache stats
const stats = crawler.getCacheStats();
console.log('Hit rate:', stats.hitRate);

// Get cached data
const cached = await crawler.getCached('https://example.com');

// Clear cache
await crawler.clearCache();
```

## 🏗️ Architecture

### Core Components

1. **WebCrawler** (`web-crawler.ts`)
   - Handles HTTP requests with rate limiting
   - Parses different content types
   - Manages retry logic and error handling

2. **Data Extractors** (`data-extractors.ts`)
   - `CompanyDataExtractor`: Company information, funding, social media
   - `PricingDataExtractor`: Pricing models, tiers, enterprise pricing
   - `FeatureDataExtractor`: Features, integrations, technology stack
   - `MarketDataExtractor`: Target audience, use cases, testimonials
   - `ReviewDataExtractor`: Ratings, reviews, pros/cons

3. **Cache Manager** (`cache-manager.ts`)
   - In-memory caching with TTL
   - Cache statistics and cleanup
   - Batch operations

4. **Web Search Service** (`web-search-service.ts`) - **UPDATED**
   - **Uses reliable search APIs** (DuckDuckGo, Searx)
   - **No more direct search engine crawling**
   - Result processing and ranking
   - Specialized search methods
   - Content enrichment from discovered URLs

5. **URL Discovery Service** (`url-discovery.ts`)
   - Multiple discovery strategies
   - Context-aware URL generation
   - Specialized discovery methods

6. **Site Crawler Service** (`site-crawler.ts`)
   - Complete site crawling with depth control
   - Intelligent data type detection
   - Automatic sublink discovery
   - Site mapping and statistics

7. **Unified Service** (`index.ts`)
   - High-level interface combining all components
   - Simplified API for common use cases

### Data Flow

```
Query → Search APIs → URL Discovery → WebCrawler → Content Parsing → Data Extraction → Cache → Results
```

## ⚙️ Configuration

### Crawler Configuration

```typescript
const crawler = new WebCrawler({
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  rateLimit: 2, // requests per second
  maxConcurrent: 5,
  respectRobotsTxt: true,
});
```

### Cache Configuration

```typescript
const cache = new CacheManager({
  maxSize: 1000,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  persistToDatabase: true,
});
```

### Search Configuration (Updated)

```typescript
const searchService = new WebSearchService({
  maxResults: 15,
  maxDepth: 2,
  timeout: 30000,
  enableCache: true,
  // Use reliable search APIs
  searchEngines: ["duckduckgo", "searx"],
  resultFiltering: true,
  includeContent: true, // Enrich results with crawled content
});
```

### URL Discovery Configuration

```typescript
const discoveryService = new URLDiscoveryService({
  maxDiscoveryDepth: 3,
  maxUrlsPerSource: 50,
  enableLinkFollowing: true,
  enableSitemapDiscovery: true,
  enableRSSDiscovery: true,
  enableAPIDiscovery: true,
  respectRobotsTxt: true,
  discoveryTimeout: 30000,
});
```

### Site Crawler Configuration

```typescript
const siteCrawler = new SiteCrawler({
  maxDepth: 3,
  maxPages: 100,
  maxConcurrent: 5,
  respectRobotsTxt: true,
  followExternalLinks: false,
  crawlDelay: 1000,
  timeout: 30000,
  userAgent: 'SiteCrawler/1.0',
  enableDataDetection: true,
  dataDetectionThreshold: 0.7,
});
```

## 🔄 Integration with AI Agents

The crawler system has been integrated into all AI agents to provide reliable web search and data extraction:

### Updated Agents

1. **Competitor Discovery Agent**
   - Uses `searchCompetitors()` with reliable search APIs
   - Extracts competitor data from websites
   - Analyzes competitive landscape

2. **Market Size Agent**
   - Uses `searchMarketData()` for market research
   - Finds TAM, SAM, SOM data
   - Analyzes market growth and trends

3. **Customer Segments Agent**
   - Searches for customer demographics and pain points
   - Analyzes target audience data
   - Extracts customer behavior patterns

4. **Technology Trends Agent**
   - Searches for technology trends and feasibility
   - Analyzes technical requirements
   - Extracts technology stack information

### Example Integration

```typescript
// In an AI agent
const crawlerService = new UnifiedCrawlerService();

try {
  // Search for relevant data using reliable APIs
  const searchResults = await crawlerService.search(query);
  
  // Extract structured data from discovered URLs
  const extractedData = await crawlerService.extractSaaSDataBatch(urls);
  
  // Use data in AI analysis
  const analysis = await generateAnalysis(searchResults, extractedData);
  
} finally {
  crawlerService.destroy();
}
```

## 🛡️ Error Handling

The system includes comprehensive error handling:

```typescript
// Handle invalid URLs
const invalidResult = await crawler.crawl('invalid-url');
if (!invalidResult.success) {
  console.log('Error:', invalidResult.error);
}

// Handle network errors
const networkResult = await crawler.crawl('https://unreachable-site.com');
if (!networkResult.success) {
  console.log('Network error:', networkResult.error);
}

// Handle rate limiting
const batchResults = await crawler.crawlBatch(urls);
const successCount = batchResults.filter(r => r.success).length;
console.log(`Success rate: ${successCount}/${batchResults.length}`);
```

## 📊 Monitoring & Analytics

### Cache Statistics

```typescript
const stats = crawler.getCacheStats();
console.log({
  size: stats.size,
  maxSize: stats.maxSize,
  hitRate: stats.hitRate,
  totalHits: stats.totalHits,
  totalMisses: stats.totalMisses,
  oldestEntry: stats.oldestEntry,
  newestEntry: stats.newestEntry,
});
```

### Performance Metrics

- **Crawl duration** per URL
- **Success rate** for batch operations
- **Cache hit rate** for performance optimization
- **Error rates** by error type
- **Search API success rates**

## 🔮 Future Enhancements

### Planned Features

1. **Database Persistence**
   - Save cache to database for persistence
   - Historical data tracking
   - Analytics and reporting

2. **Advanced Search**
   - Semantic search capabilities
   - Natural language query processing
   - Search result clustering

3. **Content Analysis**
   - Sentiment analysis for reviews
   - Topic modeling for content
   - Trend detection algorithms

4. **Scalability**
   - Distributed crawling
   - Load balancing
   - Queue management

5. **Compliance**
   - GDPR compliance tools
   - Data retention policies
   - Privacy controls

## 🧪 Testing

Run the example usage to test the system:

```typescript
import { runAllExamples } from './example-usage';
import { runAllURLDiscoveryExamples } from './url-discovery-example';
import { runAllSiteCrawlerExamples } from './site-crawler-example';

await runAllExamples();
await runAllURLDiscoveryExamples();
await runAllSiteCrawlerExamples();
```

## 📝 License

This crawler system is part of the Ray SaaS validation platform and follows the same licensing terms.

## 🤝 Contributing

When contributing to the crawler system:

1. Follow the existing code structure and patterns
2. Add comprehensive error handling
3. Include TypeScript types for all new features
4. Update the README for new functionality
5. Add examples for new features

## 🐛 Troubleshooting

### Common Issues

1. **Rate Limiting**: Reduce `rateLimit` in crawler configuration
2. **Memory Usage**: Reduce `maxSize` in cache configuration
3. **Network Errors**: Increase `timeout` and `maxRetries`
4. **Content Parsing**: Check if content type is supported
5. **Search API Failures**: Check API availability and rate limits

### Debug Mode

Enable debug logging by setting environment variables:

```bash
DEBUG_CRAWLER=true
DEBUG_CACHE=true
DEBUG_SEARCH=true
```

## ✅ **Key Improvements Made**

1. **Replaced unreliable direct search engine crawling** with proper search APIs
2. **DuckDuckGo and Searx APIs** provide free, reliable search results
3. **Content enrichment** from discovered URLs for better data quality
4. **Improved error handling** and fallback mechanisms
5. **Better performance** with faster, more reliable search results

This comprehensive crawler system now provides a robust foundation for web data extraction and analysis, enabling the AI agents to gather real-time market intelligence using reliable search APIs combined with intelligent web crawling. 