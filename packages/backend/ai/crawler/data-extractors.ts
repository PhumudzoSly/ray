import { CrawlResult, ParsedContent } from "./web-crawler";

// ============================================================================
// SAAS DATA EXTRACTORS
// ============================================================================

export interface SaasCompanyData {
  name: string;
  website: string;
  description?: string;
  foundedYear?: number;
  headquarters?: string;
  employeeCount?: number;
  fundingRaised?: number;
  lastFundingRound?: string;
  annualRevenue?: number;
  customerCount?: number;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface SaasPricingData {
  model: "SUBSCRIPTION" | "FREEMIUM" | "ONE_TIME" | "USAGE_BASED" | "HYBRID";
  tiers: Array<{
    name: string;
    price: string;
    billingCycle?: string;
    features: string[];
    limits?: Record<string, string>;
  }>;
  currency: string;
  hasFreeTier: boolean;
  enterprisePricing?: string;
}

export interface SaasFeatureData {
  features: Array<{
    name: string;
    description: string;
    category: string;
    isCore: boolean;
  }>;
  integrations: string[];
  technologyStack?: string[];
  apiAvailable: boolean;
  mobileApp: boolean;
}

export interface SaasMarketData {
  targetAudience: string[];
  useCases: string[];
  industries: string[];
  companySizes: string[];
  competitiveAdvantages: string[];
  testimonials: Array<{
    text: string;
    author?: string;
    company?: string;
  }>;
}

export interface SaasReviewData {
  rating: number;
  totalReviews: number;
  reviewPlatform: string;
  pros: string[];
  cons: string[];
  recentReviews: Array<{
    rating: number;
    text: string;
    date?: string;
    author?: string;
  }>;
}

// ============================================================================
// COMPANY DATA EXTRACTOR
// ============================================================================

export class CompanyDataExtractor {
  static extract(crawlResult: CrawlResult): SaasCompanyData | null {
    if (!crawlResult.success || !crawlResult.parsedContent) {
      return null;
    }

    const { parsedContent } = crawlResult;
    const url = new URL(crawlResult.url);

    if (parsedContent.type !== "html") {
      return null;
    }

    const data = parsedContent.data;
    const companyData: SaasCompanyData = {
      name: this.extractCompanyName(data, url),
      website: crawlResult.url,
    };

    // Extract description
    companyData.description = this.extractDescription(data);

    // Extract company information
    const companyInfo = this.extractCompanyInfo(data);
    Object.assign(companyData, companyInfo);

    // Extract social media
    companyData.socialMedia = this.extractSocialMedia(data);

    return companyData;
  }

  private static extractCompanyName(data: any, url: URL): string {
    // Try structured data first
    if (data.structuredData) {
      for (const key in data.structuredData) {
        const structured = data.structuredData[key];
        if (structured["@type"] === "Organization" && structured.name) {
          return structured.name;
        }
      }
    }

    // Try meta tags
    if (data.metadata["og:site_name"]) {
      return data.metadata["og:site_name"];
    }

    // Try title
    if (data.title) {
      const title = data.title.replace(/ - .*$/, "").replace(/ \| .*$/, "");
      if (title.length < 50) {
        return title;
      }
    }

    // Fallback to domain
    return url.hostname.replace("www.", "");
  }

  private static extractDescription(data: any): string | undefined {
    // Try meta description
    if (data.metadata.description) {
      return data.metadata.description;
    }

    if (data.metadata["og:description"]) {
      return data.metadata["og:description"];
    }

    // Try first paragraph
    const text = data.text;
    const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 50);
    if (paragraphs.length > 0) {
      return paragraphs[0].substring(0, 200) + "...";
    }

    return undefined;
  }

