import { z } from 'zod';
import { Prisma } from '../client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const IdeaScalarFieldEnumSchema = z.enum(['id','name','description','industry','ownerId','organizationId','internal','openSource','status','aiOverallValidation','problemSolved','solutionOffered','createdAt','updatedAt']);

export const CompetitorScalarFieldEnumSchema = z.enum(['id','ideaId','name','website','description','logoUrl','marketShare','annualRevenue','employeeCount','foundedYear','headquarters','targetAudience','threatLevel','userGrowthRate','churnRate','customerSatisfaction','marketCap','lastUpdated','createdAt','isActive']);

export const CompetitiveMoveScalarFieldEnumSchema = z.enum(['id','competitorId','moveType','title','description','impactLevel','targetAudience','affectedFeatures','announcedDate','launchDate','completionDate','userFeedback','pressCoverage','opportunities','threats','responseRequired','responseStrategy','createdAt']);

export const CompetitorSwotScalarFieldEnumSchema = z.enum(['id','impact','type','swotAnalysis','competitorId','createdAt','updatedAt']);

export const ProjectScalarFieldEnumSchema = z.enum(['id','name','description','platform','ai','orm','database','auth','framework','infrastructure','dueDate','status','ideaId','createdAt','updatedAt','organizationId','createdById']);

export const IssueScalarFieldEnumSchema = z.enum(['id','title','description','organizationId','projectId','milestoneId','featureId','parentIssueId','status','priority','label','dueDate','assignedToId','achieved','isPublic','sourceType','sourceFeedbackId']);

export const IssueDependencyScalarFieldEnumSchema = z.enum(['id','organizationId','issueId','dependencyId','createdAt']);

export const IssueLinkScalarFieldEnumSchema = z.enum(['id','organizationId','issueId','url','createdAt']);

export const AssetScalarFieldEnumSchema = z.enum(['id','name','description','type','projectId','organizationId','storageId','fileName','fileSize','mimeType','url','linkType','tags','category','thumbnailUrl','isPublic','uploadedById','createdAt','updatedAt']);

export const ActivityFeedScalarFieldEnumSchema = z.enum(['id','type','title','description','entityType','entityId','organizationId','userId','oldValue','newValue','createdAt','updatedAt']);

export const PublicRoadmapScalarFieldEnumSchema = z.enum(['id','projectId','name','slug','description','isPublic','allowVoting','allowFeedback','createdAt','updatedAt']);

export const RoadmapItemScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','status','category','isPublic','priority','targetDate','createdAt','updatedAt']);

export const RoadmapVoteScalarFieldEnumSchema = z.enum(['id','roadmapItemId','userId','ipAddress','createdAt']);

export const RoadmapFeedbackScalarFieldEnumSchema = z.enum(['id','roadmapItemId','userId','ipAddress','content','sentiment','isApproved','convertedToFeatureId','convertedToIssueId','convertedAt','convertedBy','conversionNotes','createdAt']);

export const RoadmapChangelogScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','version','publishDate','isPublished','createdAt','updatedAt','fixes','newFeatures']);

export const ChangelogEntryScalarFieldEnumSchema = z.enum(['id','changelogId','type','title','description','issueId','featureId','priority','category','breaking','createdAt']);

export const FeatureRequestScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','category','email','name','ipAddress','status','priority','isPublic','adminNotes','createdAt','updatedAt','convertedToFeatureId','convertedToIssueId','convertedToRoadmapItemId','convertedAt','convertedBy','conversionNotes']);

export const WaitlistScalarFieldEnumSchema = z.enum(['id','projectId','name','slug','description','isPublic','allowNameCapture','showPosition','showSocialProof','customMessage','organizationId','createdAt','updatedAt','createdById']);

export const WaitlistEntryScalarFieldEnumSchema = z.enum(['id','waitlistId','email','name','status','position','referralCode','referredBy','verificationToken','verifiedAt','invitedAt','joinedAt','ipAddress','userAgent','utmSource','utmMedium','utmCampaign','createdAt','updatedAt']);

export const FeatureScalarFieldEnumSchema = z.enum(['id','name','description','projectId','phase','businessValue','estimatedEffort','startDate','endDate','priority','assignedToId','parentFeatureId','organizationId','createdAt','updatedAt','milestoneId']);

export const FeatureDependencyScalarFieldEnumSchema = z.enum(['id','organizationId','featureId','dependencyId','createdAt']);

export const FeatureLinkScalarFieldEnumSchema = z.enum(['id','organizationId','featureId','url','createdAt']);

export const MilestoneScalarFieldEnumSchema = z.enum(['id','name','description','status','startDate','endDate','createdAt','updatedAt','projectId','organizationId','ownerId']);

export const MilestoneDependencyScalarFieldEnumSchema = z.enum(['id','organizationId','milestoneId','dependencyId','createdAt']);

export const ReferralScalarFieldEnumSchema = z.enum(['id','referrerId','referredEmail','referredName','ipAddress','userAgent','referrerCode','waitlistId','organizationId','createdAt']);

export const AssetViewScalarFieldEnumSchema = z.enum(['id','assetId','organizationId','userId','ipAddress','userAgent','referrer','viewedAt']);

