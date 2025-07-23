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

export const ProjectScalarFieldEnumSchema = z.enum(['id','name','description','platform','ai','orm','database','auth','framework','infrastructure','dueDate','status','ideaId','createdAt','updatedAt','organizationId','createdById']);

export const IdeaScalarFieldEnumSchema = z.enum(['id','name','description','industry','ownerId','organizationId','internal','openSource','status','aiOverallValidation','problemSolved','solutionOffered','createdAt','updatedAt']);

export const IssueScalarFieldEnumSchema = z.enum(['id','title','description','organizationId','projectId','milestoneId','featureId','parentIssueId','status','priority','label','dueDate','assignedToId','achieved','isPublic','sourceType','sourceFeedbackId']);

export const IssueDependencyScalarFieldEnumSchema = z.enum(['id','organizationId','issueId','dependencyId','createdAt']);

export const IssueLinkScalarFieldEnumSchema = z.enum(['id','organizationId','issueId','url','createdAt']);

export const AssetScalarFieldEnumSchema = z.enum(['id','name','description','type','projectId','organizationId','storageId','fileName','fileSize','mimeType','url','linkType','tags','category','thumbnailUrl','isPublic','uploadedById','createdAt','updatedAt']);

export const ApiKeyScalarFieldEnumSchema = z.enum(['id','organizationId','name','keyHash','keyPreview','createdBy','createdAt','lastUsed','isActive','expiresAt']);

export const ActivityFeedScalarFieldEnumSchema = z.enum(['id','type','title','description','entityType','entityId','organizationId','userId','oldValue','newValue','createdAt','updatedAt']);

export const PublicRoadmapScalarFieldEnumSchema = z.enum(['id','projectId','name','slug','description','isPublic','customDomain','theme','logoUrl','accentColor','allowVoting','allowFeedback','showChangelog','createdAt','updatedAt']);

export const RoadmapItemScalarFieldEnumSchema = z.enum(['id','roadmapId','issueId','nodeId','title','description','status','category','isPublic','priority','targetDate','createdAt','updatedAt']);

export const RoadmapVoteScalarFieldEnumSchema = z.enum(['id','roadmapItemId','userId','ipAddress','createdAt']);

export const RoadmapFeedbackScalarFieldEnumSchema = z.enum(['id','roadmapItemId','userId','ipAddress','content','sentiment','isApproved','convertedToFeatureId','convertedToIssueId','convertedAt','convertedBy','conversionNotes','createdAt']);

export const RoadmapChangelogScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','fixes','newFeatures','publishDate','isPublished','createdAt','updatedAt']);

export const FeatureRequestScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','category','email','name','ipAddress','status','priority','isPublic','adminNotes','createdAt','updatedAt']);

export const IntegrationScalarFieldEnumSchema = z.enum(['id','name','type','config','isActive','organizationId','createdAt','updatedAt','createdById']);

export const IntegrationUsageScalarFieldEnumSchema = z.enum(['id','integrationId','entityType','entityId','purpose','isActive','createdAt','updatedAt']);

export const WaitlistScalarFieldEnumSchema = z.enum(['id','projectId','name','slug','description','isPublic','allowNameCapture','showPosition','showSocialProof','customMessage','organizationId','createdAt','updatedAt','createdById']);

export const WaitlistEntryScalarFieldEnumSchema = z.enum(['id','waitlistId','email','name','status','position','referralCode','referredBy','verificationToken','verifiedAt','invitedAt','joinedAt','ipAddress','userAgent','utmSource','utmMedium','utmCampaign','createdAt','updatedAt']);

export const FeatureScalarFieldEnumSchema = z.enum(['id','name','description','projectId','phase','businessValue','estimatedEffort','startDate','endDate','priority','assignedToId','parentFeatureId','organizationId','createdAt','updatedAt','milestoneId']);

export const FeatureDependencyScalarFieldEnumSchema = z.enum(['id','organizationId','featureId','dependencyId','createdAt']);

export const FeatureLinkScalarFieldEnumSchema = z.enum(['id','organizationId','featureId','url','createdAt']);

export const MilestoneScalarFieldEnumSchema = z.enum(['id','name','description','status','startDate','endDate','createdAt','updatedAt','projectId','organizationId','ownerId']);

export const MilestoneDependencyScalarFieldEnumSchema = z.enum(['id','organizationId','milestoneId','dependencyId','createdAt']);