  private static extractCompanyInfo(data: any): Partial<SaasCompanyData> {
    const info: Partial<SaasCompanyData> = {};
    const text = data.text.toLowerCase();

    // Extract founded year
    const foundedMatch = text.match(/founded\s+(?:in\s+)?(\d{4})/i);
    if (foundedMatch) {
      info.foundedYear = parseInt(foundedMatch[1]);
    }

    // Extract employee count
    const employeeMatch = text.match(
      /(\d+(?:,\d+)?)\s+(?:employees?|team\s+members?)/i
    );
    if (employeeMatch) {
      info.employeeCount = parseInt(employeeMatch[1].replace(/,/g, ""));
    }

    // Extract funding
    const fundingMatch = text.match(
      /(?:raised|funding|investment)\s+(?:of\s+)?\$?(\d+(?:\.\d+)?)\s*(?:million|billion|m|b)/i
    );
    if (fundingMatch) {
      const amount = parseFloat(fundingMatch[1]);
      const unit = text.match(/(?:million|billion|m|b)/i)?.[0];
      if (unit?.includes("billion") || unit === "b") {
        info.fundingRaised = amount * 1000;
      } else {
        info.fundingRaised = amount;
      }
    }

    // Extract headquarters
    const locationMatch = text.match(
      /(?:headquartered|based|located)\s+(?:in\s+)?([^,]+(?:,\s*[^,]+)*)/i
    );
    if (locationMatch) {
      info.headquarters = locationMatch[1].trim();
    }

    return info;
  }

  private static extractSocialMedia(data: any): SaasCompanyData["socialMedia"] {
    const socialMedia: SaasCompanyData["socialMedia"] = {};
    const links = data.links || [];

    for (const link of links) {
      const href = link.href.toLowerCase();
      if (href.includes("linkedin.com")) {
        socialMedia.linkedin = link.href;
      } else if (href.includes("twitter.com") || href.includes("x.com")) {
        socialMedia.twitter = link.href;
      } else if (href.includes("facebook.com")) {
        socialMedia.facebook = link.href;
      }
    }

    return Object.keys(socialMedia).length > 0 ? socialMedia : undefined;
  }
}

// ============================================================================
// PRICING DATA EXTRACTOR
// ============================================================================

export class PricingDataExtractor {
  static extract(crawlResult: CrawlResult): SaasPricingData | null {
    if (!crawlResult.success || !crawlResult.parsedContent) {
      return null;
    }

    const { parsedContent } = crawlResult;

    if (parsedContent.type !== "html") {
      return null;
    }

    const data = parsedContent.data;
    const pricingData: SaasPricingData = {
      model: this.determinePricingModel(data),
      tiers: this.extractPricingTiers(data),
      currency: this.extractCurrency(data),
      hasFreeTier: this.hasFreeTier(data),
    };

    // Extract enterprise pricing
    const enterprisePricing = this.extractEnterprisePricing(data);
    if (enterprisePricing) {
      pricingData.enterprisePricing = enterprisePricing;
    }

    return pricingData.tiers.length > 0 ? pricingData : null;
  }

  private static determinePricingModel(data: any): SaasPricingData["model"] {
    const text = data.text.toLowerCase();

    if (
      text.includes("subscription") ||
      text.includes("monthly") ||
      text.includes("yearly")
    ) {
      return "SUBSCRIPTION";
    } else if (text.includes("freemium") || text.includes("free tier")) {
      return "FREEMIUM";
    } else if (
      text.includes("usage") ||
      text.includes("per") ||
      text.includes("pay as you go")
    ) {
      return "USAGE_BASED";
    } else if (text.includes("one time") || text.includes("lifetime")) {
      return "ONE_TIME";
    } else {
      return "HYBRID";
    }
  }

  private static extractPricingTiers(data: any): SaasPricingData["tiers"] {
    const tiers: SaasPricingData["tiers"] = [];
    const text = data.text;

    // Look for pricing patterns
    const pricingPatterns = [
      /\$(\d+(?:\.\d+)?)\s*(?:per\s+(month|year|user))?/gi,
      /(\d+(?:\.\d+)?)\s*\/\s*(month|year|user)/gi,
      /starting\s+at\s+\$(\d+(?:\.\d+)?)/gi,
    ];

    for (const pattern of pricingPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const price = match[1];
        const cycle = match[2] || "month";

        tiers.push({
          name: `Tier ${tiers.length + 1}`,
          price: `$${price}`,
          billingCycle: cycle,
          features: [],
        });
      }
    }

