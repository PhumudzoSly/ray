import { z } from 'zod';
import type { Prisma } from '../client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


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

export const AssetScalarFieldEnumSchema = z.enum(['id','name','description','type','projectId','organizationId','storageId','fileName','fileSize','mimeType','url','linkType','tags','category','thumbnailUrl','isPublic','uploadedById','createdAt','updatedAt','viewCount','downloadCount']);

export const ApiKeyScalarFieldEnumSchema = z.enum(['id','organizationId','name','keyHash','keyPreview','createdBy','createdAt','lastUsed','isActive','expiresAt']);

export const ActivityFeedScalarFieldEnumSchema = z.enum(['id','type','title','description','entityType','entityId','organizationId','userId','oldValue','newValue','createdAt','updatedAt']);

export const PublicRoadmapScalarFieldEnumSchema = z.enum(['id','projectId','name','slug','description','isPublic','customDomain','theme','logoUrl','accentColor','allowVoting','allowFeedback','showChangelog','createdAt','updatedAt']);

export const RoadmapItemScalarFieldEnumSchema = z.enum(['id','roadmapId','issueId','nodeId','title','description','status','category','isPublic','priority','targetDate','order','voteCount','feedbackCount','createdAt','updatedAt']);

export const RoadmapVoteScalarFieldEnumSchema = z.enum(['id','roadmapItemId','userId','ipAddress','createdAt']);

export const RoadmapFeedbackScalarFieldEnumSchema = z.enum(['id','roadmapItemId','userId','ipAddress','content','sentiment','isApproved','convertedToFeatureId','convertedToIssueId','convertedAt','convertedBy','conversionNotes','createdAt']);

export const RoadmapChangelogScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','fixes','newFeatures','publishDate','isPublished','createdAt','updatedAt']);

export const FeatureRequestScalarFieldEnumSchema = z.enum(['id','roadmapId','title','description','category','email','name','ipAddress','status','priority','upvotes','isPublic','adminNotes','createdAt','updatedAt']);

export const WaitlistScalarFieldEnumSchema = z.enum(['id','projectId','name','slug','description','isPublic','allowNameCapture','showPosition','showSocialProof','customMessage','organizationId','createdAt','updatedAt','createdById']);

export const WaitlistEntryScalarFieldEnumSchema = z.enum(['id','waitlistId','email','name','status','position','referralCode','referredBy','referralCount','verificationToken','verifiedAt','invitedAt','joinedAt','ipAddress','userAgent','utmSource','utmMedium','utmCampaign','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const ActivityTypeSchema = z.enum(['CREATED','UPDATED','PHASE_CHANGED','ASSIGNED','UNASSIGNED','DEPENDENCY_ADDED','DEPENDENCY_REMOVED','LINK_ADDED','LINK_REMOVED','PARENT_CHANGED']);

export type ActivityTypeType = `${z.infer<typeof ActivityTypeSchema>}`

export const EntityTypeSchema = z.enum(['PROJECT','FEATURE','ISSUE','IDEA','ROADMAP','MILESTONE']);

export type EntityTypeType = `${z.infer<typeof EntityTypeSchema>}`

export const IdeaStatusSchema = z.enum(['INVALIDATED','VALIDATED','FAILED','IN_PROGRESS','LAUNCHED']);

export type IdeaStatusType = `${z.infer<typeof IdeaStatusSchema>}`

export const ImportanceSchema = z.enum(['CRITICAL','HIGH','MEDIUM','LOW']);

export type ImportanceType = `${z.infer<typeof ImportanceSchema>}`

export const CategorySchema = z.enum(['PRODUCT','MARKETING','FINANCIAL','LEGAL','OTHER']);

export type CategoryType = `${z.infer<typeof CategorySchema>}`

export const FinancialResourcesSchema = z.enum(['LIMITED','ADEQUATE','ABUNDANT']);

export type FinancialResourcesType = `${z.infer<typeof FinancialResourcesSchema>}`

export const ProjectPlatformSchema = z.enum(['web','mobile','both','api','plugin','desktop','cli']);

export type ProjectPlatformType = `${z.infer<typeof ProjectPlatformSchema>}`

export const ProjectStatusSchema = z.enum(['planning','in_progress','review','completed']);

export type ProjectStatusType = `${z.infer<typeof ProjectStatusSchema>}`

export const IssueStatusSchema = z.enum(['BACKLOG','IN_PROGRESS','REVIEW','DONE','BLOCKED','CANCELLED']);

export type IssueStatusType = `${z.infer<typeof IssueStatusSchema>}`

export const IssueLabelSchema = z.enum(['UI','BUG','FEATURE','DOCUMENTATION','REFACTOR','PERFORMANCE','DESIGN','SECURITY','ACCESSIBILITY','TESTING','INTERNATIONALIZATION']);

export type IssueLabelType = `${z.infer<typeof IssueLabelSchema>}`

export const AssetTypeSchema = z.enum(['image','document','video','link','code','design','other']);

export type AssetTypeType = `${z.infer<typeof AssetTypeSchema>}`

export const LinkTypeSchema = z.enum(['youtube','figma','notion','github','dribbble','behance','external']);

export type LinkTypeType = `${z.infer<typeof LinkTypeSchema>}`

export const AssetCategorySchema = z.enum(['branding','ui_design','mockups','documentation','inspiration','code_snippets','presentations','tutorials','other']);

export type AssetCategoryType = `${z.infer<typeof AssetCategorySchema>}`

export const PrdStatusSchema = z.enum(['draft','approved','archived']);

export type PrdStatusType = `${z.infer<typeof PrdStatusSchema>}`

export const ImplementationPromptCategorySchema = z.enum(['implementation','testing','documentation','debugging','optimization','deployment']);

export type ImplementationPromptCategoryType = `${z.infer<typeof ImplementationPromptCategorySchema>}`

export const AnalysisReportTypeSchema = z.enum(['flow_analysis','missing_flows','recommendations']);

export type AnalysisReportTypeType = `${z.infer<typeof AnalysisReportTypeSchema>}`

export const NotificationDigestFrequencySchema = z.enum(['IMMEDIATE','HOURLY','DAILY','WEEKLY','NEVER']);

export type NotificationDigestFrequencyType = `${z.infer<typeof NotificationDigestFrequencySchema>}`

export const RoadmapFeedbackSentimentSchema = z.enum(['positive','neutral','negative']);

export type RoadmapFeedbackSentimentType = `${z.infer<typeof RoadmapFeedbackSentimentSchema>}`

export const FeatureRequestStatusSchema = z.enum(['pending','under_review','approved','rejected','implemented']);

export type FeatureRequestStatusType = `${z.infer<typeof FeatureRequestStatusSchema>}`

export const FeatureRequestPrioritySchema = z.enum(['low','medium','high','urgent']);

export type FeatureRequestPriorityType = `${z.infer<typeof FeatureRequestPrioritySchema>}`

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
  viewCount: z.number().int().nullish(),
  downloadCount: z.number().int().nullish(),
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
  id: z.string().uuid(),
  roadmapId: z.string(),
  issueId: z.string().nullish(),
  nodeId: z.string().nullish(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  category: z.string(),
  isPublic: z.boolean(),
  priority: z.string(),
  targetDate: z.coerce.date().nullish(),
  order: z.number().int(),
  voteCount: z.number().int(),
  feedbackCount: z.number().int(),
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
  upvotes: z.number().int(),
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
  referralCount: z.number().int(),
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