export const MarketResearchScalarFieldEnumSchema = z.enum(['id','ideaId','organizationId','marketSize','marketGrowthRate','marketMaturity','totalAddressableMarket','serviceableAddressableMarket','serviceableObtainableMarket','keyTrends','emergingTechnologies','regulatoryFactors','validationScore','confidenceLevel','lastUpdated','createdAt']);

export const TargetAudienceScalarFieldEnumSchema = z.enum(['id','marketResearchId','segmentName','ageRange','location','companySize','industry','painPoints','decisionFactors','budgetRange','techSavviness','estimatedSize','averageSpend','segmentValue','isPrimary','priority','createdAt']);

export const MarketTrendScalarFieldEnumSchema = z.enum(['id','marketResearchId','trendName','description','impact','growthRate','marketSize','adoptionRate','keyDrivers','challenges','opportunities','dataSource','confidenceLevel','lastUpdated','createdAt']);

export const CustomerNeedScalarFieldEnumSchema = z.enum(['id','marketResearchId','needType','description','priority','frequency','businessImpact','userImpact','costImpact','existingSolutions','gapsInSolutions','createdAt']);

export const CompetitiveLandscapeScalarFieldEnumSchema = z.enum(['id','marketResearchId','competitiveIntensity','marketPositioning','differentiationOpportunities','competitiveAdvantage','totalMarketShare','topCompetitors','marketConcentration','entryBarriers','exitBarriers','switchingCosts','emergingThreats','marketDisruptions','createdAt']);

export const CompetitorScalarFieldEnumSchema = z.enum(['id','competitiveLandscapeId','name','website','description','logoUrl','marketShare','annualRevenue','fundingRaised','employeeCount','foundedYear','headquarters','productFeatures','pricingModel','targetAudience','techStack','integrations','strengths','weaknesses','opportunities','threats','competitiveAdvantage','differentiationFactors','threatLevel','competitivePosition','userGrowthRate','churnRate','customerSatisfaction','marketCap','lastUpdated','createdAt','isActive']);

export const CompetitorPricingScalarFieldEnumSchema = z.enum(['id','competitorId','planName','price','billingCycle','features','limitations','userLimit','valuePerDollar','competitivePosition','previousPrice','priceChangeDate','priceChangeReason','createdAt']);

export const CompetitiveMoveScalarFieldEnumSchema = z.enum(['id','competitiveLandscapeId','competitorId','moveType','title','description','impactLevel','targetAudience','affectedFeatures','announcedDate','launchDate','completionDate','marketReaction','userFeedback','pressCoverage','opportunities','threats','responseRequired','responseStrategy','createdAt']);

export const FeatureComparisonScalarFieldEnumSchema = z.enum(['id','competitorId','featureName','featureCategory','isAvailable','quality','implementationNotes','userRating','marketShare','adoptionRate','competitiveAdvantage','differentiationPoints','createdAt']);

export const ValidationInsightScalarFieldEnumSchema = z.enum(['id','marketResearchId','insightType','title','description','confidence','dataSources','analysisMethod','impactLevel','affectedAreas','recommendations','isVerified','verificationMethod','verifiedBy','verifiedAt','createdAt']);

export const MarketSignalScalarFieldEnumSchema = z.enum(['id','marketResearchId','signalType','title','description','source','strength','confidence','trend','marketImpact','competitiveImpact','timing','isMonitored','lastChecked','createdAt']);

export const ValidationScorecardScalarFieldEnumSchema = z.enum(['id','marketResearchId','marketScore','competitiveScore','technicalScore','financialScore','riskScore','weightedScore','primaryRecommendation','secondaryRecommendations','riskMitigationStrategies','validationStatus','nextReviewDate','createdAt','updatedAt']);

export const ValidationScoreBreakdownScalarFieldEnumSchema = z.enum(['id','validationScorecardId','category','score','weight','weightedScore','reasoning','createdAt']);

export const TechnologyAssessmentScalarFieldEnumSchema = z.enum(['id','marketResearchId','technicalComplexity','developmentTimeline','teamRequirements','recommendedStack','alternativeStacks','integrationRequirements','technicalRisks','scalabilityChallenges','securityConsiderations','developmentCosts','infrastructureCosts','maintenanceCosts','technicalAdvantages','innovationPotential','createdAt']);