    return tiers;
  }

  private static extractCurrency(data: any): string {
    const text = data.text;
    if (text.includes("€") || text.includes("EUR")) return "EUR";
    if (text.includes("£") || text.includes("GBP")) return "GBP";
    return "USD";
  }

  private static hasFreeTier(data: any): boolean {
    const text = data.text.toLowerCase();
    return (
      text.includes("free") || text.includes("$0") || text.includes("0/month")
    );
  }

  private static extractEnterprisePricing(data: any): string | undefined {
    const text = data.text;
    const enterpriseMatch = text.match(
      /enterprise.*?(?:pricing|contact|custom)/i
    );
    return enterpriseMatch ? enterpriseMatch[0] : undefined;
  }
}

// ============================================================================
// FEATURE DATA EXTRACTOR
// ============================================================================

export class FeatureDataExtractor {
  static extract(crawlResult: CrawlResult): SaasFeatureData | null {
    if (!crawlResult.success || !crawlResult.parsedContent) {
      return null;
    }

    const { parsedContent } = crawlResult;

    if (parsedContent.type !== "html") {
      return null;
    }

    const data = parsedContent.data;
    const featureData: SaasFeatureData = {
      features: this.extractFeatures(data),
      integrations: this.extractIntegrations(data),
      apiAvailable: this.hasApi(data),
      mobileApp: this.hasMobileApp(data),
    };

    // Extract technology stack
    const techStack = this.extractTechnologyStack(data);
    if (techStack.length > 0) {
      featureData.technologyStack = techStack;
    }

    return featureData;
  }

  private static extractFeatures(data: any): SaasFeatureData["features"] {
    const features: SaasFeatureData["features"] = [];
    const text = data.text;

    // Look for feature lists
    const featurePatterns = [
      /features?:\s*([^.]*)/gi,
      /capabilities?:\s*([^.]*)/gi,
      /what\s+you\s+get:\s*([^.]*)/gi,
    ];

    for (const pattern of featurePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const featureText = match[1];
        const featureList = featureText
          .split(/[,;]/)
          .map((f) => f.trim())
          .filter((f) => f.length > 3);

        for (const feature of featureList) {
          features.push({
            name: feature,
            description: feature,
            category: "General",
            isCore: features.length < 5, // First few features are usually core
          });
        }
      }
    }

    return features;
  }

  private static extractIntegrations(data: any): string[] {
    const integrations: string[] = [];
    const text = data.text.toLowerCase();

    // Common integration keywords
    const integrationKeywords = [
      "slack",
      "zapier",
      "salesforce",
      "hubspot",
      "stripe",
      "paypal",
      "google",
      "microsoft",
      "aws",
      "azure",
      "github",
      "jira",
      "trello",
      "notion",
      "figma",
      "canva",
      "mailchimp",
      "intercom",
      "zendesk",
    ];

    for (const keyword of integrationKeywords) {
      if (text.includes(keyword)) {
        integrations.push(keyword);
      }
    }

    return integrations;
  }

  private static hasApi(data: any): boolean {
    const text = data.text.toLowerCase();
    return (
      text.includes("api") || text.includes("rest") || text.includes("webhook")
    );
  }

  private static hasMobileApp(data: any): boolean {
    const text = data.text.toLowerCase();
    return (
      text.includes("mobile app") ||
      text.includes("ios") ||
      text.includes("android")
    );
  }

  private static extractTechnologyStack(data: any): string[] {
    const techStack: string[] = [];
    const text = data.text.toLowerCase();

    // Common technology keywords
    const techKeywords = [
      "react",
      "vue",
      "angular",
      "node.js",
      "python",
      "java",
      "php",
      "mysql",
      "postgresql",
      "mongodb",
      "redis",
      "elasticsearch",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "gcp",
      "firebase",
    ];

    for (const keyword of techKeywords) {
      if (text.includes(keyword)) {
        techStack.push(keyword);
      }
    }

    return techStack;
  }
}

// ============================================================================
// MARKET DATA EXTRACTOR
// ============================================================================

