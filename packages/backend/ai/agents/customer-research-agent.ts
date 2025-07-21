import { generateText } from '@ai-sdk/google';
import { UnifiedCrawlerService } from '../crawler';

// ============================================================================
// CUSTOMER RESEARCH AGENT CONFIGURATION
// ============================================================================

interface CustomerResearchConfig {
  maxReviews: number;
  maxFeedbackSources: number;
  includeSocialMedia: boolean;
  includeNewsArticles: boolean;
  includeTechnicalAnalysis: boolean;
  reviewPlatforms: string[];
  newsSources: string[];
  socialPlatforms: string[];
}

const DEFAULT_CUSTOMER_RESEARCH_CONFIG: CustomerResearchConfig = {
  maxReviews: 20,
  maxFeedbackSources: 10,
  includeSocialMedia: true,
  includeNewsArticles: true,
  includeTechnicalAnalysis: true,
  reviewPlatforms: [
    'g2.com',
    'capterra.com',
    'trustpilot.com',
    'producthunt.com',
    'alternativeto.net',
    'saasradar.net',
  ],
  newsSources: [
    'techcrunch.com',
    'venturebeat.com',
    'wired.com',
    'theverge.com',
    'arstechnica.com',
  ],
  socialPlatforms: [
    'twitter.com',
    'linkedin.com',
    'reddit.com',
  ],
};

// ============================================================================
// CUSTOMER RESEARCH DATA TYPES
// ============================================================================

export interface CustomerReview {
  source: string;
  rating?: number;
  title?: string;
  content: string;
  author?: string;
  date?: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  pros?: string[];
  cons?: string[];
}

export interface CustomerFeedback {
  source: string;
  type: 'review' | 'social_media' | 'news' | 'forum' | 'support' | 'feature_request';
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: 'pricing' | 'features' | 'support' | 'performance' | 'usability' | 'integration' | 'other';
  impact: 'high' | 'medium' | 'low';
  date?: Date;
  author?: string;
  url?: string;
}

export interface MissingFeature {
  feature: string;
  description: string;
  frequency: number;
  sources: string[];
  impact: 'high' | 'medium' | 'low';
  category: 'core' | 'integration' | 'analytics' | 'security' | 'customization' | 'mobile' | 'other';
  requestedBy: string[];
}

export interface CustomerInsight {
  insight: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'trend' | 'pattern';
  confidence: number;
  sources: string[];
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export interface CustomerResearchData {
  companyName: string;
  industry: string;
  researchDate: Date;
  
  // Reviews and Ratings
  reviews: CustomerReview[];
  averageRating?: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  
  // Feedback Analysis
  feedback: CustomerFeedback[];
  feedbackSummary: {
    positive: number;
    negative: number;
    neutral: number;
    byCategory: Record<string, number>;
    byImpact: Record<string, number>;
  };
  
  // Missing Features
  missingFeatures: MissingFeature[];
  topMissingFeatures: MissingFeature[];
  
  // Customer Insights
  insights: CustomerInsight[];
  keyStrengths: string[];
  keyWeaknesses: string[];
  opportunities: string[];
  threats: string[];
  
  // Market Position
  marketPosition: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    competitiveAdvantages: string[];
    competitiveDisadvantages: string[];
  };
  
  // Technical Analysis
  technicalAnalysis?: {
    techStack?: string[];
    integrations?: string[];
    apiCapabilities?: string[];
    performanceIssues?: string[];
    securityConcerns?: string[];
  };
  
  // Sources and Metadata
  sources: {
    reviewPlatforms: string[];
    newsArticles: string[];
    socialMediaPosts: string[];
    forums: string[];
    supportTickets: string[];
  };
  
  researchQuality: {
    confidence: number;
    coverage: number;
    recency: number;
    sourceDiversity: number;
  };
}

// ============================================================================
// MAIN CUSTOMER RESEARCH AGENT
// ============================================================================