export const FinancialProjectionScalarFieldEnumSchema = z.enum(['id','marketResearchId','projectedRevenue','revenueGrowthRate','breakEvenPoint','developmentCosts','marketingCosts','operationalCosts','customerAcquisitionCost','averageRevenuePerUser','customerLifetimeValue','paybackPeriod','fundingNeeded','riskFactors','mitigationStrategies','optimisticScenario','realisticScenario','pessimisticScenario','createdAt']);

export const FundingRoundScalarFieldEnumSchema = z.enum(['id','financialProjectionId','roundName','amount','equity','valuation','timeline','investorType','investorName','developmentAllocation','marketingAllocation','operationsAllocation','createdAt']);

export const RegulatoryComplianceScalarFieldEnumSchema = z.enum(['id','marketResearchId','applicableRegulations','complianceLevel','riskLevel','industryStandards','certificationRequirements','targetMarkets','localRegulations','complianceCosts','timelineToCompliance','requiredResources','complianceRisks','mitigationStrategies','createdAt']);

export const AssetViewScalarFieldEnumSchema = z.enum(['id','assetId','organizationId','userId','ipAddress','userAgent','referrer','viewedAt']);

export const AssetDownloadScalarFieldEnumSchema = z.enum(['id','assetId','organizationId','userId','ipAddress','userAgent','referrer','downloadedAt']);

export const ReferralScalarFieldEnumSchema = z.enum(['id','referrerId','referredEmail','referredName','ipAddress','userAgent','referrerCode','waitlistId','organizationId','createdAt']);

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

export const PrdStatusSchema = z.enum(['draft','approved','archived']);

export type PrdStatusType = `${z.infer<typeof PrdStatusSchema>}`

export const AnalysisReportTypeSchema = z.enum(['flow_analysis','missing_flows','recommendations']);

export type AnalysisReportTypeType = `${z.infer<typeof AnalysisReportTypeSchema>}`

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

export const MarketMaturitySchema = z.enum(['EMERGING','GROWING','MATURE','DECLINING']);

export type MarketMaturityType = `${z.infer<typeof MarketMaturitySchema>}`

export const ConfidenceLevelSchema = z.enum(['LOW','MEDIUM','HIGH','VERY_HIGH']);

export type ConfidenceLevelType = `${z.infer<typeof ConfidenceLevelSchema>}`

export const CompanySizeSchema = z.enum(['SOLO','SMALL_1_10','MEDIUM_11_50','LARGE_51_200','ENTERPRISE_200_PLUS']);

export type CompanySizeType = `${z.infer<typeof CompanySizeSchema>}`

export const TechSavvinessSchema = z.enum(['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT']);

export type TechSavvinessType = `${z.infer<typeof TechSavvinessSchema>}`

export const TrendImpactSchema = z.enum(['LOW','MEDIUM','HIGH','CRITICAL']);

export type TrendImpactType = `${z.infer<typeof TrendImpactSchema>}`

export const CustomerNeedTypeSchema = z.enum(['FUNCTIONAL','EMOTIONAL','SOCIAL','FINANCIAL','TECHNICAL']);

export type CustomerNeedTypeType = `${z.infer<typeof CustomerNeedTypeSchema>}`

export const CompetitiveIntensitySchema = z.enum(['LOW','MEDIUM','HIGH','VERY_HIGH']);

export type CompetitiveIntensityType = `${z.infer<typeof CompetitiveIntensitySchema>}`

export const PricingModelSchema = z.enum(['SUBSCRIPTION','FREEMIUM','ONE_TIME','USAGE_BASED','HYBRID']);

export type PricingModelType = `${z.infer<typeof PricingModelSchema>}`

export const ThreatLevelSchema = z.enum(['LOW','MEDIUM','HIGH','CRITICAL']);

export type ThreatLevelType = `${z.infer<typeof ThreatLevelSchema>}`

export const CompetitivePositionSchema = z.enum(['MARKET_LEADER','STRONG_CHALLENGER','WEAK_CHALLENGER','NICHE_PLAYER','NEW_ENTRANT']);

export type CompetitivePositionType = `${z.infer<typeof CompetitivePositionSchema>}`

export const CompetitiveMoveTypeSchema = z.enum(['PRODUCT_LAUNCH','FEATURE_UPDATE','PRICING_CHANGE','PARTNERSHIP','ACQUISITION','MARKETING_CAMPAIGN','EXPANSION','PIVOT']);

export type CompetitiveMoveTypeType = `${z.infer<typeof CompetitiveMoveTypeSchema>}`