export class MarketDataExtractor {
  static extract(crawlResult: CrawlResult): SaasMarketData | null {
    if (!crawlResult.success || !crawlResult.parsedContent) {
      return null;
    }

    const { parsedContent } = crawlResult;

    if (parsedContent.type !== "html") {
      return null;
    }

    const data = parsedContent.data;
    const marketData: SaasMarketData = {
      targetAudience: this.extractTargetAudience(data),
      useCases: this.extractUseCases(data),
      industries: this.extractIndustries(data),
      companySizes: this.extractCompanySizes(data),
      competitiveAdvantages: this.extractCompetitiveAdvantages(data),
      testimonials: this.extractTestimonials(data),
    };

    return marketData;
  }

  private static extractTargetAudience(data: any): string[] {
    const audience: string[] = [];
    const text = data.text.toLowerCase();

    const audienceKeywords = [
      "startups",
      "small business",
      "enterprise",
      "freelancers",
      "marketers",
      "developers",
      "designers",
      "sales teams",
      "hr teams",
      "finance teams",
      "product teams",
    ];

    for (const keyword of audienceKeywords) {
      if (text.includes(keyword)) {
        audience.push(keyword);
      }
    }

    return audience;
  }

  private static extractUseCases(data: any): string[] {
    const useCases: string[] = [];
    const text = data.text;

    const useCasePatterns = [
      /use\s+cases?:\s*([^.]*)/gi,
      /perfect\s+for:\s*([^.]*)/gi,
      /ideal\s+for:\s*([^.]*)/gi,
    ];

    for (const pattern of useCasePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const useCaseText = match[1];
        const useCaseList = useCaseText
          .split(/[,;]/)
          .map((u) => u.trim())
          .filter((u) => u.length > 3);
        useCases.push(...useCaseList);
      }
    }

    return useCases;
  }

  private static extractIndustries(data: any): string[] {
    const industries: string[] = [];
    const text = data.text.toLowerCase();

    const industryKeywords = [
      "healthcare",
      "finance",
      "education",
      "retail",
      "manufacturing",
      "real estate",
      "legal",
      "consulting",
      "agency",
      "ecommerce",
      "saas",
      "technology",
      "media",
      "entertainment",
    ];

    for (const keyword of industryKeywords) {
      if (text.includes(keyword)) {
        industries.push(keyword);
      }
    }

    return industries;
  }

  private static extractCompanySizes(data: any): string[] {
    const sizes: string[] = [];
    const text = data.text.toLowerCase();

    const sizeKeywords = [
      "1-10",
      "11-50",
      "51-200",
      "201-1000",
      "1000+",
      "small",
      "medium",
      "large",
      "enterprise",
    ];

    for (const keyword of sizeKeywords) {
      if (text.includes(keyword)) {
        sizes.push(keyword);
      }
    }

    return sizes;
  }

  private static extractCompetitiveAdvantages(data: any): string[] {
    const advantages: string[] = [];
    const text = data.text;

    const advantagePatterns = [
      /why\s+choose\s+us:\s*([^.]*)/gi,
      /advantages?:\s*([^.]*)/gi,
      /benefits?:\s*([^.]*)/gi,
    ];

    for (const pattern of advantagePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const advantageText = match[1];
        const advantageList = advantageText
          .split(/[,;]/)
          .map((a) => a.trim())
          .filter((a) => a.length > 3);
        advantages.push(...advantageList);
      }
    }

    return advantages;
  }

  private static extractTestimonials(
    data: any
  ): SaasMarketData["testimonials"] {
    const testimonials: SaasMarketData["testimonials"] = [];
    const text = data.text;

    // Look for testimonial patterns
    const testimonialPatterns = [/"([^"]{20,200})"/g, /'([^']{20,200})'/g];

    for (const pattern of testimonialPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const testimonialText = match[1];
        if (testimonialText.length > 20 && testimonialText.length < 200) {
          testimonials.push({
            text: testimonialText,
          });
        }
      }
    }

    return testimonials.slice(0, 5); // Limit to 5 testimonials
  }
}

// ============================================================================
// REVIEW DATA EXTRACTOR
// ============================================================================

