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

export const ApiKeyScalarFieldEnumSchema = z.enum(['id','organizationId','name','keyHash','keyPreview','permissions','createdBy','createdAt','lastUsed','isActive','expiresAt']);

export const ActivityFeedScalarFieldEnumSchema = z.enum(['id','type','title','description','entityType','entityId','organizationId','userId','oldValue','newValue','createdAt','updatedAt']);

export const PublicRoadmapScalarFieldEnumSchema = z.enum(['id','projectId','name','slug','description','isPublic','allowVoting','allowFeedback','createdAt','updatedAt']);

export const RoadmapItemScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','status','category','isPublic','priority','targetDate','createdAt','updatedAt']);

export const RoadmapVoteScalarFieldEnumSchema = z.enum(['id','roadmapItemId','userId','ipAddress','createdAt']);

export const RoadmapFeedbackScalarFieldEnumSchema = z.enum(['id','roadmapItemId','userId','ipAddress','content','sentiment','isApproved','convertedToFeatureId','convertedToIssueId','convertedAt','convertedBy','conversionNotes','createdAt']);

export const RoadmapChangelogScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','version','publishDate','isPublished','createdAt','updatedAt','fixes','newFeatures']);

export const ChangelogEntryScalarFieldEnumSchema = z.enum(['id','changelogId','type','title','description','issueId','featureId','priority','category','breaking','createdAt']);

export const FeatureRequestScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','category','email','name','ipAddress','status','priority','isPublic','adminNotes','createdAt','updatedAt','convertedToFeatureId','convertedToIssueId','convertedToRoadmapItemId','convertedAt','convertedBy','conversionNotes']);

export const IntegrationScalarFieldEnumSchema = z.enum(['id','name','type','config','isActive','organizationId','createdAt','updatedAt','createdById']);

export const IntegrationUsageScalarFieldEnumSchema = z.enum(['id','integrationId','entityType','entityId','purpose','isActive','createdAt','updatedAt']);

export const WaitlistScalarFieldEnumSchema = z.enum(['id','projectId','name','slug','description','isPublic','allowNameCapture','showPosition','showSocialProof','customMessage','organizationId','createdAt','updatedAt','createdById']);

export const WaitlistEntryScalarFieldEnumSchema = z.enum(['id','waitlistId','email','name','status','position','referralCode','referredBy','verificationToken','verifiedAt','invitedAt','joinedAt','ipAddress','userAgent','utmSource','utmMedium','utmCampaign','createdAt','updatedAt']);

export const FeatureScalarFieldEnumSchema = z.enum(['id','name','description','projectId','phase','businessValue','estimatedEffort','startDate','endDate','priority','assignedToId','parentFeatureId','organizationId','createdAt','updatedAt','milestoneId']);

export const FeatureDependencyScalarFieldEnumSchema = z.enum(['id','organizationId','featureId','dependencyId','createdAt']);

export const FeatureLinkScalarFieldEnumSchema = z.enum(['id','organizationId','featureId','url','createdAt']);

export const MilestoneScalarFieldEnumSchema = z.enum(['id','name','description','status','startDate','endDate','createdAt','updatedAt','projectId','organizationId','ownerId']);

export const MilestoneDependencyScalarFieldEnumSchema = z.enum(['id','organizationId','milestoneId','dependencyId','createdAt']);

export const MarketResearchScalarFieldEnumSchema = z.enum(['id','ideaId','organizationId','validationScore','confidenceLevel','completed','lastUpdated','createdAt','type']);

export const ResearchResultsScalarFieldEnumSchema = z.enum(['id','organizationId','createdAt','updatedAt','content','marketResearchId']);

export const CompetitorScalarFieldEnumSchema = z.enum(['id','ideaId','name','website','description','logoUrl','marketShare','annualRevenue','employeeCount','foundedYear','headquarters','targetAudience','threatLevel','userGrowthRate','churnRate','customerSatisfaction','marketCap','lastUpdated','createdAt','isActive']);

export const CompetitiveMoveScalarFieldEnumSchema = z.enum(['id','competitorId','moveType','title','description','impactLevel','targetAudience','affectedFeatures','announcedDate','launchDate','completionDate','userFeedback','pressCoverage','opportunities','threats','responseRequired','responseStrategy','createdAt']);

export const AssetViewScalarFieldEnumSchema = z.enum(['id','assetId','organizationId','userId','ipAddress','userAgent','referrer','viewedAt']);

export const AssetDownloadScalarFieldEnumSchema = z.enum(['id','assetId','organizationId','userId','ipAddress','userAgent','referrer','downloadedAt']);

export const ReferralScalarFieldEnumSchema = z.enum(['id','referrerId','referredEmail','referredName','ipAddress','userAgent','referrerCode','waitlistId','organizationId','createdAt']);

export const ResearchSessionScalarFieldEnumSchema = z.enum(['id','ideaId','organizationId','depth','status','currentPhaseIndex','overallConfidence','estimatedCompletion','actualCompletion','totalCost','createdAt','updatedAt']);

export const ResearchPhaseResultScalarFieldEnumSchema = z.enum(['id','sessionId','phaseName','status','findings','confidence','duration','iterations','startedAt','completedAt','error','createdAt','updatedAt']);

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