export const MarketReactionSchema = z.enum(['POSITIVE','NEUTRAL','NEGATIVE','MIXED']);

export type MarketReactionType = `${z.infer<typeof MarketReactionSchema>}`

export const ImpactSchema = z.enum(['LOW','MEDIUM','HIGH','CRITICAL']);

export type ImpactType = `${z.infer<typeof ImpactSchema>}`

export const InsightTypeSchema = z.enum(['MARKET_OPPORTUNITY','COMPETITIVE_THREAT','CUSTOMER_INSIGHT','TECHNICAL_CHALLENGE','FINANCIAL_RISK','REGULATORY_IMPACT','TIMING_OPPORTUNITY']);

export type InsightTypeType = `${z.infer<typeof InsightTypeSchema>}`

export const MarketSignalTypeSchema = z.enum(['FUNDING_ANNOUNCEMENT','PRODUCT_LAUNCH','PARTNERSHIP','ACQUISITION','REGULATORY_CHANGE','TECHNOLOGY_BREAKTHROUGH','MARKET_TREND','COMPETITIVE_MOVE']);

export type MarketSignalTypeType = `${z.infer<typeof MarketSignalTypeSchema>}`

export const SignalStrengthSchema = z.enum(['WEAK','MODERATE','STRONG','CRITICAL']);

export type SignalStrengthType = `${z.infer<typeof SignalStrengthSchema>}`

export const TrendDirectionSchema = z.enum(['INCREASING','DECREASING','STABLE','VOLATILE']);

export type TrendDirectionType = `${z.infer<typeof TrendDirectionSchema>}`

export const ValidationStatusSchema = z.enum(['IN_PROGRESS','VALIDATED','NEEDS_IMPROVEMENT','FAILED','REQUIRES_REVIEW']);

export type ValidationStatusType = `${z.infer<typeof ValidationStatusSchema>}`

export const TechnicalComplexitySchema = z.enum(['LOW','MEDIUM','HIGH','VERY_HIGH']);

export type TechnicalComplexityType = `${z.infer<typeof TechnicalComplexitySchema>}`

export const ComplianceLevelSchema = z.enum(['LOW','MEDIUM','HIGH','CRITICAL']);

export type ComplianceLevelType = `${z.infer<typeof ComplianceLevelSchema>}`

export const RiskLevelSchema = z.enum(['LOW','MEDIUM','HIGH','CRITICAL']);

export type RiskLevelType = `${z.infer<typeof RiskLevelSchema>}`

export const InvestorTypeSchema = z.enum(['ANGEL','VENTURE_CAPITAL','PRIVATE_EQUITY','CORPORATE','CROWDFUNDING']);

export type InvestorTypeType = `${z.infer<typeof InvestorTypeSchema>}`

export const BillingCycleSchema = z.enum(['MONTHLY','QUARTERLY','ANNUALLY','ONE_TIME']);

export type BillingCycleType = `${z.infer<typeof BillingCycleSchema>}`

export const FeatureQualitySchema = z.enum(['EXCELLENT','GOOD','AVERAGE','POOR','UNKNOWN']);