export class ReviewDataExtractor {
  static extract(crawlResult: CrawlResult): SaasReviewData | null {
    if (!crawlResult.success || !crawlResult.parsedContent) {
      return null;
    }

    const { parsedContent } = crawlResult;

    if (parsedContent.type !== "html") {
      return null;
    }

    const data = parsedContent.data;
    const reviewData: SaasReviewData = {
      rating: this.extractRating(data),
      totalReviews: this.extractTotalReviews(data),
      reviewPlatform: this.extractReviewPlatform(data),
      pros: this.extractPros(data),
      cons: this.extractCons(data),
      recentReviews: this.extractRecentReviews(data),
    };

    return reviewData.rating > 0 ? reviewData : null;
  }

  private static extractRating(data: any): number {
    const text = data.text;

    // Look for rating patterns
    const ratingPatterns = [
      /(\d+(?:\.\d+)?)\s*\/\s*5/i,
      /(\d+(?:\.\d+)?)\s*out\s+of\s*5/i,
      /rating:\s*(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of ratingPatterns) {
      const match = text.match(pattern);
      if (match) {
        const rating = parseFloat(match[1]);
        if (rating >= 0 && rating <= 5) {
          return rating;
        }
      }
    }

    return 0;
  }

  private static extractTotalReviews(data: any): number {
    const text = data.text;

    const reviewPatterns = [
      /(\d+(?:,\d+)?)\s+reviews?/i,
      /(\d+(?:,\d+)?)\s+ratings?/i,
    ];

    for (const pattern of reviewPatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1].replace(/,/g, ""));
      }
    }

    return 0;
  }

  private static extractReviewPlatform(data: any): string {
    const text = data.text.toLowerCase();

    if (text.includes("g2")) return "G2";
    if (text.includes("capterra")) return "Capterra";
    if (text.includes("trustpilot")) return "Trustpilot";
    if (text.includes("google reviews")) return "Google Reviews";

    return "Unknown";
  }

  private static extractPros(data: any): string[] {
    const pros: string[] = [];
    const text = data.text;

    const proPatterns = [
      /pros?:\s*([^.]*)/gi,
      /advantages?:\s*([^.]*)/gi,
      /strengths?:\s*([^.]*)/gi,
    ];

    for (const pattern of proPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const proText = match[1];
        const proList = proText
          .split(/[,;]/)
          .map((p) => p.trim())
          .filter((p) => p.length > 3);
        pros.push(...proList);
      }
    }

    return pros;
  }

  private static extractCons(data: any): string[] {
    const cons: string[] = [];
    const text = data.text;

    const conPatterns = [
      /cons?:\s*([^.]*)/gi,
      /disadvantages?:\s*([^.]*)/gi,
      /weaknesses?:\s*([^.]*)/gi,
    ];

    for (const pattern of conPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const conText = match[1];
        const conList = conText
          .split(/[,;]/)
          .map((c) => c.trim())
          .filter((c) => c.length > 3);
        cons.push(...conList);
      }
    }

    return cons;
  }

  private static extractRecentReviews(
    data: any
  ): SaasReviewData["recentReviews"] {
    const reviews: SaasReviewData["recentReviews"] = [];
    const text = data.text;

    // Look for review patterns
    const reviewPatterns = [/"([^"]{20,200})"/g, /'([^']{20,200})'/g];

    for (const pattern of reviewPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const reviewText = match[1];
        if (reviewText.length > 20 && reviewText.length < 200) {
          reviews.push({
            rating: 4, // Default rating
            text: reviewText,
          });
        }
      }
    }

    return reviews.slice(0, 3); // Limit to 3 recent reviews
  }
}

// ============================================================================
// MAIN EXTRACTOR CLASS
// ============================================================================

export class SaasDataExtractor {
  static extractAll(crawlResult: CrawlResult) {
    return {
      company: CompanyDataExtractor.extract(crawlResult),
      pricing: PricingDataExtractor.extract(crawlResult),
      features: FeatureDataExtractor.extract(crawlResult),
      market: MarketDataExtractor.extract(crawlResult),
      reviews: ReviewDataExtractor.extract(crawlResult),
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default SaasDataExtractor;