export class CustomerResearchAgent {
  private config: CustomerResearchConfig;
  private crawler: UnifiedCrawlerService;

  constructor(config: Partial<CustomerResearchConfig> = {}) {
    this.config = { ...DEFAULT_CUSTOMER_RESEARCH_CONFIG, ...config };
    this.crawler = new UnifiedCrawlerService();
  }

  // ============================================================================
  // MAIN RESEARCH METHOD
  // ============================================================================

  async researchCustomer(companyName: string, industry: string): Promise<CustomerResearchData> {
    console.log(`🔍 Starting comprehensive research for ${companyName} in ${industry}...`);
    
    const startTime = Date.now();
    const researchDate = new Date();
    
    try {
      // Step 1: Gather reviews from multiple platforms
      console.log('📊 Gathering customer reviews...');
      const reviews = await this.gatherCustomerReviews(companyName, industry);
      
      // Step 2: Collect feedback from various sources
      console.log('💬 Collecting customer feedback...');
      const feedback = await this.gatherCustomerFeedback(companyName, industry);
      
      // Step 3: Identify missing features
      console.log('🔍 Identifying missing features...');
      const missingFeatures = await this.identifyMissingFeatures(companyName, industry, feedback);
      
      // Step 4: Generate customer insights
      console.log('🧠 Generating customer insights...');
      const insights = await this.generateCustomerInsights(companyName, industry, reviews, feedback, missingFeatures);
      
      // Step 5: Analyze market position
      console.log('📈 Analyzing market position...');
      const marketPosition = await this.analyzeMarketPosition(companyName, industry, reviews, feedback, insights);
      
      // Step 6: Technical analysis (if enabled)
      let technicalAnalysis;
      if (this.config.includeTechnicalAnalysis) {
        console.log('⚙️ Performing technical analysis...');
        technicalAnalysis = await this.performTechnicalAnalysis(companyName, industry);
      }
      
      // Step 7: Calculate research quality metrics
      const researchQuality = this.calculateResearchQuality(reviews, feedback, insights);
      
      // Step 8: Compile final research data
      const researchData: CustomerResearchData = {
        companyName,
        industry,
        researchDate,
        reviews,
        averageRating: this.calculateAverageRating(reviews),
        totalReviews: reviews.length,
        ratingDistribution: this.calculateRatingDistribution(reviews),
        feedback,
        feedbackSummary: this.summarizeFeedback(feedback),
        missingFeatures,
        topMissingFeatures: missingFeatures
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 10),
        insights,
        keyStrengths: insights.filter(i => i.type === 'strength').map(i => i.insight),
        keyWeaknesses: insights.filter(i => i.type === 'weakness').map(i => i.insight),
        opportunities: insights.filter(i => i.type === 'opportunity').map(i => i.insight),
        threats: insights.filter(i => i.type === 'threat').map(i => i.insight),
        marketPosition,
        technicalAnalysis,
        sources: this.collectSources(reviews, feedback),
        researchQuality,
      };
      
      const researchTime = Date.now() - startTime;
      console.log(`✅ Customer research completed in ${researchTime}ms`);
      console.log(`📊 Found ${reviews.length} reviews, ${feedback.length} feedback items, ${missingFeatures.length} missing features`);
      
      return researchData;
      
    } finally {
      this.crawler.destroy();
    }
  }

  // ============================================================================
  // REVIEW GATHERING
  // ============================================================================

  private async gatherCustomerReviews(companyName: string, industry: string): Promise<CustomerReview[]> {
    const reviews: CustomerReview[] = [];
    
    // Search for reviews on review platforms
    for (const platform of this.config.reviewPlatforms) {
      try {
        const reviewUrls = await this.crawler.discoverReviewURLs(companyName);
        const platformUrls = reviewUrls.filter(url => url.includes(platform));
        
        for (const url of platformUrls.slice(0, 5)) { // Limit per platform
          const crawlResult = await this.crawler.crawl(url);
          if (crawlResult.success) {
            const extractedReviews = this.extractReviewsFromPage(crawlResult, platform);
            reviews.push(...extractedReviews);
          }
        }
      } catch (error) {
        console.warn(`Failed to gather reviews from ${platform}:`, error);
      }
    }
    
    // Use AI to analyze and enhance reviews
    const enhancedReviews = await this.enhanceReviewsWithAI(reviews, companyName);
    
    return enhancedReviews.slice(0, this.config.maxReviews);
  }

  private extractReviewsFromPage(crawlResult: any, platform: string): CustomerReview[] {
    const reviews: CustomerReview[] = [];
    
    if (crawlResult.parsedContent?.type === 'html') {
      const content = crawlResult.parsedContent.data.text || '';
      
      // Extract review-like content using patterns
      const reviewPatterns = [
        /rating[:\s]*(\d+(?:\.\d+)?)/gi,
        /stars?[:\s]*(\d+(?:\.\d+)?)/gi,
        /(\d+(?:\.\d+)?)\s*out\s*of\s*\d+/gi,
      ];
      
      // Simple extraction - in a real implementation, you'd use more sophisticated parsing
      const lines = content.split('\n').filter(line => line.trim().length > 50);
      
      for (const line of lines.slice(0, 10)) {
        if (this.looksLikeReview(line)) {
          reviews.push({
            source: platform,
            content: line.trim(),
            sentiment: this.analyzeSentiment(line),
            tags: this.extractTags(line),
            date: new Date(),
          });
        }
      }
    }
    
    return reviews;
  }

  private looksLikeReview(text: string): boolean {
    const reviewKeywords = [
      'great', 'good', 'bad', 'excellent', 'terrible', 'amazing', 'awful',
      'love', 'hate', 'like', 'dislike', 'recommend', 'avoid', 'useful',
      'helpful', 'frustrating', 'easy', 'difficult', 'fast', 'slow',
    ];
    
    const lowerText = text.toLowerCase();
    return reviewKeywords.some(keyword => lowerText.includes(keyword));
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['great', 'good', 'excellent', 'amazing', 'love', 'like', 'recommend', 'useful', 'helpful', 'easy', 'fast'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'avoid', 'frustrating', 'difficult', 'slow'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const commonTags = ['pricing', 'features', 'support', 'performance', 'usability', 'integration'];
    
    const lowerText = text.toLowerCase();
    for (const tag of commonTags) {
      if (lowerText.includes(tag)) {
        tags.push(tag);
      }
    }
    
    return tags;
  }

  private async enhanceReviewsWithAI(reviews: CustomerReview[], companyName: string): Promise<CustomerReview[]> {
    const enhancedReviews: CustomerReview[] = [];
    
    for (const review of reviews) {
      try {
        const prompt = `
Analyze this customer review for ${companyName} and extract structured information:

Review: "${review.content}"

Please provide:
1. A sentiment score (positive/negative/neutral)
2. Key pros (what customers like)
3. Key cons (what customers dislike)
4. Rating (1-5 if mentioned)
5. Categories/tags

Format as JSON:
{
  "sentiment": "positive|negative|neutral",
  "rating": 4,
  "pros": ["pro1", "pro2"],
  "cons": ["con1", "con2"],
  "tags": ["tag1", "tag2"]
}
        `;
        
        const response = await generateText({
          model: 'gemini-1.5-flash',
          prompt,
          maxTokens: 500,
        });
        
        try {
          const analysis = JSON.parse(response.text);
          enhancedReviews.push({
            ...review,
            sentiment: analysis.sentiment || review.sentiment,
            rating: analysis.rating,
            pros: analysis.pros,
            cons: analysis.cons,
            tags: [...review.tags, ...(analysis.tags || [])],
          });
        } catch (parseError) {
          enhancedReviews.push(review);
        }
        
      } catch (error) {
        enhancedReviews.push(review);
      }
    }
    
    return enhancedReviews;
  }

  // ============================================================================
  // FEEDBACK GATHERING
  // ============================================================================

  private async gatherCustomerFeedback(companyName: string, industry: string): Promise<CustomerFeedback[]> {
    const feedback: CustomerFeedback[] = [];
    
    // Gather feedback from multiple sources
    const sources = [
      { type: 'social_media' as const, enabled: this.config.includeSocialMedia },
      { type: 'news' as const, enabled: this.config.includeNewsArticles },
      { type: 'forum' as const, enabled: true },
      { type: 'support' as const, enabled: true },
    ];
    
    for (const source of sources) {
      if (source.enabled) {
        const sourceFeedback = await this.gatherFeedbackFromSource(companyName, industry, source.type);
        feedback.push(...sourceFeedback);
      }
    }
    
    return feedback.slice(0, this.config.maxFeedbackSources);
  }

  private async gatherFeedbackFromSource(
    companyName: string,
    industry: string,
    sourceType: CustomerFeedback['type']
  ): Promise<CustomerFeedback[]> {
    const feedback: CustomerFeedback[] = [];
    
    try {
      let searchQueries: string[];
      
      switch (sourceType) {
        case 'social_media':
          searchQueries = [
            `${companyName} review`,
            `${companyName} feedback`,
            `${companyName} problems`,
            `${companyName} issues`,
            `${companyName} complaints`,
          ];
          break;
        case 'news':
          searchQueries = [
            `${companyName} review`,
            `${companyName} analysis`,
            `${companyName} problems`,
            `${companyName} issues`,
          ];
          break;
        case 'forum':
          searchQueries = [
            `${companyName} forum`,
            `${companyName} community`,
            `${companyName} discussion`,
            `${companyName} problems`,
          ];
          break;
        case 'support':
          searchQueries = [
            `${companyName} support`,
            `${companyName} help`,
            `${companyName} troubleshooting`,
            `${companyName} issues`,
          ];
          break;
        default:
          searchQueries = [`${companyName} feedback`];
      }
      
      for (const query of searchQueries) {
        const urls = await this.crawler.discoverURLs(query, { companyName, industry });
        
        for (const url of urls.slice(0, 3)) {
          const crawlResult = await this.crawler.crawl(url);
          if (crawlResult.success) {
            const extractedFeedback = this.extractFeedbackFromPage(crawlResult, sourceType, url);
            feedback.push(...extractedFeedback);
          }
        }
      }
      
    } catch (error) {
      console.warn(`Failed to gather ${sourceType} feedback:`, error);
    }
    
    return feedback;
  }

  private extractFeedbackFromPage(
    crawlResult: any,
    sourceType: CustomerFeedback['type'],
    url: string
  ): CustomerFeedback[] {
    const feedback: CustomerFeedback[] = [];
    
    if (crawlResult.parsedContent?.type === 'html') {
      const content = crawlResult.parsedContent.data.text || '';
      const lines = content.split('\n').filter(line => line.trim().length > 30);
      
      for (const line of lines.slice(0, 5)) {
        if (this.looksLikeFeedback(line)) {
          feedback.push({
            source: url,
            type: sourceType,
            content: line.trim(),
            sentiment: this.analyzeSentiment(line),
            category: this.categorizeFeedback(line),
            impact: this.assessImpact(line),
            date: new Date(),
            url,
          });
        }
      }
    }
    
    return feedback;
  }

  private looksLikeFeedback(text: string): boolean {
    const feedbackKeywords = [
      'problem', 'issue', 'bug', 'error', 'complaint', 'frustration',
      'suggestion', 'request', 'need', 'want', 'wish', 'hope',
      'improvement', 'enhancement', 'feature', 'functionality',
    ];
    
    const lowerText = text.toLowerCase();
    return feedbackKeywords.some(keyword => lowerText.includes(keyword));
  }

  private categorizeFeedback(text: string): CustomerFeedback['category'] {
    const categories = {
      pricing: ['price', 'cost', 'expensive', 'cheap', 'billing', 'subscription'],
      features: ['feature', 'functionality', 'capability', 'tool', 'option'],
      support: ['support', 'help', 'assistance', 'customer service', 'response'],
      performance: ['slow', 'fast', 'performance', 'speed', 'lag', 'crash'],
      usability: ['easy', 'difficult', 'user-friendly', 'complicated', 'intuitive'],
      integration: ['integration', 'api', 'connect', 'sync', 'import', 'export'],
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category as CustomerFeedback['category'];
      }
    }
    
    return 'other';
  }

  private assessImpact(text: string): 'high' | 'medium' | 'low' {
    const highImpactWords = ['critical', 'urgent', 'broken', 'unusable', 'terrible', 'awful'];
    const mediumImpactWords = ['problem', 'issue', 'annoying', 'frustrating', 'difficult'];
    
    const lowerText = text.toLowerCase();
    
    if (highImpactWords.some(word => lowerText.includes(word))) return 'high';
    if (mediumImpactWords.some(word => lowerText.includes(word))) return 'medium';
    return 'low';
  }

  // ============================================================================
  // MISSING FEATURES IDENTIFICATION
  // ============================================================================

  private async identifyMissingFeatures(
    companyName: string,
    industry: string,
    feedback: CustomerFeedback[]
  ): Promise<MissingFeature[]> {
    const missingFeatures: MissingFeature[] = [];
    
    // Extract feature requests from feedback
    const featureRequests = feedback.filter(f => 
      f.category === 'features' && 
      f.content.toLowerCase().includes('wish') || 
      f.content.toLowerCase().includes('need') ||
      f.content.toLowerCase().includes('want') ||
      f.content.toLowerCase().includes('missing')
    );
    
    // Group similar feature requests
    const featureGroups = this.groupFeatureRequests(featureRequests);
    
    // Use AI to analyze and categorize missing features
    const analyzedFeatures = await this.analyzeMissingFeaturesWithAI(featureGroups, companyName, industry);
    
    return analyzedFeatures;
  }

  private groupFeatureRequests(featureRequests: CustomerFeedback[]): Map<string, CustomerFeedback[]> {
    const groups = new Map<string, CustomerFeedback[]>();
    
    for (const request of featureRequests) {
      const key = this.extractFeatureKey(request.content);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(request);
    }
    
    return groups;
  }

  private extractFeatureKey(content: string): string {
    // Simple keyword extraction - in a real implementation, you'd use NLP
    const featureKeywords = [
      'mobile app', 'api', 'integration', 'analytics', 'reporting',
      'automation', 'workflow', 'collaboration', 'security', 'backup',
      'export', 'import', 'sync', 'notification', 'dashboard',
    ];
    
    const lowerContent = content.toLowerCase();
    
    for (const keyword of featureKeywords) {
      if (lowerContent.includes(keyword)) {
        return keyword;
      }
    }
    
    return 'other';
  }

  private async analyzeMissingFeaturesWithAI(
    featureGroups: Map<string, CustomerFeedback[]>,
    companyName: string,
    industry: string
  ): Promise<MissingFeature[]> {
    const missingFeatures: MissingFeature[] = [];
    
    for (const [featureKey, requests] of featureGroups) {
      try {
        const prompt = `
Analyze these customer feedback items requesting missing features for ${companyName} in the ${industry} industry:

Feature Key: ${featureKey}
Requests: ${requests.map(r => r.content).join('\n')}

Please provide:
1. A clear feature name
2. Detailed description
3. Category (core/integration/analytics/security/customization/mobile/other)
4. Impact level (high/medium/low)
5. Frequency count

Format as JSON:
{
  "feature": "Feature Name",
  "description": "Detailed description",
  "category": "core|integration|analytics|security|customization|mobile|other",
  "impact": "high|medium|low",
  "frequency": 5
}
        `;
        
        const response = await generateText({
          model: 'gemini-1.5-flash',
          prompt,
          maxTokens: 500,
        });
        
        try {
          const analysis = JSON.parse(response.text);
          missingFeatures.push({
            feature: analysis.feature,
            description: analysis.description,
            frequency: analysis.frequency || requests.length,
            sources: requests.map(r => r.source),
            impact: analysis.impact,
            category: analysis.category,
            requestedBy: requests.map(r => r.author || 'anonymous'),
          });
        } catch (parseError) {
          // Fallback to basic analysis
          missingFeatures.push({
            feature: featureKey,
            description: `Requested by ${requests.length} customers`,
            frequency: requests.length,
            sources: requests.map(r => r.source),
            impact: 'medium',
            category: 'other',
            requestedBy: requests.map(r => r.author || 'anonymous'),
          });
        }
        
      } catch (error) {
        console.warn(`Failed to analyze missing feature ${featureKey}:`, error);
      }
    }
    
    return missingFeatures;
  }

  // ============================================================================
  // INSIGHTS GENERATION
  // ============================================================================

  private async generateCustomerInsights(
    companyName: string,
    industry: string,
    reviews: CustomerReview[],
    feedback: CustomerFeedback[],
    missingFeatures: MissingFeature[]
  ): Promise<CustomerInsight[]> {
    const insights: CustomerInsight[] = [];
    
    try {
      const prompt = `
Analyze this customer research data for ${companyName} in the ${industry} industry and generate strategic insights:

Reviews (${reviews.length}):
${reviews.map(r => `- ${r.sentiment}: ${r.content.substring(0, 100)}...`).join('\n')}

Feedback (${feedback.length}):
${feedback.map(f => `- ${f.category} (${f.sentiment}): ${f.content.substring(0, 100)}...`).join('\n')}

Missing Features (${missingFeatures.length}):
${missingFeatures.map(f => `- ${f.feature}: ${f.description}`).join('\n')}

Generate insights in these categories:
1. Strengths (what customers love)
2. Weaknesses (what customers dislike)
3. Opportunities (potential improvements)
4. Threats (competitive risks)
5. Trends (emerging patterns)
6. Patterns (recurring themes)

For each insight, provide:
- Clear, actionable insight
- Type (strength/weakness/opportunity/threat/trend/pattern)
- Confidence (0-1)
- Impact (high/medium/low)
- Category
- Supporting sources

Format as JSON array of insights.
        `;
        
        const response = await generateText({
          model: 'gemini-1.5-flash',
          prompt,
          maxTokens: 1000,
        });
        
        try {
          const aiInsights = JSON.parse(response.text);
          insights.push(...aiInsights);
        } catch (parseError) {
          // Fallback to basic insights
          insights.push(...this.generateBasicInsights(reviews, feedback, missingFeatures));
        }
        
      } catch (error) {
        console.warn('Failed to generate AI insights, using fallback:', error);
        insights.push(...this.generateBasicInsights(reviews, feedback, missingFeatures));
      }
      
    } catch (error) {
      console.warn('Failed to generate customer insights:', error);
    }
    
    return insights;
  }

  private generateBasicInsights(
    reviews: CustomerReview[],
    feedback: CustomerFeedback[],
    missingFeatures: MissingFeature[]
  ): CustomerInsight[] {
    const insights: CustomerInsight[] = [];
    
    // Analyze sentiment distribution
    const positiveReviews = reviews.filter(r => r.sentiment === 'positive');
    const negativeReviews = reviews.filter(r => r.sentiment === 'negative');
    
    if (positiveReviews.length > negativeReviews.length) {
      insights.push({
        insight: 'Customers generally have positive experiences',
        type: 'strength',
        confidence: 0.8,
        sources: positiveReviews.map(r => r.source),
        impact: 'high',
        category: 'customer_satisfaction',
      });
    }
    
    if (negativeReviews.length > 0) {
      insights.push({
        insight: 'Some customers report negative experiences',
        type: 'weakness',
        confidence: 0.7,
        sources: negativeReviews.map(r => r.source),
        impact: 'medium',
        category: 'customer_satisfaction',
      });
    }
    
    // Analyze missing features
    if (missingFeatures.length > 0) {
      const highImpactFeatures = missingFeatures.filter(f => f.impact === 'high');
      if (highImpactFeatures.length > 0) {
        insights.push({
          insight: `High demand for ${highImpactFeatures.length} missing features`,
          type: 'opportunity',
          confidence: 0.9,
          sources: highImpactFeatures.flatMap(f => f.sources),
          impact: 'high',
          category: 'product_development',
        });
      }
    }
    
    return insights;
  }

  // ============================================================================
  // MARKET POSITION ANALYSIS
  // ============================================================================

  private async analyzeMarketPosition(
    companyName: string,
    industry: string,
    reviews: CustomerReview[],
    feedback: CustomerFeedback[],
    insights: CustomerInsight[]
  ): Promise<CustomerResearchData['marketPosition']> {
    try {
      const prompt = `
Analyze the market position of ${companyName} in the ${industry} industry based on customer research:

Reviews: ${reviews.length}
Feedback: ${feedback.length}
Insights: ${insights.length}

Key insights:
${insights.map(i => `- ${i.type}: ${i.insight}`).join('\n')}

Provide a SWOT analysis and competitive positioning:

1. Strengths (internal advantages)
2. Weaknesses (internal disadvantages)
3. Opportunities (external opportunities)
4. Threats (external threats)
5. Competitive advantages
6. Competitive disadvantages

Format as JSON with these fields.
        `;
        
        const response = await generateText({
          model: 'gemini-1.5-flash',
          prompt,
          maxTokens: 800,
        });
        
        try {
          return JSON.parse(response.text);
        } catch (parseError) {
          return this.generateBasicMarketPosition(insights);
        }
        
      } catch (error) {
        console.warn('Failed to analyze market position:', error);
        return this.generateBasicMarketPosition(insights);
      }
    } catch (error) {
      return this.generateBasicMarketPosition(insights);
    }
  }

  private generateBasicMarketPosition(insights: CustomerInsight[]): CustomerResearchData['marketPosition'] {
    return {
      strengths: insights.filter(i => i.type === 'strength').map(i => i.insight),
      weaknesses: insights.filter(i => i.type === 'weakness').map(i => i.insight),
      opportunities: insights.filter(i => i.type === 'opportunity').map(i => i.insight),
      threats: insights.filter(i => i.type === 'threat').map(i => i.insight),
      competitiveAdvantages: insights.filter(i => i.type === 'strength').map(i => i.insight),
      competitiveDisadvantages: insights.filter(i => i.type === 'weakness').map(i => i.insight),
    };
  }

  // ============================================================================
  // TECHNICAL ANALYSIS
  // ============================================================================

  private async performTechnicalAnalysis(companyName: string, industry: string): Promise<CustomerResearchData['technicalAnalysis']> {
    try {
      // Crawl the company's website for technical information
      const siteMap = await this.crawler.crawlSite(`https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`);
      
      // Look for technical pages
      const techPages = siteMap.pages.filter(page => 
        page.dataTypes.some(dt => dt.type === 'api' || dt.type === 'docs')
      );
      
      // Extract technical information
      const technicalInfo = {
        techStack: [] as string[],
        integrations: [] as string[],
        apiCapabilities: [] as string[],
        performanceIssues: [] as string[],
        securityConcerns: [] as string[],
      };
      
      // Analyze technical pages
      for (const page of techPages.slice(0, 5)) {
        const crawlResult = await this.crawler.crawl(page.url);
        if (crawlResult.success) {
          const techData = this.extractTechnicalData(crawlResult);
          Object.assign(technicalInfo, techData);
        }
      }
      
      return technicalInfo;
      
    } catch (error) {
      console.warn('Failed to perform technical analysis:', error);
      return undefined;
    }
  }

  private extractTechnicalData(crawlResult: any): Partial<CustomerResearchData['technicalAnalysis']> {
    const content = crawlResult.parsedContent?.data?.text || '';
    const lowerContent = content.toLowerCase();
    
    const techData: Partial<CustomerResearchData['technicalAnalysis']> = {};
    
    // Extract tech stack mentions
    const techStackKeywords = ['react', 'angular', 'vue', 'node', 'python', 'java', 'aws', 'azure', 'gcp'];
    techData.techStack = techStackKeywords.filter(tech => lowerContent.includes(tech));
    
    // Extract integration mentions
    const integrationKeywords = ['slack', 'zapier', 'salesforce', 'hubspot', 'stripe', 'paypal'];
    techData.integrations = integrationKeywords.filter(integration => lowerContent.includes(integration));
    
    // Extract API capabilities
    if (lowerContent.includes('api') || lowerContent.includes('rest') || lowerContent.includes('graphql')) {
      techData.apiCapabilities = ['REST API', 'GraphQL', 'Webhooks'];
    }
    
    return techData;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private calculateAverageRating(reviews: CustomerReview[]): number | undefined {
    const ratings = reviews.map(r => r.rating).filter(r => r !== undefined);
    if (ratings.length === 0) return undefined;
    return ratings.reduce((sum, rating) => sum + rating!, 0) / ratings.length;
  }

  private calculateRatingDistribution(reviews: CustomerReview[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const review of reviews) {
      if (review.rating) {
        const rating = Math.floor(review.rating).toString();
        distribution[rating] = (distribution[rating] || 0) + 1;
      }
    }
    
    return distribution;
  }

  private summarizeFeedback(feedback: CustomerFeedback[]): CustomerResearchData['feedbackSummary'] {
    const summary = {
      positive: 0,
      negative: 0,
      neutral: 0,
      byCategory: {} as Record<string, number>,
      byImpact: {} as Record<string, number>,
    };
    
    for (const item of feedback) {
      summary[item.sentiment]++;
      summary.byCategory[item.category] = (summary.byCategory[item.category] || 0) + 1;
      summary.byImpact[item.impact] = (summary.byImpact[item.impact] || 0) + 1;
    }
    
    return summary;
  }

  private collectSources(reviews: CustomerReview[], feedback: CustomerFeedback[]): CustomerResearchData['sources'] {
    return {
      reviewPlatforms: [...new Set(reviews.map(r => r.source))],
      newsArticles: feedback.filter(f => f.type === 'news').map(f => f.source),
      socialMediaPosts: feedback.filter(f => f.type === 'social_media').map(f => f.source),
      forums: feedback.filter(f => f.type === 'forum').map(f => f.source),
      supportTickets: feedback.filter(f => f.type === 'support').map(f => f.source),
    };
  }

  private calculateResearchQuality(
    reviews: CustomerReview[],
    feedback: CustomerFeedback[],
    insights: CustomerInsight[]
  ): CustomerResearchData['researchQuality'] {
    const totalDataPoints = reviews.length + feedback.length + insights.length;
    const confidence = insights.reduce((sum, i) => sum + i.confidence, 0) / Math.max(insights.length, 1);
    const coverage = Math.min(totalDataPoints / 50, 1); // Normalize to 0-1
    const recency = 0.9; // Assume recent data
    const sourceDiversity = Math.min((reviews.length + feedback.length) / 20, 1);
    
    return {
      confidence,
      coverage,
      recency,
      sourceDiversity,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default CustomerResearchAgent; 