export type FeatureQualityType = `${z.infer<typeof FeatureQualitySchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

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
// API KEY SCHEMA
/////////////////////////////////////////

export const ApiKeySchema = z.object({
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
  id: z.string().uuid().optional(),
}))

export type ApiKeyOptionalDefaults = z.infer<typeof ApiKeyOptionalDefaultsSchema>

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
  customDomain: z.string().nullish(),
  theme: z.string().nullish(),
  logoUrl: z.string().nullish(),
  accentColor: z.string().nullish(),
  allowVoting: z.boolean(),
  allowFeedback: z.boolean(),
  showChangelog: z.boolean(),
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
  issueId: z.string().nullish(),
  nodeId: z.string().nullish(),
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
  fixes: z.string().array(),
  newFeatures: z.string().array(),
  publishDate: z.coerce.date(),
  isPublished: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RoadmapChangelog = z.infer<typeof RoadmapChangelogSchema>

// ROADMAP CHANGELOG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const RoadmapChangelogOptionalDefaultsSchema = RoadmapChangelogSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type RoadmapChangelogOptionalDefaults = z.infer<typeof RoadmapChangelogOptionalDefaultsSchema>

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
// MARKET RESEARCH SCHEMA
/////////////////////////////////////////

export const MarketResearchSchema = z.object({
  marketMaturity: MarketMaturitySchema,
  confidenceLevel: ConfidenceLevelSchema,
  id: z.string().uuid(),
  ideaId: z.string(),
  organizationId: z.string(),
  marketSize: z.number().nullish(),
  marketGrowthRate: z.number().nullish(),
  totalAddressableMarket: z.number().nullish(),
  serviceableAddressableMarket: z.number().nullish(),
  serviceableObtainableMarket: z.number().nullish(),
  keyTrends: z.string().array(),
  emergingTechnologies: z.string().array(),
  regulatoryFactors: z.string().array(),
  validationScore: z.number().nullish(),
  lastUpdated: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type MarketResearch = z.infer<typeof MarketResearchSchema>

// MARKET RESEARCH OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketResearchOptionalDefaultsSchema = MarketResearchSchema.merge(z.object({
  id: z.string().uuid().optional(),
  lastUpdated: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MarketResearchOptionalDefaults = z.infer<typeof MarketResearchOptionalDefaultsSchema>

/////////////////////////////////////////
// TARGET AUDIENCE SCHEMA
/////////////////////////////////////////

export const TargetAudienceSchema = z.object({
  companySize: CompanySizeSchema.nullish(),
  techSavviness: TechSavvinessSchema,
  id: z.string().uuid(),
  marketResearchId: z.string(),
  segmentName: z.string(),
  ageRange: z.string().nullish(),
  location: z.string().nullish(),
  industry: z.string().nullish(),
  painPoints: z.string().array(),
  decisionFactors: z.string().array(),
  budgetRange: z.string().nullish(),
  estimatedSize: z.number().int().nullish(),
  averageSpend: z.number().nullish(),
  segmentValue: z.number().nullish(),
  isPrimary: z.boolean(),
  priority: z.number().int(),
  createdAt: z.coerce.date(),
})

export type TargetAudience = z.infer<typeof TargetAudienceSchema>

// TARGET AUDIENCE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TargetAudienceOptionalDefaultsSchema = TargetAudienceSchema.merge(z.object({
  id: z.string().uuid().optional(),
  isPrimary: z.boolean().optional(),
  priority: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type TargetAudienceOptionalDefaults = z.infer<typeof TargetAudienceOptionalDefaultsSchema>

/////////////////////////////////////////
// MARKET TREND SCHEMA
/////////////////////////////////////////

export const MarketTrendSchema = z.object({
  impact: TrendImpactSchema,
  confidenceLevel: ConfidenceLevelSchema,
  id: z.string().uuid(),
  marketResearchId: z.string(),
  trendName: z.string(),
  description: z.string(),
  growthRate: z.number().nullish(),
  marketSize: z.number().nullish(),
  adoptionRate: z.number().nullish(),
  keyDrivers: z.string().array(),
  challenges: z.string().array(),
  opportunities: z.string().array(),
  dataSource: z.string().nullish(),
  lastUpdated: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type MarketTrend = z.infer<typeof MarketTrendSchema>

// MARKET TREND OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketTrendOptionalDefaultsSchema = MarketTrendSchema.merge(z.object({
  id: z.string().uuid().optional(),
  lastUpdated: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MarketTrendOptionalDefaults = z.infer<typeof MarketTrendOptionalDefaultsSchema>

/////////////////////////////////////////
// CUSTOMER NEED SCHEMA
/////////////////////////////////////////

export const CustomerNeedSchema = z.object({
  needType: CustomerNeedTypeSchema,
  priority: ImportanceSchema,
  id: z.string().uuid(),
  marketResearchId: z.string(),
  description: z.string(),
  frequency: z.string().nullish(),
  businessImpact: z.string().nullish(),
  userImpact: z.string().nullish(),
  costImpact: z.number().nullish(),
  existingSolutions: z.string().array(),
  gapsInSolutions: z.string().array(),
  createdAt: z.coerce.date(),
})

export type CustomerNeed = z.infer<typeof CustomerNeedSchema>

// CUSTOMER NEED OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CustomerNeedOptionalDefaultsSchema = CustomerNeedSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type CustomerNeedOptionalDefaults = z.infer<typeof CustomerNeedOptionalDefaultsSchema>

/////////////////////////////////////////
// COMPETITIVE LANDSCAPE SCHEMA
/////////////////////////////////////////

export const CompetitiveLandscapeSchema = z.object({
  competitiveIntensity: CompetitiveIntensitySchema,
  id: z.string().uuid(),
  marketResearchId: z.string(),
  marketPositioning: z.string().nullish(),
  differentiationOpportunities: z.string().array(),
  competitiveAdvantage: z.string().nullish(),
  totalMarketShare: z.number().nullish(),
  topCompetitors: z.number().int().nullish(),
  marketConcentration: z.number().nullish(),
  entryBarriers: z.string().array(),
  exitBarriers: z.string().array(),
  switchingCosts: z.number().nullish(),
  emergingThreats: z.string().array(),
  marketDisruptions: z.string().array(),
  createdAt: z.coerce.date(),
})

export type CompetitiveLandscape = z.infer<typeof CompetitiveLandscapeSchema>

// COMPETITIVE LANDSCAPE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CompetitiveLandscapeOptionalDefaultsSchema = CompetitiveLandscapeSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type CompetitiveLandscapeOptionalDefaults = z.infer<typeof CompetitiveLandscapeOptionalDefaultsSchema>

/////////////////////////////////////////
// COMPETITOR SCHEMA
/////////////////////////////////////////

export const CompetitorSchema = z.object({
  pricingModel: PricingModelSchema,
  threatLevel: ThreatLevelSchema,
  competitivePosition: CompetitivePositionSchema,
  id: z.string().uuid(),
  competitiveLandscapeId: z.string(),
  name: z.string(),
  website: z.string().nullish(),
  description: z.string().nullish(),
  logoUrl: z.string().nullish(),
  marketShare: z.number().nullish(),
  annualRevenue: z.number().nullish(),
  fundingRaised: z.number().nullish(),
  employeeCount: z.number().int().nullish(),
  foundedYear: z.number().int().nullish(),
  headquarters: z.string().nullish(),
  productFeatures: z.string().array(),
  targetAudience: z.string().nullish(),
  techStack: z.string().array(),
  integrations: z.string().array(),
  strengths: z.string().array(),
  weaknesses: z.string().array(),
  opportunities: z.string().array(),
  threats: z.string().array(),
  competitiveAdvantage: z.string().nullish(),
  differentiationFactors: z.string().array(),
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
// COMPETITOR PRICING SCHEMA
/////////////////////////////////////////

export const CompetitorPricingSchema = z.object({
  billingCycle: BillingCycleSchema,
  id: z.string().uuid(),
  competitorId: z.string(),
  planName: z.string(),
  price: z.number(),
  features: z.string().array(),
  limitations: z.string().nullish(),
  userLimit: z.number().int().nullish(),
  valuePerDollar: z.number().nullish(),
  competitivePosition: z.string().nullish(),
  previousPrice: z.number().nullish(),
  priceChangeDate: z.coerce.date().nullish(),
  priceChangeReason: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type CompetitorPricing = z.infer<typeof CompetitorPricingSchema>

// COMPETITOR PRICING OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CompetitorPricingOptionalDefaultsSchema = CompetitorPricingSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type CompetitorPricingOptionalDefaults = z.infer<typeof CompetitorPricingOptionalDefaultsSchema>

/////////////////////////////////////////
// COMPETITIVE MOVE SCHEMA
/////////////////////////////////////////

export const CompetitiveMoveSchema = z.object({
  moveType: CompetitiveMoveTypeSchema,
  impactLevel: ImpactSchema,
  marketReaction: MarketReactionSchema.nullish(),
  id: z.string().uuid(),
  competitiveLandscapeId: z.string(),
  competitorId: z.string().nullish(),
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
// FEATURE COMPARISON SCHEMA
/////////////////////////////////////////

export const FeatureComparisonSchema = z.object({
  quality: FeatureQualitySchema.nullish(),
  id: z.string().uuid(),
  competitorId: z.string(),
  featureName: z.string(),
  featureCategory: z.string(),
  isAvailable: z.boolean(),
  implementationNotes: z.string().nullish(),
  userRating: z.number().nullish(),
  marketShare: z.number().nullish(),
  adoptionRate: z.number().nullish(),
  competitiveAdvantage: z.string().nullish(),
  differentiationPoints: z.string().array(),
  createdAt: z.coerce.date(),
})

export type FeatureComparison = z.infer<typeof FeatureComparisonSchema>

// FEATURE COMPARISON OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FeatureComparisonOptionalDefaultsSchema = FeatureComparisonSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type FeatureComparisonOptionalDefaults = z.infer<typeof FeatureComparisonOptionalDefaultsSchema>

/////////////////////////////////////////
// VALIDATION INSIGHT SCHEMA
/////////////////////////////////////////

export const ValidationInsightSchema = z.object({
  insightType: InsightTypeSchema,
  impactLevel: ImpactSchema,
  id: z.string().uuid(),
  marketResearchId: z.string(),
  title: z.string(),
  description: z.string(),
  confidence: z.number().nullish(),
  dataSources: z.string().array(),
  analysisMethod: z.string().nullish(),
  affectedAreas: z.string().array(),
  recommendations: z.string().array(),
  isVerified: z.boolean(),
  verificationMethod: z.string().nullish(),
  verifiedBy: z.string().nullish(),
  verifiedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
})

export type ValidationInsight = z.infer<typeof ValidationInsightSchema>

// VALIDATION INSIGHT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ValidationInsightOptionalDefaultsSchema = ValidationInsightSchema.merge(z.object({
  id: z.string().uuid().optional(),
  isVerified: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type ValidationInsightOptionalDefaults = z.infer<typeof ValidationInsightOptionalDefaultsSchema>

/////////////////////////////////////////
// MARKET SIGNAL SCHEMA
/////////////////////////////////////////

export const MarketSignalSchema = z.object({
  signalType: MarketSignalTypeSchema,
  strength: SignalStrengthSchema,
  trend: TrendDirectionSchema.nullish(),
  id: z.string().uuid(),
  marketResearchId: z.string(),
  title: z.string(),
  description: z.string(),
  source: z.string().nullish(),
  confidence: z.number().nullish(),
  marketImpact: z.string().nullish(),
  competitiveImpact: z.string().nullish(),
  timing: z.string().nullish(),
  isMonitored: z.boolean(),
  lastChecked: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type MarketSignal = z.infer<typeof MarketSignalSchema>

// MARKET SIGNAL OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketSignalOptionalDefaultsSchema = MarketSignalSchema.merge(z.object({
  id: z.string().uuid().optional(),
  isMonitored: z.boolean().optional(),
  lastChecked: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MarketSignalOptionalDefaults = z.infer<typeof MarketSignalOptionalDefaultsSchema>

/////////////////////////////////////////
// VALIDATION SCORECARD SCHEMA
/////////////////////////////////////////

export const ValidationScorecardSchema = z.object({
  validationStatus: ValidationStatusSchema,
  id: z.string().uuid(),
  marketResearchId: z.string(),
  marketScore: z.number().nullish(),
  competitiveScore: z.number().nullish(),
  technicalScore: z.number().nullish(),
  financialScore: z.number().nullish(),
  riskScore: z.number().nullish(),
  weightedScore: z.number().nullish(),
  primaryRecommendation: z.string().nullish(),
  secondaryRecommendations: z.string().array(),
  riskMitigationStrategies: z.string().array(),
  nextReviewDate: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ValidationScorecard = z.infer<typeof ValidationScorecardSchema>

// VALIDATION SCORECARD OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ValidationScorecardOptionalDefaultsSchema = ValidationScorecardSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ValidationScorecardOptionalDefaults = z.infer<typeof ValidationScorecardOptionalDefaultsSchema>

/////////////////////////////////////////
// VALIDATION SCORE BREAKDOWN SCHEMA
/////////////////////////////////////////

export const ValidationScoreBreakdownSchema = z.object({
  id: z.string().uuid(),
  validationScorecardId: z.string(),
  category: z.string(),
  score: z.number(),
  weight: z.number(),
  weightedScore: z.number(),
  reasoning: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type ValidationScoreBreakdown = z.infer<typeof ValidationScoreBreakdownSchema>

// VALIDATION SCORE BREAKDOWN OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ValidationScoreBreakdownOptionalDefaultsSchema = ValidationScoreBreakdownSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type ValidationScoreBreakdownOptionalDefaults = z.infer<typeof ValidationScoreBreakdownOptionalDefaultsSchema>

/////////////////////////////////////////
// TECHNOLOGY ASSESSMENT SCHEMA
/////////////////////////////////////////

export const TechnologyAssessmentSchema = z.object({
  technicalComplexity: TechnicalComplexitySchema,
  id: z.string().uuid(),
  marketResearchId: z.string(),
  developmentTimeline: z.number().int().nullish(),
  teamRequirements: z.string().array(),
  recommendedStack: z.string().array(),
  alternativeStacks: z.string().array(),
  integrationRequirements: z.string().array(),
  technicalRisks: z.string().array(),
  scalabilityChallenges: z.string().array(),
  securityConsiderations: z.string().array(),
  developmentCosts: z.number().nullish(),
  infrastructureCosts: z.number().nullish(),
  maintenanceCosts: z.number().nullish(),
  technicalAdvantages: z.string().array(),
  innovationPotential: z.string().nullish(),
  createdAt: z.coerce.date(),
})

export type TechnologyAssessment = z.infer<typeof TechnologyAssessmentSchema>

// TECHNOLOGY ASSESSMENT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TechnologyAssessmentOptionalDefaultsSchema = TechnologyAssessmentSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type TechnologyAssessmentOptionalDefaults = z.infer<typeof TechnologyAssessmentOptionalDefaultsSchema>

/////////////////////////////////////////
// FINANCIAL PROJECTION SCHEMA
/////////////////////////////////////////

export const FinancialProjectionSchema = z.object({
  id: z.string().uuid(),
  marketResearchId: z.string(),
  projectedRevenue: z.number().nullish(),
  revenueGrowthRate: z.number().nullish(),
  breakEvenPoint: z.number().int().nullish(),
  developmentCosts: z.number().nullish(),
  marketingCosts: z.number().nullish(),
  operationalCosts: z.number().nullish(),
  customerAcquisitionCost: z.number().nullish(),
  averageRevenuePerUser: z.number().nullish(),
  customerLifetimeValue: z.number().nullish(),
  paybackPeriod: z.number().int().nullish(),
  fundingNeeded: z.number().nullish(),
  riskFactors: z.string().array(),
  mitigationStrategies: z.string().array(),
  optimisticScenario: z.number().nullish(),
  realisticScenario: z.number().nullish(),
  pessimisticScenario: z.number().nullish(),
  createdAt: z.coerce.date(),
})

export type FinancialProjection = z.infer<typeof FinancialProjectionSchema>

// FINANCIAL PROJECTION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FinancialProjectionOptionalDefaultsSchema = FinancialProjectionSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type FinancialProjectionOptionalDefaults = z.infer<typeof FinancialProjectionOptionalDefaultsSchema>

/////////////////////////////////////////
// FUNDING ROUND SCHEMA
/////////////////////////////////////////

export const FundingRoundSchema = z.object({
  investorType: InvestorTypeSchema,
  id: z.string().uuid(),
  financialProjectionId: z.string(),
  roundName: z.string(),
  amount: z.number(),
  equity: z.number().nullish(),
  valuation: z.number().nullish(),
  timeline: z.number().int().nullish(),
  investorName: z.string().nullish(),
  developmentAllocation: z.number().nullish(),
  marketingAllocation: z.number().nullish(),
  operationsAllocation: z.number().nullish(),
  createdAt: z.coerce.date(),
})

export type FundingRound = z.infer<typeof FundingRoundSchema>

// FUNDING ROUND OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FundingRoundOptionalDefaultsSchema = FundingRoundSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type FundingRoundOptionalDefaults = z.infer<typeof FundingRoundOptionalDefaultsSchema>

/////////////////////////////////////////
// REGULATORY COMPLIANCE SCHEMA
/////////////////////////////////////////

export const RegulatoryComplianceSchema = z.object({
  complianceLevel: ComplianceLevelSchema,
  riskLevel: RiskLevelSchema,
  id: z.string().uuid(),
  marketResearchId: z.string(),
  applicableRegulations: z.string().array(),
  industryStandards: z.string().array(),
  certificationRequirements: z.string().array(),
  targetMarkets: z.string().array(),
  localRegulations: z.string().array(),
  complianceCosts: z.number().nullish(),
  timelineToCompliance: z.number().int().nullish(),
  requiredResources: z.string().array(),
  complianceRisks: z.string().array(),
  mitigationStrategies: z.string().array(),
  createdAt: z.coerce.date(),
})

export type RegulatoryCompliance = z.infer<typeof RegulatoryComplianceSchema>

// REGULATORY COMPLIANCE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const RegulatoryComplianceOptionalDefaultsSchema = RegulatoryComplianceSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type RegulatoryComplianceOptionalDefaults = z.infer<typeof RegulatoryComplianceOptionalDefaultsSchema>

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