export const AssetDownloadScalarFieldEnumSchema = z.enum(['id','assetId','organizationId','userId','ipAddress','userAgent','referrer','downloadedAt']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','email','emailVerified','image','role','createdAt','updatedAt','twoFactorEnabled']);

export const SessionScalarFieldEnumSchema = z.enum(['id','expiresAt','ipAddress','userAgent','userId','activeOrganizationId','token','createdAt','updatedAt']);

export const AccountScalarFieldEnumSchema = z.enum(['id','accountId','providerId','userId','accessToken','refreshToken','idToken','expiresAt','password','accessTokenExpiresAt','refreshTokenExpiresAt','scope','createdAt','updatedAt']);

export const VerificationScalarFieldEnumSchema = z.enum(['id','identifier','value','expiresAt','createdAt','updatedAt']);

export const OrganizationScalarFieldEnumSchema = z.enum(['id','name','slug','logo','createdAt','metadata']);

export const MemberScalarFieldEnumSchema = z.enum(['id','organizationId','userId','role','createdAt']);

export const InvitationScalarFieldEnumSchema = z.enum(['id','organizationId','email','role','status','expiresAt','inviterId']);

export const PasskeyScalarFieldEnumSchema = z.enum(['id','name','publicKey','userId','webauthnUserID','counter','deviceType','backedUp','transports','createdAt','credentialID']);

export const TwoFactorScalarFieldEnumSchema = z.enum(['id','secret','backupCodes','userId']);

export const SubscriptionScalarFieldEnumSchema = z.enum(['id','status','organisation_id','subscription_id','product_id','userId','createdAt','updatedAt']);

export const IntegrationScalarFieldEnumSchema = z.enum(['id','name','type','config','isActive','organizationId','createdAt','updatedAt','createdById']);

export const IntegrationUsageScalarFieldEnumSchema = z.enum(['id','integrationId','entityType','entityId','purpose','isActive','createdAt','updatedAt']);

export const ApiKeyScalarFieldEnumSchema = z.enum(['id','organizationId','name','keyHash','keyPreview','permissions','createdBy','createdAt','lastUsed','isActive','expiresAt']);

export const ApiCallScalarFieldEnumSchema = z.enum(['id','organizationId','apiKeyId','endpoint','method','statusCode','responseTime','userAgent','ipAddress','createdAt']);

export const IdeaValidationScalarFieldEnumSchema = z.enum(['id','ideaId','overallScore','overallStatus','confidenceLevel','validationProgress','startedAt','completedAt','lastUpdatedAt','version','parentValidationId','isLatest','revalidationReason','dataSourcesUpdated','lastDataRefresh','nextRevalidationDue']);

export const ValidationMetricsScalarFieldEnumSchema = z.enum(['id','validationId','overallStrengthScore','overallRiskScore','timeToMarket','fundingRequired','breakEvenMonth','customerPayback','marketPenetration','immediateActions','shortTermActions','longTermActions','createdAt','updatedAt']);

export const MarketValidationScalarFieldEnumSchema = z.enum(['id','validationId','totalAddressableMarket','serviceableAddressableMarket','serviceableObtainableMarket','marketGrowthRate','primaryCustomerSegment','customerInterviews','surveyResponses','overallMarketScore','primaryRegions','status','createdAt','updatedAt']);

export const MarketInsightScalarFieldEnumSchema = z.enum(['id','marketValidationId','category','impact','urgency','label','description','createdAt']);

export const MarketRegionScoreScalarFieldEnumSchema = z.enum(['id','marketValidationId','region','score','createdAt']);

export const BusinessValidationScalarFieldEnumSchema = z.enum(['id','validationId','primaryRevenueModel','pricingStrategy','pricePoint','customerAcquisitionCost','customerLifetimeValue','monthlyChurnRate','breakEvenMonth','initialInvestment','totalFundingNeeded','goToMarketStrategy','salesCycleLength','overallBusinessScore','status','createdAt','updatedAt']);

export const BusinessInsightScalarFieldEnumSchema = z.enum(['id','businessValidationId','category','impact','urgency','cost','label','description','createdAt']);

export const RiskAnalysisScalarFieldEnumSchema = z.enum(['id','validationId','overallRiskScore','status','createdAt','updatedAt']);

export const RiskItemScalarFieldEnumSchema = z.enum(['id','riskAnalysisId','category','description','impact','probability','mitigation','createdAt']);

export const ProductMarketFitAnalysisScalarFieldEnumSchema = z.enum(['id','validationId','pmfScore','status','createdAt','updatedAt']);

export const PMFMetricScalarFieldEnumSchema = z.enum(['id','productMarketFitAnalysisId','name','value','unit','trend','benchmark','createdAt']);

export const PMFFeedbackScalarFieldEnumSchema = z.enum(['id','productMarketFitAnalysisId','source','sentiment','content','tags','createdAt']);

export const MonthlyProjectionScalarFieldEnumSchema = z.enum(['id','businessValidationId','month','revenue','costs','users','createdAt']);

export const AcquisitionChannelScalarFieldEnumSchema = z.enum(['id','businessValidationId','channel','effectiveness','cost','createdAt']);

export const PricingTierScalarFieldEnumSchema = z.enum(['id','pricingStrategyAnalysisId','tierName','tierPrice','tierFeatures','targetSegment','conversionRate','popularityScore','profitMargin','competitiveScore','createdAt']);

export const CompetitorPricingScalarFieldEnumSchema = z.enum(['id','pricingStrategyAnalysisId','competitorName','pricingModel','basePrice','premiumPrice','featureComparison','valueComparison','marketPosition','marketShare','customerSatisfaction','pricingAdvantage','createdAt']);

export const CustomerJourneyMappingScalarFieldEnumSchema = z.enum(['id','validationId','totalJourneyStages','averageJourneyTime','overallJourneyScore','conversionRate','dropOffRate','customerSatisfaction','createdAt','updatedAt']);

export const JourneyStageScalarFieldEnumSchema = z.enum(['id','customerJourneyMappingId','stageName','stageOrder','averageDuration','conversionRate','satisfactionScore','frictionScore','emotionalState','customerGoals','customerActions','customerThoughts','customerEmotions','dropOffRate','supportTickets','timeToComplete','createdAt']);

export const TouchpointScalarFieldEnumSchema = z.enum(['id','customerJourneyMappingId','touchpointName','touchpointType','channel','stageInJourney','effectivenessScore','satisfactionScore','usageFrequency','importanceScore','optimizationPotential','costEfficiency','automationPotential','customerExpectations','currentExperience','improvementAreas','createdAt']);

export const JourneyPainPointScalarFieldEnumSchema = z.enum(['id','customerJourneyMappingId','painPointName','journeyStage','painCategory','severityScore','frequencyScore','impactScore','resolutionDifficulty','dropOffIncrease','supportCost','revenueImpact','currentMitigation','proposedSolution','solutionPriority','createdAt']);

export const TargetAudienceSegmentationScalarFieldEnumSchema = z.enum(['id','validationId','primarySegment','totalSegments','totalMarketSize','overallSegmentationScore','averageSegmentSize','segmentAccessibility','marketPenetration','createdAt','updatedAt']);

export const AudienceSegmentScalarFieldEnumSchema = z.enum(['id','targetAudienceSegmentationId','segmentName','segmentSize','attractivenessScore','accessibilityScore','profitabilityScore','primaryNeed','secondaryNeeds','preferredSolution','budgetRange','createdAt']);

export const MarketTrendAnalysisScalarFieldEnumSchema = z.enum(['id','validationId','primaryTrend','totalTrendsTracked','analysisTimeframe','overallTrendScore','trendStrength','marketGrowthRate','adoptionRate','createdAt','updatedAt']);

export const MarketTrendScalarFieldEnumSchema = z.enum(['id','marketTrendAnalysisId','trendName','trendCategory','impactScore','timelineMonths','certaintyLevel','opportunityScore','threatScore','description','createdAt']);

export const CustomerNeedAnalysisScalarFieldEnumSchema = z.enum(['id','validationId','primaryNeed','totalNeedsIdentified','totalPainPoints','overallNeedScore','needUrgency','solutionGap','customerWillingness','createdAt','updatedAt']);

export const CustomerNeedScalarFieldEnumSchema = z.enum(['id','customerNeedAnalysisId','needName','needCategory','intensityScore','frequencyScore','urgencyScore','satisfactionGap','triggerEvents','desiredOutcome','currentSolution','createdAt']);

export const PainPointScalarFieldEnumSchema = z.enum(['id','customerNeedAnalysisId','painName','painCategory','severityScore','frequencyScore','impactScore','emotionalToll','timeCostHours','financialCost','opportunityCost','painTriggers','currentMitigation','createdAt']);

export const PricingStrategyAnalysisScalarFieldEnumSchema = z.enum(['id','validationId','primaryStrategy','recommendedPrice','totalTiersAnalyzed','overallPricingScore','priceAcceptance','competitivenessScore','profitabilityScore','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const ActivityTypeSchema = z.enum(['CREATED','UPDATED','PHASE_CHANGED','ASSIGNED','UNASSIGNED','DEPENDENCY_ADDED','DEPENDENCY_REMOVED','LINK_ADDED','LINK_REMOVED','PARENT_CHANGED']);

export type ActivityTypeType = `${z.infer<typeof ActivityTypeSchema>}`

export const EntityTypeSchema = z.enum(['PROJECT','FEATURE','ISSUE','IDEA','ROADMAP','MILESTONE']);

export type EntityTypeType = `${z.infer<typeof EntityTypeSchema>}`

export const IdeaStatusSchema = z.enum(['INVALIDATED','VALIDATED','FAILED','IN_PROGRESS','LAUNCHED']);

export type IdeaStatusType = `${z.infer<typeof IdeaStatusSchema>}`

export const ImportanceSchema = z.enum(['CRITICAL','HIGH','MEDIUM','LOW']);

export type ImportanceType = `${z.infer<typeof ImportanceSchema>}`

export const ProjectPlatformSchema = z.enum(['web','mobile','both','api','plugin','desktop','cli']);

export type ProjectPlatformType = `${z.infer<typeof ProjectPlatformSchema>}`

export const ProjectStatusSchema = z.enum(['planning','in_progress','review','completed']);

export type ProjectStatusType = `${z.infer<typeof ProjectStatusSchema>}`

export const IssueStatusSchema = z.enum(['BACKLOG','IN_PROGRESS','IN_REVIEW','DONE','BLOCKED','CANCELLED']);

export type IssueStatusType = `${z.infer<typeof IssueStatusSchema>}`

export const IssueLabelSchema = z.enum(['UI','BUG','FEATURE','IMPROVEMENT','TASK','DOCUMENTATION','REFACTOR','PERFORMANCE','DESIGN','SECURITY','ACCESSIBILITY','TESTING','INTERNATIONALIZATION']);

export type IssueLabelType = `${z.infer<typeof IssueLabelSchema>}`

export const AssetTypeSchema = z.enum(['image','document','video','link','code','design','other']);

export type AssetTypeType = `${z.infer<typeof AssetTypeSchema>}`

export const LinkTypeSchema = z.enum(['youtube','figma','notion','github','dribbble','behance','external']);

export type LinkTypeType = `${z.infer<typeof LinkTypeSchema>}`

export const AssetCategorySchema = z.enum(['branding','ui_design','mockups','documentation','inspiration','code_snippets','presentations','tutorials','other']);

export type AssetCategoryType = `${z.infer<typeof AssetCategorySchema>}`

export const RoadmapFeedbackSentimentSchema = z.enum(['positive','neutral','negative']);

export type RoadmapFeedbackSentimentType = `${z.infer<typeof RoadmapFeedbackSentimentSchema>}`

export const FeatureRequestStatusSchema = z.enum(['pending','under_review','approved','rejected','implemented']);

export type FeatureRequestStatusType = `${z.infer<typeof FeatureRequestStatusSchema>}`

export const FeatureRequestPrioritySchema = z.enum(['low','medium','high','urgent']);

export type FeatureRequestPriorityType = `${z.infer<typeof FeatureRequestPrioritySchema>}`

export const FeaturePhaseSchema = z.enum(['DISCOVERY','PLANNING','DEVELOPMENT','TESTING','DEPLOYMENT','COMPLETED','RELEASE','LIVE','DEPRECATED']);

export type FeaturePhaseType = `${z.infer<typeof FeaturePhaseSchema>}`

export const MilestoneStatusSchema = z.enum(['NOT_STARTED','IN_PROGRESS','AT_RISK','COMPLETED','DELAYED']);

export type MilestoneStatusType = `${z.infer<typeof MilestoneStatusSchema>}`

export const IntegrationTypeSchema = z.enum(['RESEND','LOOPS','SENDGRID','MAILCHIMP','CONVERTKIT','GITHUB']);

export type IntegrationTypeType = `${z.infer<typeof IntegrationTypeSchema>}`

export const ApiPermissionSchema = z.enum(['READ','WRITE','DELETE','ADMIN']);

export type ApiPermissionType = `${z.infer<typeof ApiPermissionSchema>}`

export const ChangelogEntryTypeSchema = z.enum(['FEATURE','FIX','IMPROVEMENT','BREAKING','SECURITY','DEPRECATION','DOCUMENTATION','PERFORMANCE']);

export type ChangelogEntryTypeType = `${z.infer<typeof ChangelogEntryTypeSchema>}`

export const SwotTypeSchema = z.enum(['Strength','Weakness','Opportunity','Threat']);

export type SwotTypeType = `${z.infer<typeof SwotTypeSchema>}`

export const ValidationStatusSchema = z.enum(['PENDING','IN_PROGRESS','COMPLETED','FAILED','REQUIRES_REVIEW']);

export type ValidationStatusType = `${z.infer<typeof ValidationStatusSchema>}`

export const ValidationScoreSchema = z.enum(['EXCELLENT','GOOD','AVERAGE','POOR','CRITICAL']);

export type ValidationScoreType = `${z.infer<typeof ValidationScoreSchema>}`

export const MarketSizeSchema = z.enum(['NICHE','SMALL','MEDIUM','LARGE','MASSIVE']);

export type MarketSizeType = `${z.infer<typeof MarketSizeSchema>}`

export const MarketGrowthRateSchema = z.enum(['DECLINING','STAGNANT','SLOW_GROWTH','MODERATE_GROWTH','RAPID_GROWTH','EXPLOSIVE_GROWTH']);

export type MarketGrowthRateType = `${z.infer<typeof MarketGrowthRateSchema>}`

export const MarketMaturitySchema = z.enum(['EMERGING','GROWTH','MATURE','DECLINING','TRANSFORMING']);

export type MarketMaturityType = `${z.infer<typeof MarketMaturitySchema>}`

export const CompetitionLevelSchema = z.enum(['NONE','LOW','MODERATE','HIGH','SATURATED']);

export type CompetitionLevelType = `${z.infer<typeof CompetitionLevelSchema>}`

export const CustomerSegmentSchema = z.enum(['B2B_ENTERPRISE','B2B_SMB','B2C_CONSUMER','B2C_PROSUMER','B2G_GOVERNMENT','MARKETPLACE','PLATFORM']);

export type CustomerSegmentType = `${z.infer<typeof CustomerSegmentSchema>}`

export const RevenueModelSchema = z.enum(['SUBSCRIPTION','FREEMIUM','ONE_TIME_PURCHASE','TRANSACTION_FEE','ADVERTISING','COMMISSION','LICENSING','USAGE_BASED','HYBRID']);

export type RevenueModelType = `${z.infer<typeof RevenueModelSchema>}`

export const PricingStrategySchema = z.enum(['PENETRATION','SKIMMING','COMPETITIVE','VALUE_BASED','COST_PLUS','DYNAMIC']);

export type PricingStrategyType = `${z.infer<typeof PricingStrategySchema>}`

export const RiskLevelSchema = z.enum(['MINIMAL','LOW','MODERATE','HIGH','EXTREME']);

export type RiskLevelType = `${z.infer<typeof RiskLevelSchema>}`

export const RiskCategorySchema = z.enum(['MARKET','TECHNICAL','FINANCIAL','REGULATORY','COMPETITIVE','OPERATIONAL','TEAM','TIMING']);

export type RiskCategoryType = `${z.infer<typeof RiskCategorySchema>}`

export const FundingStageSchema = z.enum(['BOOTSTRAPPED','PRE_SEED','SEED','SERIES_A','SERIES_B','SERIES_C_PLUS','IPO_READY']);

export type FundingStageType = `${z.infer<typeof FundingStageSchema>}`

export const InvestmentRecommendationSchema = z.enum(['STRONG_BUY','BUY','HOLD','WEAK_BUY','AVOID']);

export type InvestmentRecommendationType = `${z.infer<typeof InvestmentRecommendationSchema>}`

export const GoToMarketStrategySchema = z.enum(['DIRECT_SALES','INBOUND_MARKETING','OUTBOUND_MARKETING','PARTNERSHIPS','VIRAL_GROWTH','COMMUNITY_DRIVEN','PRODUCT_LED_GROWTH','CHANNEL_PARTNERS']);

export type GoToMarketStrategyType = `${z.infer<typeof GoToMarketStrategySchema>}`

export const ValidationMethodSchema = z.enum(['SURVEYS','INTERVIEWS','LANDING_PAGE_TEST','MVP_TEST','PROTOTYPE_TEST','MARKET_RESEARCH','COMPETITOR_ANALYSIS','EXPERT_CONSULTATION']);

export type ValidationMethodType = `${z.infer<typeof ValidationMethodSchema>}`

export const FinancialMetricSchema = z.enum(['CAC','LTV','ARPU','MRR','ARR','CHURN_RATE','GROSS_MARGIN','BURN_RATE','RUNWAY','BREAK_EVEN']);

export type FinancialMetricType = `${z.infer<typeof FinancialMetricSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// IDEA SCHEMA
/////////////////////////////////////////

export const IdeaSchema = z.object({
  status: IdeaStatusSchema,
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  industry: z.string(),
  ownerId: z.string().nullish(),
  organizationId: z.string(),
  internal: z.boolean(),
  openSource: z.boolean(),
  aiOverallValidation: z.number().nullish(),
  problemSolved: z.string().nullish(),
  solutionOffered: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Idea = z.infer<typeof IdeaSchema>

// IDEA OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const IdeaOptionalDefaultsSchema = IdeaSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type IdeaOptionalDefaults = z.infer<typeof IdeaOptionalDefaultsSchema>

/////////////////////////////////////////
// COMPETITOR SCHEMA
/////////////////////////////////////////

export const CompetitorSchema = z.object({
  threatLevel: ImportanceSchema,
  id: z.string().uuid(),
  ideaId: z.string(),
  name: z.string(),
  website: z.string().nullish(),
  description: z.string().nullish(),
  logoUrl: z.string().nullish(),
  marketShare: z.number().nullish(),
  annualRevenue: z.number().nullish(),
  employeeCount: z.string().nullish(),
  foundedYear: z.number().int().nullish(),
  headquarters: z.string().nullish(),
  targetAudience: z.string().nullish(),
  userGrowthRate: z.number().nullish(),
  churnRate: z.number().nullish(),
  customerSatisfaction: z.number().nullish(),
  marketCap: z.number().nullish(),
  lastUpdated: z.coerce.date(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

export type Competitor = z.infer<typeof CompetitorSchema>

// COMPETITOR OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CompetitorOptionalDefaultsSchema = CompetitorSchema.merge(z.object({
  id: z.string().uuid().optional(),
  lastUpdated: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
}))

export type CompetitorOptionalDefaults = z.infer<typeof CompetitorOptionalDefaultsSchema>

/////////////////////////////////////////
// COMPETITIVE MOVE SCHEMA
/////////////////////////////////////////

export const CompetitiveMoveSchema = z.object({
  impactLevel: ImportanceSchema,
  id: z.string().uuid(),
  competitorId: z.string().nullish(),
  moveType: z.string(),
  title: z.string(),
  description: z.string(),
  targetAudience: z.string().nullish(),
  affectedFeatures: z.string().array(),
  announcedDate: z.coerce.date().nullish(),
  launchDate: z.coerce.date().nullish(),
  completionDate: z.coerce.date().nullish(),
  userFeedback: z.string().nullish(),
  pressCoverage: z.string().array(),
  opportunities: z.string().array(),
  threats: z.string().array(),
  responseRequired: z.boolean(),
  responseStrategy: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type CompetitiveMove = z.infer<typeof CompetitiveMoveSchema>

// COMPETITIVE MOVE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CompetitiveMoveOptionalDefaultsSchema = CompetitiveMoveSchema.merge(z.object({
  id: z.string().uuid().optional(),
  responseRequired: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type CompetitiveMoveOptionalDefaults = z.infer<typeof CompetitiveMoveOptionalDefaultsSchema>

/////////////////////////////////////////
// COMPETITOR SWOT SCHEMA
/////////////////////////////////////////

export const CompetitorSwotSchema = z.object({
  impact: ImportanceSchema,
  type: SwotTypeSchema,
  id: z.string(),
  swotAnalysis: z.string(),
  competitorId: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CompetitorSwot = z.infer<typeof CompetitorSwotSchema>

// COMPETITOR SWOT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CompetitorSwotOptionalDefaultsSchema = CompetitorSwotSchema.merge(z.object({
  impact: ImportanceSchema.optional(),
  id: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type CompetitorSwotOptionalDefaults = z.infer<typeof CompetitorSwotOptionalDefaultsSchema>

/////////////////////////////////////////
// PROJECT SCHEMA
/////////////////////////////////////////

export const ProjectSchema = z.object({
  platform: ProjectPlatformSchema,
  status: ProjectStatusSchema.nullish(),
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  ai: z.string().nullish(),
  orm: z.string().nullish(),
  database: z.string().nullish(),
  auth: z.string().nullish(),
  framework: z.string().nullish(),
  infrastructure: z.string().nullish(),
  dueDate: z.coerce.date().nullish(),
  ideaId: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  organizationId: z.string().nullish(),
  createdById: z.string().nullish(),
})

export type Project = z.infer<typeof ProjectSchema>

// PROJECT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ProjectOptionalDefaultsSchema = ProjectSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ProjectOptionalDefaults = z.infer<typeof ProjectOptionalDefaultsSchema>

/////////////////////////////////////////
// ISSUE SCHEMA
/////////////////////////////////////////

export const IssueSchema = z.object({
  status: IssueStatusSchema,
  priority: ImportanceSchema,
  label: IssueLabelSchema,
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  organizationId: z.string(),
  projectId: z.string(),
  milestoneId: z.string().nullish(),
  featureId: z.string().nullish(),
  parentIssueId: z.string().nullish(),
  dueDate: z.coerce.date().nullish(),
  assignedToId: z.string().nullish(),
  achieved: z.boolean().nullish(),
  isPublic: z.boolean().nullish(),
  sourceType: z.string().nullish(),
  sourceFeedbackId: z.string().nullish(),
})

export type Issue = z.infer<typeof IssueSchema>

// ISSUE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const IssueOptionalDefaultsSchema = IssueSchema.merge(z.object({
  id: z.string().uuid().optional(),
}))

export type IssueOptionalDefaults = z.infer<typeof IssueOptionalDefaultsSchema>

/////////////////////////////////////////
// ISSUE DEPENDENCY SCHEMA
/////////////////////////////////////////

export const IssueDependencySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  issueId: z.string(),
  dependencyId: z.string(),
  createdAt: z.coerce.date(),
})

export type IssueDependency = z.infer<typeof IssueDependencySchema>

// ISSUE DEPENDENCY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const IssueDependencyOptionalDefaultsSchema = IssueDependencySchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type IssueDependencyOptionalDefaults = z.infer<typeof IssueDependencyOptionalDefaultsSchema>

/////////////////////////////////////////
// ISSUE LINK SCHEMA
/////////////////////////////////////////

export const IssueLinkSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  issueId: z.string(),
  url: z.string(),
  createdAt: z.coerce.date(),
})

export type IssueLink = z.infer<typeof IssueLinkSchema>

// ISSUE LINK OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const IssueLinkOptionalDefaultsSchema = IssueLinkSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type IssueLinkOptionalDefaults = z.infer<typeof IssueLinkOptionalDefaultsSchema>

/////////////////////////////////////////
// ASSET SCHEMA
/////////////////////////////////////////

export const AssetSchema = z.object({
  type: AssetTypeSchema,
  linkType: LinkTypeSchema.nullish(),
  category: AssetCategorySchema.nullish(),
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  projectId: z.string(),
  organizationId: z.string(),
  storageId: z.string().nullish(),
  fileName: z.string().nullish(),
  fileSize: z.number().int().nullish(),
  mimeType: z.string().nullish(),
  url: z.string().nullish(),
  tags: z.string().array(),
  thumbnailUrl: z.string().nullish(),
  isPublic: z.boolean().nullish(),
  uploadedById: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Asset = z.infer<typeof AssetSchema>

// ASSET OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const AssetOptionalDefaultsSchema = AssetSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type AssetOptionalDefaults = z.infer<typeof AssetOptionalDefaultsSchema>

/////////////////////////////////////////
// ACTIVITY FEED SCHEMA
/////////////////////////////////////////

export const ActivityFeedSchema = z.object({
  type: ActivityTypeSchema,
  entityType: EntityTypeSchema,
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  entityId: z.string(),
  organizationId: z.string(),
  userId: z.string().nullish(),
  oldValue: z.string().nullish(),
  newValue: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ActivityFeed = z.infer<typeof ActivityFeedSchema>

// ACTIVITY FEED OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ActivityFeedOptionalDefaultsSchema = ActivityFeedSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ActivityFeedOptionalDefaults = z.infer<typeof ActivityFeedOptionalDefaultsSchema>

/////////////////////////////////////////
// PUBLIC ROADMAP SCHEMA
/////////////////////////////////////////

export const PublicRoadmapSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
  allowVoting: z.boolean(),
  allowFeedback: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PublicRoadmap = z.infer<typeof PublicRoadmapSchema>

// PUBLIC ROADMAP OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PublicRoadmapOptionalDefaultsSchema = PublicRoadmapSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type PublicRoadmapOptionalDefaults = z.infer<typeof PublicRoadmapOptionalDefaultsSchema>

/////////////////////////////////////////
// ROADMAP ITEM SCHEMA
/////////////////////////////////////////

export const RoadmapItemSchema = z.object({
  status: IssueStatusSchema,
  category: IssueLabelSchema,
  priority: ImportanceSchema,
  id: z.string().uuid(),
  roadmapId: z.string(),
  title: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
  targetDate: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RoadmapItem = z.infer<typeof RoadmapItemSchema>

// ROADMAP ITEM OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const RoadmapItemOptionalDefaultsSchema = RoadmapItemSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type RoadmapItemOptionalDefaults = z.infer<typeof RoadmapItemOptionalDefaultsSchema>

/////////////////////////////////////////
// ROADMAP VOTE SCHEMA
/////////////////////////////////////////

export const RoadmapVoteSchema = z.object({
  id: z.string().uuid(),
  roadmapItemId: z.string(),
  userId: z.string().nullish(),
  ipAddress: z.string(),
  createdAt: z.coerce.date(),
})

export type RoadmapVote = z.infer<typeof RoadmapVoteSchema>

// ROADMAP VOTE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const RoadmapVoteOptionalDefaultsSchema = RoadmapVoteSchema.merge(z.object({
  id: z.string().uuid().optional(),
}))

export type RoadmapVoteOptionalDefaults = z.infer<typeof RoadmapVoteOptionalDefaultsSchema>

/////////////////////////////////////////
// ROADMAP FEEDBACK SCHEMA
/////////////////////////////////////////

export const RoadmapFeedbackSchema = z.object({
  sentiment: RoadmapFeedbackSentimentSchema,
  id: z.string().uuid(),
  roadmapItemId: z.string(),
  userId: z.string().nullish(),
  ipAddress: z.string(),
  content: z.string(),
  isApproved: z.boolean(),
  convertedToFeatureId: z.string().nullish(),
  convertedToIssueId: z.string().nullish(),
  convertedAt: z.coerce.date().nullish(),
  convertedBy: z.string().nullish(),
  conversionNotes: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type RoadmapFeedback = z.infer<typeof RoadmapFeedbackSchema>

// ROADMAP FEEDBACK OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const RoadmapFeedbackOptionalDefaultsSchema = RoadmapFeedbackSchema.merge(z.object({
  id: z.string().uuid().optional(),
}))

export type RoadmapFeedbackOptionalDefaults = z.infer<typeof RoadmapFeedbackOptionalDefaultsSchema>

/////////////////////////////////////////
// ROADMAP CHANGELOG SCHEMA
/////////////////////////////////////////

export const RoadmapChangelogSchema = z.object({
  id: z.string().uuid(),
  roadmapId: z.string(),
  title: z.string(),
  description: z.string(),
  version: z.string().nullish(),
  publishDate: z.coerce.date(),
  isPublished: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  fixes: z.string().array(),
  newFeatures: z.string().array(),
})

export type RoadmapChangelog = z.infer<typeof RoadmapChangelogSchema>

// ROADMAP CHANGELOG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const RoadmapChangelogOptionalDefaultsSchema = RoadmapChangelogSchema.merge(z.object({
  id: z.string().uuid().optional(),
  isPublished: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  fixes: z.string().array().optional(),
  newFeatures: z.string().array().optional(),
}))

export type RoadmapChangelogOptionalDefaults = z.infer<typeof RoadmapChangelogOptionalDefaultsSchema>

/////////////////////////////////////////
// CHANGELOG ENTRY SCHEMA
/////////////////////////////////////////

export const ChangelogEntrySchema = z.object({
  type: ChangelogEntryTypeSchema,
  priority: ImportanceSchema.nullish(),
  id: z.string().uuid(),
  changelogId: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  issueId: z.string().nullish(),
  featureId: z.string().nullish(),
  category: z.string().nullish(),
  breaking: z.boolean(),
  createdAt: z.coerce.date(),
})

export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema>

// CHANGELOG ENTRY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ChangelogEntryOptionalDefaultsSchema = ChangelogEntrySchema.merge(z.object({
  id: z.string().uuid().optional(),
  breaking: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type ChangelogEntryOptionalDefaults = z.infer<typeof ChangelogEntryOptionalDefaultsSchema>

/////////////////////////////////////////
// FEATURE REQUEST SCHEMA
/////////////////////////////////////////

export const FeatureRequestSchema = z.object({
  status: FeatureRequestStatusSchema,
  priority: FeatureRequestPrioritySchema,
  id: z.string().uuid(),
  roadmapId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  ipAddress: z.string(),
  isPublic: z.boolean(),
  adminNotes: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  convertedToFeatureId: z.string().nullish(),
  convertedToIssueId: z.string().nullish(),
  convertedToRoadmapItemId: z.string().nullish(),
  convertedAt: z.coerce.date().nullish(),
  convertedBy: z.string().nullish(),
  conversionNotes: z.string().nullish(),
})

export type FeatureRequest = z.infer<typeof FeatureRequestSchema>

// FEATURE REQUEST OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FeatureRequestOptionalDefaultsSchema = FeatureRequestSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type FeatureRequestOptionalDefaults = z.infer<typeof FeatureRequestOptionalDefaultsSchema>

/////////////////////////////////////////
// WAITLIST SCHEMA
/////////////////////////////////////////

export const WaitlistSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
  allowNameCapture: z.boolean(),
  showPosition: z.boolean(),
  showSocialProof: z.boolean(),
  customMessage: z.string().nullish(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdById: z.string().nullish(),
})

export type Waitlist = z.infer<typeof WaitlistSchema>

// WAITLIST OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const WaitlistOptionalDefaultsSchema = WaitlistSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type WaitlistOptionalDefaults = z.infer<typeof WaitlistOptionalDefaultsSchema>

/////////////////////////////////////////
// WAITLIST ENTRY SCHEMA
/////////////////////////////////////////

export const WaitlistEntrySchema = z.object({
  id: z.string().uuid(),
  waitlistId: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  status: z.string(),
  position: z.number().int(),
  referralCode: z.string(),
  referredBy: z.string().nullish(),
  verificationToken: z.string().nullish(),
  verifiedAt: z.coerce.date().nullish(),
  invitedAt: z.coerce.date().nullish(),
  joinedAt: z.coerce.date().nullish(),
  ipAddress: z.string(),
  userAgent: z.string().nullish(),
  utmSource: z.string().nullish(),
  utmMedium: z.string().nullish(),
  utmCampaign: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>

// WAITLIST ENTRY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const WaitlistEntryOptionalDefaultsSchema = WaitlistEntrySchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type WaitlistEntryOptionalDefaults = z.infer<typeof WaitlistEntryOptionalDefaultsSchema>

/////////////////////////////////////////
// FEATURE SCHEMA
/////////////////////////////////////////

export const FeatureSchema = z.object({
  phase: FeaturePhaseSchema,
  priority: ImportanceSchema,
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  projectId: z.string(),
  businessValue: z.number().nullish(),
  estimatedEffort: z.number().nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  assignedToId: z.string().nullish(),
  parentFeatureId: z.string().nullish(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  milestoneId: z.string().nullish(),
})

export type Feature = z.infer<typeof FeatureSchema>

// FEATURE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FeatureOptionalDefaultsSchema = FeatureSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type FeatureOptionalDefaults = z.infer<typeof FeatureOptionalDefaultsSchema>

/////////////////////////////////////////
// FEATURE DEPENDENCY SCHEMA
/////////////////////////////////////////

export const FeatureDependencySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  featureId: z.string(),
  dependencyId: z.string(),
  createdAt: z.coerce.date(),
})

export type FeatureDependency = z.infer<typeof FeatureDependencySchema>

// FEATURE DEPENDENCY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FeatureDependencyOptionalDefaultsSchema = FeatureDependencySchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type FeatureDependencyOptionalDefaults = z.infer<typeof FeatureDependencyOptionalDefaultsSchema>

/////////////////////////////////////////
// FEATURE LINK SCHEMA
/////////////////////////////////////////

export const FeatureLinkSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  featureId: z.string(),
  url: z.string(),
  createdAt: z.coerce.date(),
})

export type FeatureLink = z.infer<typeof FeatureLinkSchema>

// FEATURE LINK OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FeatureLinkOptionalDefaultsSchema = FeatureLinkSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type FeatureLinkOptionalDefaults = z.infer<typeof FeatureLinkOptionalDefaultsSchema>

/////////////////////////////////////////
// MILESTONE SCHEMA
/////////////////////////////////////////

export const MilestoneSchema = z.object({
  status: MilestoneStatusSchema,
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  projectId: z.string(),
  organizationId: z.string(),
  ownerId: z.string().nullish(),
})

export type Milestone = z.infer<typeof MilestoneSchema>

// MILESTONE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MilestoneOptionalDefaultsSchema = MilestoneSchema.merge(z.object({
  status: MilestoneStatusSchema.optional(),
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type MilestoneOptionalDefaults = z.infer<typeof MilestoneOptionalDefaultsSchema>

/////////////////////////////////////////
// MILESTONE DEPENDENCY SCHEMA
/////////////////////////////////////////

export const MilestoneDependencySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  milestoneId: z.string(),
  dependencyId: z.string(),
  createdAt: z.coerce.date(),
})

export type MilestoneDependency = z.infer<typeof MilestoneDependencySchema>

// MILESTONE DEPENDENCY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MilestoneDependencyOptionalDefaultsSchema = MilestoneDependencySchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MilestoneDependencyOptionalDefaults = z.infer<typeof MilestoneDependencyOptionalDefaultsSchema>

/////////////////////////////////////////
// REFERRAL SCHEMA
/////////////////////////////////////////

export const ReferralSchema = z.object({
  id: z.string().uuid(),
  referrerId: z.string(),
  referredEmail: z.string(),
  referredName: z.string().nullish(),
  ipAddress: z.string(),
  userAgent: z.string().nullish(),
  referrerCode: z.string(),
  waitlistId: z.string(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
})

export type Referral = z.infer<typeof ReferralSchema>

// REFERRAL OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ReferralOptionalDefaultsSchema = ReferralSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type ReferralOptionalDefaults = z.infer<typeof ReferralOptionalDefaultsSchema>

/////////////////////////////////////////
// ASSET VIEW SCHEMA
/////////////////////////////////////////

export const AssetViewSchema = z.object({
  id: z.string().uuid(),
  assetId: z.string(),
  organizationId: z.string(),
  userId: z.string().nullish(),
  ipAddress: z.string(),
  userAgent: z.string().nullish(),
  referrer: z.string().nullish(),
  viewedAt: z.coerce.date(),
})

export type AssetView = z.infer<typeof AssetViewSchema>

// ASSET VIEW OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const AssetViewOptionalDefaultsSchema = AssetViewSchema.merge(z.object({
  id: z.string().uuid().optional(),
  viewedAt: z.coerce.date().optional(),
}))

export type AssetViewOptionalDefaults = z.infer<typeof AssetViewOptionalDefaultsSchema>

/////////////////////////////////////////
// ASSET DOWNLOAD SCHEMA
/////////////////////////////////////////

export const AssetDownloadSchema = z.object({
  id: z.string().uuid(),
  assetId: z.string(),
  organizationId: z.string(),
  userId: z.string().nullish(),
  ipAddress: z.string(),
  userAgent: z.string().nullish(),
  referrer: z.string().nullish(),
  downloadedAt: z.coerce.date(),
})

export type AssetDownload = z.infer<typeof AssetDownloadSchema>

// ASSET DOWNLOAD OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const AssetDownloadOptionalDefaultsSchema = AssetDownloadSchema.merge(z.object({
  id: z.string().uuid().optional(),
  downloadedAt: z.coerce.date().optional(),
}))

export type AssetDownloadOptionalDefaults = z.infer<typeof AssetDownloadOptionalDefaultsSchema>

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  role: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  twoFactorEnabled: z.boolean().nullish(),
})

export type User = z.infer<typeof UserSchema>

// USER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserOptionalDefaultsSchema = UserSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type UserOptionalDefaults = z.infer<typeof UserOptionalDefaultsSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  userId: z.string().nullish(),
  activeOrganizationId: z.string().nullish(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

// SESSION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const SessionOptionalDefaultsSchema = SessionSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type SessionOptionalDefaults = z.infer<typeof SessionOptionalDefaultsSchema>

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string().nullish(),
  accessToken: z.string().nullish(),
  refreshToken: z.string().nullish(),
  idToken: z.string().nullish(),
  expiresAt: z.coerce.date().nullish(),
  password: z.string().nullish(),
  accessTokenExpiresAt: z.coerce.date().nullish(),
  refreshTokenExpiresAt: z.coerce.date().nullish(),
  scope: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Account = z.infer<typeof AccountSchema>

// ACCOUNT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const AccountOptionalDefaultsSchema = AccountSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type AccountOptionalDefaults = z.infer<typeof AccountOptionalDefaultsSchema>

/////////////////////////////////////////
// VERIFICATION SCHEMA
/////////////////////////////////////////

export const VerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Verification = z.infer<typeof VerificationSchema>

// VERIFICATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const VerificationOptionalDefaultsSchema = VerificationSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type VerificationOptionalDefaults = z.infer<typeof VerificationOptionalDefaultsSchema>

/////////////////////////////////////////
// ORGANIZATION SCHEMA
/////////////////////////////////////////

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string().nullish(),
  logo: z.string().nullish(),
  createdAt: z.coerce.date(),
  metadata: z.string().nullish(),
})

export type Organization = z.infer<typeof OrganizationSchema>

// ORGANIZATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const OrganizationOptionalDefaultsSchema = OrganizationSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type OrganizationOptionalDefaults = z.infer<typeof OrganizationOptionalDefaultsSchema>

/////////////////////////////////////////
// MEMBER SCHEMA
/////////////////////////////////////////

export const MemberSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  userId: z.string().nullish(),
  role: z.string(),
  createdAt: z.coerce.date(),
})

export type Member = z.infer<typeof MemberSchema>

// MEMBER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MemberOptionalDefaultsSchema = MemberSchema.merge(z.object({
  id: z.string().uuid().optional(),
}))

export type MemberOptionalDefaults = z.infer<typeof MemberOptionalDefaultsSchema>

/////////////////////////////////////////
// INVITATION SCHEMA
/////////////////////////////////////////

export const InvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().nullish(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  inviterId: z.string().nullish(),
})

export type Invitation = z.infer<typeof InvitationSchema>

// INVITATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const InvitationOptionalDefaultsSchema = InvitationSchema.merge(z.object({
}))

export type InvitationOptionalDefaults = z.infer<typeof InvitationOptionalDefaultsSchema>

/////////////////////////////////////////
// PASSKEY SCHEMA
/////////////////////////////////////////

export const PasskeySchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  publicKey: z.string(),
  userId: z.string().nullish(),
  webauthnUserID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().nullish(),
  createdAt: z.coerce.date().nullish(),
  credentialID: z.string(),
})

export type Passkey = z.infer<typeof PasskeySchema>

// PASSKEY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PasskeyOptionalDefaultsSchema = PasskeySchema.merge(z.object({
}))

export type PasskeyOptionalDefaults = z.infer<typeof PasskeyOptionalDefaultsSchema>

/////////////////////////////////////////
// TWO FACTOR SCHEMA
/////////////////////////////////////////

export const TwoFactorSchema = z.object({
  id: z.string(),
  secret: z.string(),
  backupCodes: z.string(),
  userId: z.string().nullish(),
})

export type TwoFactor = z.infer<typeof TwoFactorSchema>

// TWO FACTOR OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TwoFactorOptionalDefaultsSchema = TwoFactorSchema.merge(z.object({
}))

export type TwoFactorOptionalDefaults = z.infer<typeof TwoFactorOptionalDefaultsSchema>

/////////////////////////////////////////
// SUBSCRIPTION SCHEMA
/////////////////////////////////////////

export const SubscriptionSchema = z.object({
  id: z.string().cuid(),
  status: z.string().nullish(),
  organisation_id: z.string(),
  subscription_id: z.string().nullish(),
  product_id: z.string().nullish(),
  userId: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Subscription = z.infer<typeof SubscriptionSchema>

// SUBSCRIPTION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const SubscriptionOptionalDefaultsSchema = SubscriptionSchema.merge(z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type SubscriptionOptionalDefaults = z.infer<typeof SubscriptionOptionalDefaultsSchema>

/////////////////////////////////////////
// INTEGRATION SCHEMA
/////////////////////////////////////////

export const IntegrationSchema = z.object({
  type: IntegrationTypeSchema,
  id: z.string().uuid(),
  name: z.string(),
  config: JsonValueSchema,
  isActive: z.boolean(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdById: z.string().nullish(),
})

export type Integration = z.infer<typeof IntegrationSchema>

// INTEGRATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const IntegrationOptionalDefaultsSchema = IntegrationSchema.merge(z.object({
  id: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type IntegrationOptionalDefaults = z.infer<typeof IntegrationOptionalDefaultsSchema>

/////////////////////////////////////////
// INTEGRATION USAGE SCHEMA
/////////////////////////////////////////

export const IntegrationUsageSchema = z.object({
  id: z.string().uuid(),
  integrationId: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  purpose: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type IntegrationUsage = z.infer<typeof IntegrationUsageSchema>

// INTEGRATION USAGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const IntegrationUsageOptionalDefaultsSchema = IntegrationUsageSchema.merge(z.object({
  id: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type IntegrationUsageOptionalDefaults = z.infer<typeof IntegrationUsageOptionalDefaultsSchema>

/////////////////////////////////////////
// API KEY SCHEMA
/////////////////////////////////////////

export const ApiKeySchema = z.object({
  permissions: ApiPermissionSchema.array(),
  id: z.string().uuid(),
  organizationId: z.string(),
  name: z.string(),
  keyHash: z.string(),
  keyPreview: z.string(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  lastUsed: z.coerce.date().nullish(),
  isActive: z.boolean(),
  expiresAt: z.coerce.date().nullish(),
})

export type ApiKey = z.infer<typeof ApiKeySchema>

// API KEY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ApiKeyOptionalDefaultsSchema = ApiKeySchema.merge(z.object({
  permissions: ApiPermissionSchema.array().optional(),
  id: z.string().uuid().optional(),
}))

export type ApiKeyOptionalDefaults = z.infer<typeof ApiKeyOptionalDefaultsSchema>

/////////////////////////////////////////
// API CALL SCHEMA
/////////////////////////////////////////

export const ApiCallSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  apiKeyId: z.string().nullish(),
  endpoint: z.string(),
  method: z.string(),
  statusCode: z.number().int(),
  responseTime: z.number().int().nullish(),
  userAgent: z.string().nullish(),
  ipAddress: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type ApiCall = z.infer<typeof ApiCallSchema>

// API CALL OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ApiCallOptionalDefaultsSchema = ApiCallSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type ApiCallOptionalDefaults = z.infer<typeof ApiCallOptionalDefaultsSchema>

/////////////////////////////////////////
// IDEA VALIDATION SCHEMA
/////////////////////////////////////////

export const IdeaValidationSchema = z.object({
  overallStatus: ValidationStatusSchema,
  id: z.string().uuid(),
  ideaId: z.string(),
  overallScore: z.number(),
  confidenceLevel: z.number(),
  validationProgress: z.number(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullish(),
  lastUpdatedAt: z.coerce.date(),
  version: z.number().int(),
  parentValidationId: z.string().nullish(),
  isLatest: z.boolean(),
  revalidationReason: z.string().nullish(),
  dataSourcesUpdated: z.string().array(),
  lastDataRefresh: z.coerce.date().nullish(),
  nextRevalidationDue: z.coerce.date().nullish(),
})

export type IdeaValidation = z.infer<typeof IdeaValidationSchema>

// IDEA VALIDATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const IdeaValidationOptionalDefaultsSchema = IdeaValidationSchema.merge(z.object({
  overallStatus: ValidationStatusSchema.optional(),
  id: z.string().uuid().optional(),
  overallScore: z.number().optional(),
  confidenceLevel: z.number().optional(),
  validationProgress: z.number().optional(),
  startedAt: z.coerce.date().optional(),
  lastUpdatedAt: z.coerce.date().optional(),
  version: z.number().int().optional(),
  isLatest: z.boolean().optional(),
}))

export type IdeaValidationOptionalDefaults = z.infer<typeof IdeaValidationOptionalDefaultsSchema>

/////////////////////////////////////////
// VALIDATION METRICS SCHEMA
/////////////////////////////////////////

export const ValidationMetricsSchema = z.object({
  id: z.string().uuid(),
  validationId: z.string(),
  overallStrengthScore: z.number(),
  overallRiskScore: z.number(),
  timeToMarket: z.number().int().nullish(),
  fundingRequired: z.number().nullish(),
  breakEvenMonth: z.number().int().nullish(),
  customerPayback: z.number().int().nullish(),
  marketPenetration: z.number().nullish(),
  immediateActions: z.number().int(),
  shortTermActions: z.number().int(),
  longTermActions: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ValidationMetrics = z.infer<typeof ValidationMetricsSchema>

// VALIDATION METRICS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ValidationMetricsOptionalDefaultsSchema = ValidationMetricsSchema.merge(z.object({
  id: z.string().uuid().optional(),
  overallStrengthScore: z.number().optional(),
  overallRiskScore: z.number().optional(),
  immediateActions: z.number().int().optional(),
  shortTermActions: z.number().int().optional(),
  longTermActions: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ValidationMetricsOptionalDefaults = z.infer<typeof ValidationMetricsOptionalDefaultsSchema>

/////////////////////////////////////////
// MARKET VALIDATION SCHEMA
/////////////////////////////////////////

export const MarketValidationSchema = z.object({
  primaryCustomerSegment: CustomerSegmentSchema,
  status: ValidationStatusSchema,
  id: z.string().uuid(),
  validationId: z.string(),
  totalAddressableMarket: z.number().nullish(),
  serviceableAddressableMarket: z.number().nullish(),
  serviceableObtainableMarket: z.number().nullish(),
  marketGrowthRate: z.number().nullish(),
  customerInterviews: z.number().int(),
  surveyResponses: z.number().int(),
  overallMarketScore: z.number(),
  primaryRegions: z.string().array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MarketValidation = z.infer<typeof MarketValidationSchema>

// MARKET VALIDATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketValidationOptionalDefaultsSchema = MarketValidationSchema.merge(z.object({
  status: ValidationStatusSchema.optional(),
  id: z.string().uuid().optional(),
  customerInterviews: z.number().int().optional(),
  surveyResponses: z.number().int().optional(),
  overallMarketScore: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type MarketValidationOptionalDefaults = z.infer<typeof MarketValidationOptionalDefaultsSchema>

/////////////////////////////////////////
// MARKET INSIGHT SCHEMA
/////////////////////////////////////////

export const MarketInsightSchema = z.object({
  id: z.string().uuid(),
  marketValidationId: z.string(),
  category: z.string(),
  impact: z.number(),
  urgency: z.number(),
  label: z.string().nullish(),
  description: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type MarketInsight = z.infer<typeof MarketInsightSchema>

// MARKET INSIGHT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketInsightOptionalDefaultsSchema = MarketInsightSchema.merge(z.object({
  id: z.string().uuid().optional(),
  impact: z.number().optional(),
  urgency: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MarketInsightOptionalDefaults = z.infer<typeof MarketInsightOptionalDefaultsSchema>

/////////////////////////////////////////
// MARKET REGION SCORE SCHEMA
/////////////////////////////////////////

export const MarketRegionScoreSchema = z.object({
  id: z.string().uuid(),
  marketValidationId: z.string(),
  region: z.string(),
  score: z.number(),
  createdAt: z.coerce.date(),
})

export type MarketRegionScore = z.infer<typeof MarketRegionScoreSchema>

// MARKET REGION SCORE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketRegionScoreOptionalDefaultsSchema = MarketRegionScoreSchema.merge(z.object({
  id: z.string().uuid().optional(),
  score: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MarketRegionScoreOptionalDefaults = z.infer<typeof MarketRegionScoreOptionalDefaultsSchema>

/////////////////////////////////////////
// BUSINESS VALIDATION SCHEMA
/////////////////////////////////////////

export const BusinessValidationSchema = z.object({
  primaryRevenueModel: RevenueModelSchema,
  pricingStrategy: PricingStrategySchema,
  goToMarketStrategy: GoToMarketStrategySchema,
  status: ValidationStatusSchema,
  id: z.string().uuid(),
  validationId: z.string(),
  pricePoint: z.number().nullish(),
  customerAcquisitionCost: z.number().nullish(),
  customerLifetimeValue: z.number().nullish(),
  monthlyChurnRate: z.number().nullish(),
  breakEvenMonth: z.number().int().nullish(),
  initialInvestment: z.number().nullish(),
  totalFundingNeeded: z.number().nullish(),
  salesCycleLength: z.number().int().nullish(),
  overallBusinessScore: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type BusinessValidation = z.infer<typeof BusinessValidationSchema>

// BUSINESS VALIDATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const BusinessValidationOptionalDefaultsSchema = BusinessValidationSchema.merge(z.object({
  status: ValidationStatusSchema.optional(),
  id: z.string().uuid().optional(),
  overallBusinessScore: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type BusinessValidationOptionalDefaults = z.infer<typeof BusinessValidationOptionalDefaultsSchema>

/////////////////////////////////////////
// BUSINESS INSIGHT SCHEMA
/////////////////////////////////////////

export const BusinessInsightSchema = z.object({
  id: z.string().uuid(),
  businessValidationId: z.string(),
  category: z.string(),
  impact: z.number(),
  urgency: z.number(),
  cost: z.number().nullish(),
  label: z.string().nullish(),
  description: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type BusinessInsight = z.infer<typeof BusinessInsightSchema>

// BUSINESS INSIGHT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const BusinessInsightOptionalDefaultsSchema = BusinessInsightSchema.merge(z.object({
  id: z.string().uuid().optional(),
  impact: z.number().optional(),
  urgency: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type BusinessInsightOptionalDefaults = z.infer<typeof BusinessInsightOptionalDefaultsSchema>

/////////////////////////////////////////
// RISK ANALYSIS SCHEMA
/////////////////////////////////////////

export const RiskAnalysisSchema = z.object({
  status: ValidationStatusSchema,
  id: z.string().uuid(),
  validationId: z.string(),
  overallRiskScore: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RiskAnalysis = z.infer<typeof RiskAnalysisSchema>

// RISK ANALYSIS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const RiskAnalysisOptionalDefaultsSchema = RiskAnalysisSchema.merge(z.object({
  status: ValidationStatusSchema.optional(),
  id: z.string().uuid().optional(),
  overallRiskScore: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type RiskAnalysisOptionalDefaults = z.infer<typeof RiskAnalysisOptionalDefaultsSchema>

/////////////////////////////////////////
// RISK ITEM SCHEMA
/////////////////////////////////////////

export const RiskItemSchema = z.object({
  category: RiskCategorySchema,
  id: z.string().uuid(),
  riskAnalysisId: z.string(),
  description: z.string(),
  impact: z.number().int(),
  probability: z.number().int(),
  mitigation: z.string(),
  createdAt: z.coerce.date(),
})

export type RiskItem = z.infer<typeof RiskItemSchema>

// RISK ITEM OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const RiskItemOptionalDefaultsSchema = RiskItemSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type RiskItemOptionalDefaults = z.infer<typeof RiskItemOptionalDefaultsSchema>

/////////////////////////////////////////
// PRODUCT MARKET FIT ANALYSIS SCHEMA
/////////////////////////////////////////

export const ProductMarketFitAnalysisSchema = z.object({
  status: ValidationStatusSchema,
  id: z.string().uuid(),
  validationId: z.string(),
  pmfScore: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductMarketFitAnalysis = z.infer<typeof ProductMarketFitAnalysisSchema>

// PRODUCT MARKET FIT ANALYSIS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ProductMarketFitAnalysisOptionalDefaultsSchema = ProductMarketFitAnalysisSchema.merge(z.object({
  status: ValidationStatusSchema.optional(),
  id: z.string().uuid().optional(),
  pmfScore: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ProductMarketFitAnalysisOptionalDefaults = z.infer<typeof ProductMarketFitAnalysisOptionalDefaultsSchema>

/////////////////////////////////////////
// PMF METRIC SCHEMA
/////////////////////////////////////////

export const PMFMetricSchema = z.object({
  id: z.string().uuid(),
  productMarketFitAnalysisId: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  trend: z.number().nullish(),
  benchmark: z.number().nullish(),
  createdAt: z.coerce.date(),
})

export type PMFMetric = z.infer<typeof PMFMetricSchema>

// PMF METRIC OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PMFMetricOptionalDefaultsSchema = PMFMetricSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type PMFMetricOptionalDefaults = z.infer<typeof PMFMetricOptionalDefaultsSchema>

/////////////////////////////////////////
// PMF FEEDBACK SCHEMA
/////////////////////////////////////////

export const PMFFeedbackSchema = z.object({
  id: z.string().uuid(),
  productMarketFitAnalysisId: z.string(),
  source: z.string(),
  sentiment: z.string(),
  content: z.string(),
  tags: z.string().array(),
  createdAt: z.coerce.date(),
})

export type PMFFeedback = z.infer<typeof PMFFeedbackSchema>

// PMF FEEDBACK OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PMFFeedbackOptionalDefaultsSchema = PMFFeedbackSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type PMFFeedbackOptionalDefaults = z.infer<typeof PMFFeedbackOptionalDefaultsSchema>

/////////////////////////////////////////
// MONTHLY PROJECTION SCHEMA
/////////////////////////////////////////

export const MonthlyProjectionSchema = z.object({
  id: z.string().uuid(),
  businessValidationId: z.string(),
  month: z.number().int(),
  revenue: z.number(),
  costs: z.number(),
  users: z.number().int(),
  createdAt: z.coerce.date(),
})

export type MonthlyProjection = z.infer<typeof MonthlyProjectionSchema>

// MONTHLY PROJECTION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MonthlyProjectionOptionalDefaultsSchema = MonthlyProjectionSchema.merge(z.object({
  id: z.string().uuid().optional(),
  revenue: z.number().optional(),
  costs: z.number().optional(),
  users: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MonthlyProjectionOptionalDefaults = z.infer<typeof MonthlyProjectionOptionalDefaultsSchema>

/////////////////////////////////////////
// ACQUISITION CHANNEL SCHEMA
/////////////////////////////////////////

export const AcquisitionChannelSchema = z.object({
  id: z.string().uuid(),
  businessValidationId: z.string(),
  channel: z.string(),
  effectiveness: z.number(),
  cost: z.number().nullish(),
  createdAt: z.coerce.date(),
})

export type AcquisitionChannel = z.infer<typeof AcquisitionChannelSchema>

// ACQUISITION CHANNEL OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const AcquisitionChannelOptionalDefaultsSchema = AcquisitionChannelSchema.merge(z.object({
  id: z.string().uuid().optional(),
  effectiveness: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type AcquisitionChannelOptionalDefaults = z.infer<typeof AcquisitionChannelOptionalDefaultsSchema>

/////////////////////////////////////////
// PRICING TIER SCHEMA
/////////////////////////////////////////

export const PricingTierSchema = z.object({
  id: z.string().uuid(),
  pricingStrategyAnalysisId: z.string(),
  tierName: z.string(),
  tierPrice: z.number(),
  tierFeatures: z.string().array(),
  targetSegment: z.string(),
  conversionRate: z.number(),
  popularityScore: z.number(),
  profitMargin: z.number(),
  competitiveScore: z.number(),
  createdAt: z.coerce.date(),
})

export type PricingTier = z.infer<typeof PricingTierSchema>

// PRICING TIER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PricingTierOptionalDefaultsSchema = PricingTierSchema.merge(z.object({
  id: z.string().uuid().optional(),
  tierPrice: z.number().optional(),
  conversionRate: z.number().optional(),
  popularityScore: z.number().optional(),
  profitMargin: z.number().optional(),
  competitiveScore: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type PricingTierOptionalDefaults = z.infer<typeof PricingTierOptionalDefaultsSchema>

/////////////////////////////////////////
// COMPETITOR PRICING SCHEMA
/////////////////////////////////////////

export const CompetitorPricingSchema = z.object({
  id: z.string().uuid(),
  pricingStrategyAnalysisId: z.string(),
  competitorName: z.string(),
  pricingModel: z.string(),
  basePrice: z.number(),
  premiumPrice: z.number().nullish(),
  featureComparison: z.number(),
  valueComparison: z.number(),
  marketPosition: z.string(),
  marketShare: z.number(),
  customerSatisfaction: z.number(),
  pricingAdvantage: z.number(),
  createdAt: z.coerce.date(),
})

export type CompetitorPricing = z.infer<typeof CompetitorPricingSchema>

// COMPETITOR PRICING OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CompetitorPricingOptionalDefaultsSchema = CompetitorPricingSchema.merge(z.object({
  id: z.string().uuid().optional(),
  basePrice: z.number().optional(),
  featureComparison: z.number().optional(),
  valueComparison: z.number().optional(),
  marketShare: z.number().optional(),
  customerSatisfaction: z.number().optional(),
  pricingAdvantage: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type CompetitorPricingOptionalDefaults = z.infer<typeof CompetitorPricingOptionalDefaultsSchema>

/////////////////////////////////////////
// CUSTOMER JOURNEY MAPPING SCHEMA
/////////////////////////////////////////

export const CustomerJourneyMappingSchema = z.object({
  id: z.string().uuid(),
  validationId: z.string(),
  totalJourneyStages: z.number().int(),
  averageJourneyTime: z.number().int(),
  overallJourneyScore: z.number(),
  conversionRate: z.number(),
  dropOffRate: z.number(),
  customerSatisfaction: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CustomerJourneyMapping = z.infer<typeof CustomerJourneyMappingSchema>

// CUSTOMER JOURNEY MAPPING OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CustomerJourneyMappingOptionalDefaultsSchema = CustomerJourneyMappingSchema.merge(z.object({
  id: z.string().uuid().optional(),
  totalJourneyStages: z.number().int().optional(),
  averageJourneyTime: z.number().int().optional(),
  overallJourneyScore: z.number().optional(),
  conversionRate: z.number().optional(),
  dropOffRate: z.number().optional(),
  customerSatisfaction: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type CustomerJourneyMappingOptionalDefaults = z.infer<typeof CustomerJourneyMappingOptionalDefaultsSchema>

/////////////////////////////////////////
// JOURNEY STAGE SCHEMA
/////////////////////////////////////////

export const JourneyStageSchema = z.object({
  id: z.string().uuid(),
  customerJourneyMappingId: z.string(),
  stageName: z.string(),
  stageOrder: z.number().int(),
  averageDuration: z.number().int().nullish(),
  conversionRate: z.number(),
  satisfactionScore: z.number(),
  frictionScore: z.number(),
  emotionalState: z.number(),
  customerGoals: z.string().array(),
  customerActions: z.string().array(),
  customerThoughts: z.string().array(),
  customerEmotions: z.string().array(),
  dropOffRate: z.number(),
  supportTickets: z.number().int(),
  timeToComplete: z.number(),
  createdAt: z.coerce.date(),
})

export type JourneyStage = z.infer<typeof JourneyStageSchema>

// JOURNEY STAGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const JourneyStageOptionalDefaultsSchema = JourneyStageSchema.merge(z.object({
  id: z.string().uuid().optional(),
  conversionRate: z.number().optional(),
  satisfactionScore: z.number().optional(),
  frictionScore: z.number().optional(),
  emotionalState: z.number().optional(),
  dropOffRate: z.number().optional(),
  supportTickets: z.number().int().optional(),
  timeToComplete: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type JourneyStageOptionalDefaults = z.infer<typeof JourneyStageOptionalDefaultsSchema>

/////////////////////////////////////////
// TOUCHPOINT SCHEMA
/////////////////////////////////////////

export const TouchpointSchema = z.object({
  id: z.string().uuid(),
  customerJourneyMappingId: z.string(),
  touchpointName: z.string(),
  touchpointType: z.string(),
  channel: z.string(),
  stageInJourney: z.string(),
  effectivenessScore: z.number(),
  satisfactionScore: z.number(),
  usageFrequency: z.number(),
  importanceScore: z.number(),
  optimizationPotential: z.number(),
  costEfficiency: z.number(),
  automationPotential: z.number(),
  customerExpectations: z.string().array(),
  currentExperience: z.string().nullish(),
  improvementAreas: z.string().array(),
  createdAt: z.coerce.date(),
})

export type Touchpoint = z.infer<typeof TouchpointSchema>

// TOUCHPOINT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TouchpointOptionalDefaultsSchema = TouchpointSchema.merge(z.object({
  id: z.string().uuid().optional(),
  effectivenessScore: z.number().optional(),
  satisfactionScore: z.number().optional(),
  usageFrequency: z.number().optional(),
  importanceScore: z.number().optional(),
  optimizationPotential: z.number().optional(),
  costEfficiency: z.number().optional(),
  automationPotential: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type TouchpointOptionalDefaults = z.infer<typeof TouchpointOptionalDefaultsSchema>

/////////////////////////////////////////
// JOURNEY PAIN POINT SCHEMA
/////////////////////////////////////////

export const JourneyPainPointSchema = z.object({
  id: z.string().uuid(),
  customerJourneyMappingId: z.string(),
  painPointName: z.string(),
  journeyStage: z.string(),
  painCategory: z.string(),
  severityScore: z.number(),
  frequencyScore: z.number(),
  impactScore: z.number(),
  resolutionDifficulty: z.number(),
  dropOffIncrease: z.number(),
  supportCost: z.number(),
  revenueImpact: z.number(),
  currentMitigation: z.string().nullish(),
  proposedSolution: z.string().nullish(),
  solutionPriority: z.number(),
  createdAt: z.coerce.date(),
})

export type JourneyPainPoint = z.infer<typeof JourneyPainPointSchema>

// JOURNEY PAIN POINT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const JourneyPainPointOptionalDefaultsSchema = JourneyPainPointSchema.merge(z.object({
  id: z.string().uuid().optional(),
  severityScore: z.number().optional(),
  frequencyScore: z.number().optional(),
  impactScore: z.number().optional(),
  resolutionDifficulty: z.number().optional(),
  dropOffIncrease: z.number().optional(),
  supportCost: z.number().optional(),
  revenueImpact: z.number().optional(),
  solutionPriority: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type JourneyPainPointOptionalDefaults = z.infer<typeof JourneyPainPointOptionalDefaultsSchema>

/////////////////////////////////////////
// TARGET AUDIENCE SEGMENTATION SCHEMA
/////////////////////////////////////////

export const TargetAudienceSegmentationSchema = z.object({
  id: z.string().uuid(),
  validationId: z.string(),
  primarySegment: z.string(),
  totalSegments: z.number().int(),
  totalMarketSize: z.number().int(),
  overallSegmentationScore: z.number(),
  averageSegmentSize: z.number().int(),
  segmentAccessibility: z.number(),
  marketPenetration: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TargetAudienceSegmentation = z.infer<typeof TargetAudienceSegmentationSchema>

// TARGET AUDIENCE SEGMENTATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TargetAudienceSegmentationOptionalDefaultsSchema = TargetAudienceSegmentationSchema.merge(z.object({
  id: z.string().uuid().optional(),
  totalSegments: z.number().int().optional(),
  totalMarketSize: z.number().int().optional(),
  overallSegmentationScore: z.number().optional(),
  averageSegmentSize: z.number().int().optional(),
  segmentAccessibility: z.number().optional(),
  marketPenetration: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type TargetAudienceSegmentationOptionalDefaults = z.infer<typeof TargetAudienceSegmentationOptionalDefaultsSchema>

/////////////////////////////////////////
// AUDIENCE SEGMENT SCHEMA
/////////////////////////////////////////

export const AudienceSegmentSchema = z.object({
  id: z.string().uuid(),
  targetAudienceSegmentationId: z.string(),
  segmentName: z.string(),
  segmentSize: z.number(),
  attractivenessScore: z.number(),
  accessibilityScore: z.number(),
  profitabilityScore: z.number(),
  primaryNeed: z.string().nullish(),
  secondaryNeeds: z.string().array(),
  preferredSolution: z.string().nullish(),
  budgetRange: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type AudienceSegment = z.infer<typeof AudienceSegmentSchema>

// AUDIENCE SEGMENT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const AudienceSegmentOptionalDefaultsSchema = AudienceSegmentSchema.merge(z.object({
  id: z.string().uuid().optional(),
  segmentSize: z.number().optional(),
  attractivenessScore: z.number().optional(),
  accessibilityScore: z.number().optional(),
  profitabilityScore: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type AudienceSegmentOptionalDefaults = z.infer<typeof AudienceSegmentOptionalDefaultsSchema>

/////////////////////////////////////////
// MARKET TREND ANALYSIS SCHEMA
/////////////////////////////////////////

export const MarketTrendAnalysisSchema = z.object({
  id: z.string().uuid(),
  validationId: z.string(),
  primaryTrend: z.string(),
  totalTrendsTracked: z.number().int(),
  analysisTimeframe: z.number().int(),
  overallTrendScore: z.number(),
  trendStrength: z.number(),
  marketGrowthRate: z.number(),
  adoptionRate: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MarketTrendAnalysis = z.infer<typeof MarketTrendAnalysisSchema>

// MARKET TREND ANALYSIS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketTrendAnalysisOptionalDefaultsSchema = MarketTrendAnalysisSchema.merge(z.object({
  id: z.string().uuid().optional(),
  totalTrendsTracked: z.number().int().optional(),
  analysisTimeframe: z.number().int().optional(),
  overallTrendScore: z.number().optional(),
  trendStrength: z.number().optional(),
  marketGrowthRate: z.number().optional(),
  adoptionRate: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type MarketTrendAnalysisOptionalDefaults = z.infer<typeof MarketTrendAnalysisOptionalDefaultsSchema>

/////////////////////////////////////////
// MARKET TREND SCHEMA
/////////////////////////////////////////

export const MarketTrendSchema = z.object({
  id: z.string().uuid(),
  marketTrendAnalysisId: z.string(),
  trendName: z.string(),
  trendCategory: z.string(),
  impactScore: z.number(),
  timelineMonths: z.number().int().nullish(),
  certaintyLevel: z.number(),
  opportunityScore: z.number(),
  threatScore: z.number(),
  description: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type MarketTrend = z.infer<typeof MarketTrendSchema>

// MARKET TREND OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketTrendOptionalDefaultsSchema = MarketTrendSchema.merge(z.object({
  id: z.string().uuid().optional(),
  impactScore: z.number().optional(),
  certaintyLevel: z.number().optional(),
  opportunityScore: z.number().optional(),
  threatScore: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MarketTrendOptionalDefaults = z.infer<typeof MarketTrendOptionalDefaultsSchema>

/////////////////////////////////////////
// CUSTOMER NEED ANALYSIS SCHEMA
/////////////////////////////////////////

export const CustomerNeedAnalysisSchema = z.object({
  id: z.string().uuid(),
  validationId: z.string(),
  primaryNeed: z.string(),
  totalNeedsIdentified: z.number().int(),
  totalPainPoints: z.number().int(),
  overallNeedScore: z.number(),
  needUrgency: z.number(),
  solutionGap: z.number(),
  customerWillingness: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CustomerNeedAnalysis = z.infer<typeof CustomerNeedAnalysisSchema>

// CUSTOMER NEED ANALYSIS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CustomerNeedAnalysisOptionalDefaultsSchema = CustomerNeedAnalysisSchema.merge(z.object({
  id: z.string().uuid().optional(),
  totalNeedsIdentified: z.number().int().optional(),
  totalPainPoints: z.number().int().optional(),
  overallNeedScore: z.number().optional(),
  needUrgency: z.number().optional(),
  solutionGap: z.number().optional(),
  customerWillingness: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type CustomerNeedAnalysisOptionalDefaults = z.infer<typeof CustomerNeedAnalysisOptionalDefaultsSchema>

/////////////////////////////////////////
// CUSTOMER NEED SCHEMA
/////////////////////////////////////////

export const CustomerNeedSchema = z.object({
  id: z.string().uuid(),
  customerNeedAnalysisId: z.string(),
  needName: z.string(),
  needCategory: z.string(),
  intensityScore: z.number(),
  frequencyScore: z.number(),
  urgencyScore: z.number(),
  satisfactionGap: z.number(),
  triggerEvents: z.string().array(),
  desiredOutcome: z.string().nullish(),
  currentSolution: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type CustomerNeed = z.infer<typeof CustomerNeedSchema>

// CUSTOMER NEED OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CustomerNeedOptionalDefaultsSchema = CustomerNeedSchema.merge(z.object({
  id: z.string().uuid().optional(),
  intensityScore: z.number().optional(),
  frequencyScore: z.number().optional(),
  urgencyScore: z.number().optional(),
  satisfactionGap: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type CustomerNeedOptionalDefaults = z.infer<typeof CustomerNeedOptionalDefaultsSchema>

/////////////////////////////////////////
// PAIN POINT SCHEMA
/////////////////////////////////////////

export const PainPointSchema = z.object({
  id: z.string().uuid(),
  customerNeedAnalysisId: z.string(),
  painName: z.string(),
  painCategory: z.string(),
  severityScore: z.number(),
  frequencyScore: z.number(),
  impactScore: z.number(),
  emotionalToll: z.number(),
  timeCostHours: z.number().nullish(),
  financialCost: z.number().nullish(),
  opportunityCost: z.number().nullish(),
  painTriggers: z.string().array(),
  currentMitigation: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type PainPoint = z.infer<typeof PainPointSchema>

// PAIN POINT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PainPointOptionalDefaultsSchema = PainPointSchema.merge(z.object({
  id: z.string().uuid().optional(),
  severityScore: z.number().optional(),
  frequencyScore: z.number().optional(),
  impactScore: z.number().optional(),
  emotionalToll: z.number().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type PainPointOptionalDefaults = z.infer<typeof PainPointOptionalDefaultsSchema>

/////////////////////////////////////////
// PRICING STRATEGY ANALYSIS SCHEMA
/////////////////////////////////////////

export const PricingStrategyAnalysisSchema = z.object({
  primaryStrategy: PricingStrategySchema,
  id: z.string().uuid(),
  validationId: z.string(),
  recommendedPrice: z.number().nullish(),
  totalTiersAnalyzed: z.number().int(),
  overallPricingScore: z.number(),
  priceAcceptance: z.number(),
  competitivenessScore: z.number(),
  profitabilityScore: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PricingStrategyAnalysis = z.infer<typeof PricingStrategyAnalysisSchema>

// PRICING STRATEGY ANALYSIS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PricingStrategyAnalysisOptionalDefaultsSchema = PricingStrategyAnalysisSchema.merge(z.object({
  id: z.string().uuid().optional(),
  totalTiersAnalyzed: z.number().int().optional(),
  overallPricingScore: z.number().optional(),
  priceAcceptance: z.number().optional(),
  competitivenessScore: z.number().optional(),
  profitabilityScore: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type PricingStrategyAnalysisOptionalDefaults = z.infer<typeof PricingStrategyAnalysisOptionalDefaultsSchema>