export const ResearchTypeSchema = z.enum(['COMPLETE','BUSINESS_MODEL','COMPETITIVE_ANALYSIS','CUSTOMER_VALIDATION','FINANCIAL_PROJECTIONS','GO_TO_MARKET','INVESTMENT_RECOMMENDATION','MARKET_OPPORTUNITY','PRODUCT_MARKET_FIT','RISK_ANALYSIS','TECHNICAL_FEASIBILITY']);

export type ResearchTypeType = `${z.infer<typeof ResearchTypeSchema>}`

export const ApiPermissionSchema = z.enum(['READ','WRITE','DELETE','ADMIN']);

export type ApiPermissionType = `${z.infer<typeof ApiPermissionSchema>}`

export const ChangelogEntryTypeSchema = z.enum(['FEATURE','FIX','IMPROVEMENT','BREAKING','SECURITY','DEPRECATION','DOCUMENTATION','PERFORMANCE']);

export type ChangelogEntryTypeType = `${z.infer<typeof ChangelogEntryTypeSchema>}`

export const ResearchDepthSchema = z.enum(['QUICK','STANDARD','DEEP','EXHAUSTIVE']);

export type ResearchDepthType = `${z.infer<typeof ResearchDepthSchema>}`

export const ResearchStatusSchema = z.enum(['INITIALIZING','IN_PROGRESS','PAUSED','COMPLETED','FAILED']);

export type ResearchStatusType = `${z.infer<typeof ResearchStatusSchema>}`

export const ResearchPhaseTypeSchema = z.enum(['MARKET_SCAN','COMPETITIVE_OVERVIEW','COMPETITIVE_DEEP_DIVE','CUSTOMER_VALIDATION','BUSINESS_MODEL','FINANCIAL_PROJECTIONS','RISK_ANALYSIS','TECHNICAL_FEASIBILITY']);

export type ResearchPhaseTypeType = `${z.infer<typeof ResearchPhaseTypeSchema>}`

export const PhaseStatusSchema = z.enum(['PENDING','IN_PROGRESS','COMPLETED','FAILED','PAUSED']);

export type PhaseStatusType = `${z.infer<typeof PhaseStatusSchema>}`

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
  confidenceLevel: ImportanceSchema,
  type: ResearchTypeSchema,
  id: z.string().uuid(),
  ideaId: z.string(),
  organizationId: z.string(),
  validationScore: z.number().nullish(),
  completed: z.boolean(),
  lastUpdated: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type MarketResearch = z.infer<typeof MarketResearchSchema>

// MARKET RESEARCH OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MarketResearchOptionalDefaultsSchema = MarketResearchSchema.merge(z.object({
  type: ResearchTypeSchema.optional(),
  id: z.string().uuid().optional(),
  completed: z.boolean().optional(),
  lastUpdated: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type MarketResearchOptionalDefaults = z.infer<typeof MarketResearchOptionalDefaultsSchema>

/////////////////////////////////////////
// RESEARCH RESULTS SCHEMA
/////////////////////////////////////////

export const ResearchResultsSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  content: z.string(),
  marketResearchId: z.string(),
})

export type ResearchResults = z.infer<typeof ResearchResultsSchema>

// RESEARCH RESULTS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ResearchResultsOptionalDefaultsSchema = ResearchResultsSchema.merge(z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ResearchResultsOptionalDefaults = z.infer<typeof ResearchResultsOptionalDefaultsSchema>

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

/////////////////////////////////////////
// RESEARCH SESSION SCHEMA
/////////////////////////////////////////

export const ResearchSessionSchema = z.object({
  depth: ResearchDepthSchema,
  status: ResearchStatusSchema,
  id: z.string().cuid(),
  ideaId: z.string(),
  organizationId: z.string(),
  currentPhaseIndex: z.number().int(),
  overallConfidence: z.number(),
  estimatedCompletion: z.coerce.date().nullish(),
  actualCompletion: z.coerce.date().nullish(),
  totalCost: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ResearchSession = z.infer<typeof ResearchSessionSchema>

// RESEARCH SESSION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ResearchSessionOptionalDefaultsSchema = ResearchSessionSchema.merge(z.object({
  id: z.string().cuid().optional(),
  currentPhaseIndex: z.number().int().optional(),
  overallConfidence: z.number().optional(),
  totalCost: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ResearchSessionOptionalDefaults = z.infer<typeof ResearchSessionOptionalDefaultsSchema>

/////////////////////////////////////////
// RESEARCH PHASE RESULT SCHEMA
/////////////////////////////////////////

export const ResearchPhaseResultSchema = z.object({
  phaseName: ResearchPhaseTypeSchema,
  status: PhaseStatusSchema,
  id: z.string().cuid(),
  sessionId: z.string(),
  findings: JsonValueSchema,
  confidence: z.number(),
  duration: z.number().int(),
  iterations: z.number().int(),
  startedAt: z.coerce.date().nullish(),
  completedAt: z.coerce.date().nullish(),
  error: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ResearchPhaseResult = z.infer<typeof ResearchPhaseResultSchema>

// RESEARCH PHASE RESULT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ResearchPhaseResultOptionalDefaultsSchema = ResearchPhaseResultSchema.merge(z.object({
  id: z.string().cuid().optional(),
  confidence: z.number().optional(),
  duration: z.number().int().optional(),
  iterations: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ResearchPhaseResultOptionalDefaults = z.infer<typeof ResearchPhaseResultOptionalDefaultsSchema>
