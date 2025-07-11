import { NodeProps } from "reactflow";

// Base node data interface
export interface BaseNodeData {
  label: string;
  type: string;
  description?: string;
  priority: "low" | "medium" | "high";
  hasSubFlow?: boolean;
  features?: string[];
  dependencies?: string[];
  [key: string]: any;
}

// Authentication node specific data
export interface AuthNodeData extends BaseNodeData {
  type: "auth";
  authMethod: "email" | "oauth" | "magic-link" | "multi-factor";
  providers?: string[];
  sessionDuration?: number;
  twoFactorEnabled?: boolean;
  passwordPolicy?: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
  };
  redirectUrls?: {
    success: string;
    failure: string;
  };
}

// API node specific data
export interface ApiNodeData extends BaseNodeData {
  type: "api";
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  authentication?: "bearer" | "api-key" | "oauth" | "none";
  rateLimit?: {
    requests: number;
    window: number;
  };
  requestSchema?: any;
  responseSchema?: any;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: "linear" | "exponential";
  };
}

// Database node specific data
export interface DatabaseNodeData extends BaseNodeData {
  type: "database";
  operation: "create" | "read" | "update" | "delete" | "query";
  tableName?: string;
  schema?: any;
  indexing?: string[];
  relationships?: {
    type: "one-to-one" | "one-to-many" | "many-to-many";
    targetTable: string;
    foreignKey: string;
  }[];
  caching?: boolean;
  transactions?: boolean;
}

// Payment node specific data
export interface PaymentNodeData extends BaseNodeData {
  type: "payment";
  provider: "stripe" | "paypal" | "square" | "custom";
  paymentType: "one-time" | "subscription" | "marketplace";
  currency: string;
  amount?: number;
  webhookUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
  subscriptionInterval?: "monthly" | "yearly" | "weekly";
  fees?: {
    processing: number;
    platform: number;
  };
}

// Notification node specific data
export interface NotificationNodeData extends BaseNodeData {
  type: "notification";
  channels: ("email" | "sms" | "push" | "in-app")[];
  template?: string;
  priority: "low" | "medium" | "high" | "urgent";
  scheduling?: {
    immediate: boolean;
    delay?: number;
    recurring?: {
      interval: "daily" | "weekly" | "monthly";
      endDate?: string;
    };
  };
  targeting?: {
    userSegments: string[];
    conditions: any[];
  };
}

// Analytics node specific data
export interface AnalyticsNodeData extends BaseNodeData {
  type: "analytics";
  eventType: "pageview" | "click" | "conversion" | "custom";
  trackingId?: string;
  customProperties?: Record<string, any>;
  goals?: {
    name: string;
    target: number;
    metric: string;
  }[];
  dashboard?: {
    widgets: string[];
    refreshInterval: number;
  };
}

// Integration node specific data
export interface IntegrationNodeData extends BaseNodeData {
  type: "integration";
  service: string;
  apiVersion?: string;
  credentials?: {
    type: "api-key" | "oauth" | "basic-auth";
    endpoint?: string;
  };
  mapping?: {
    inbound: Record<string, string>;
    outbound: Record<string, string>;
  };
  syncSchedule?: {
    frequency: "real-time" | "hourly" | "daily" | "weekly";
    batchSize?: number;
  };
}

// Security node specific data
export interface SecurityNodeData extends BaseNodeData {
  type: "security";
  securityType: "encryption" | "validation" | "audit" | "access-control";
  policies?: {
    name: string;
    rules: any[];
  }[];
  encryptionAlgorithm?: "AES-256" | "RSA" | "bcrypt";
  auditLevel?: "basic" | "detailed" | "comprehensive";
  complianceStandards?: ("GDPR" | "HIPAA" | "SOC2" | "PCI-DSS")[];
}

// Storage node specific data
export interface StorageNodeData extends BaseNodeData {
  type: "storage";
  storageType: "file" | "object" | "blob" | "cdn";
  provider: "aws-s3" | "gcs" | "azure" | "local" | "cloudinary";
  permissions?: {
    read: string[];
    write: string[];
    delete: string[];
  };
  encryption?: boolean;
  backup?: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    retention: number;
  };
  cdn?: {
    enabled: boolean;
    cacheControl: string;
  };
}

// Email node specific data
export interface EmailNodeData extends BaseNodeData {
  type: "email";
  provider: "sendgrid" | "mailgun" | "ses" | "resend" | "custom";
  template?: {
    id: string;
    variables: Record<string, any>;
  };
  recipients?: {
    to: string[];
    cc?: string[];
    bcc?: string[];
  };
  scheduling?: {
    sendAt?: string;
    timezone?: string;
  };
  tracking?: {
    opens: boolean;
    clicks: boolean;
    bounces: boolean;
  };
}

// SMS node specific data
export interface SmsNodeData extends BaseNodeData {
  type: "sms";
  provider: "twilio" | "vonage" | "aws-sns" | "custom";
  message: string;
  recipients: string[];
  scheduling?: {
    sendAt?: string;
    timezone?: string;
  };
  deliveryReceipts?: boolean;
  shortLinks?: boolean;
}

// Group node specific data
export interface GroupNodeData extends BaseNodeData {
  type: "group";
  groupType: "container" | "workflow" | "template";
  collapsed?: boolean;
  childNodes?: string[];
  layout?: "vertical" | "horizontal" | "grid";
  styling?: {
    backgroundColor?: string;
    borderColor?: string;
    borderStyle?: "solid" | "dashed" | "dotted";
  };
}

// Onboarding node specific data
export interface OnboardingNodeData extends BaseNodeData {
  type: "onboarding";
  steps: {
    id: string;
    title: string;
    description: string;
    required: boolean;
    completed?: boolean;
  }[];
  currentStep?: number;
  skipEnabled?: boolean;
  progressTracking?: boolean;
  completionActions?: {
    redirect?: string;
    webhook?: string;
    email?: boolean;
  };
}

// Feature node specific data
export interface FeatureNodeData extends BaseNodeData {
  type: "feature";
  featureType: "core" | "premium" | "experimental" | "deprecated";
  permissions?: string[];
  featureFlags?: {
    enabled: boolean;
    rolloutPercentage?: number;
    targetUsers?: string[];
  };
  dependencies?: string[];
  apiEndpoints?: string[];
  uiComponents?: string[];
}

// Custom node specific data
export interface CustomNodeData extends BaseNodeData {
  type: "custom";
  customType: string;
  configuration?: Record<string, any>;
  handlers?: {
    onExecute?: string;
    onValidate?: string;
    onError?: string;
  };
  dynamicInputs?: {
    name: string;
    type: "string" | "number" | "boolean" | "object";
    required: boolean;
  }[];
  dynamicOutputs?: {
    name: string;
    type: "string" | "number" | "boolean" | "object";
  }[];
}

// Additional specialized node types
export interface FeedbackNodeData extends BaseNodeData {
  type: "feedback";
  feedbackType: "rating" | "survey" | "comment" | "bug-report";
  rating?: {
    scale: number;
    labels?: string[];
  };
  questions?: {
    id: string;
    text: string;
    type: "text" | "multiple-choice" | "checkbox" | "scale";
    required: boolean;
    options?: string[];
  }[];
  anonymousAllowed?: boolean;
  followUpActions?: {
    threshold?: number;
    actions: string[];
  };
}

export interface ErrorNodeData extends BaseNodeData {
  type: "error";
  errorType: "validation" | "system" | "network" | "user";
  errorCode?: string;
  severity: "low" | "medium" | "high" | "critical";
  handling?: {
    retry: boolean;
    maxRetries?: number;
    fallback?: string;
    logging: boolean;
    alerting: boolean;
  };
  userMessage?: string;
  technicalMessage?: string;
}

export interface SettingsNodeData extends BaseNodeData {
  type: "settings";
  settingsType: "user" | "system" | "application" | "organization";
  categories?: {
    name: string;
    settings: {
      key: string;
      label: string;
      type: "string" | "number" | "boolean" | "select" | "multi-select";
      defaultValue: any;
      options?: any[];
      validation?: any;
    }[];
  }[];
  permissions?: {
    read: string[];
    write: string[];
  };
}

export interface PermissionsNodeData extends BaseNodeData {
  type: "permissions";
  permissionType: "role-based" | "attribute-based" | "resource-based";
  roles?: {
    name: string;
    permissions: string[];
    hierarchy?: number;
  }[];
  resources?: {
    name: string;
    actions: string[];
  }[];
  policies?: {
    name: string;
    conditions: any[];
    effect: "allow" | "deny";
  }[];
}

export interface CachingNodeData extends BaseNodeData {
  type: "caching";
  cacheType: "memory" | "redis" | "memcached" | "cdn";
  strategy: "write-through" | "write-behind" | "write-around" | "cache-aside";
  ttl?: number;
  maxSize?: number;
  evictionPolicy?: "lru" | "lfu" | "fifo" | "random";
  keyPattern?: string;
  compression?: boolean;
}

export interface SearchNodeData extends BaseNodeData {
  type: "search";
  searchType: "full-text" | "faceted" | "semantic" | "fuzzy";
  indexing?: {
    fields: string[];
    analyzer?: string;
    boost?: Record<string, number>;
  };
  filters?: {
    name: string;
    type: "range" | "term" | "match" | "bool";
    field: string;
  }[];
  sorting?: {
    field: string;
    direction: "asc" | "desc";
  }[];
  pagination?: {
    size: number;
    maxSize: number;
  };
}

export interface StickyNoteNodeData extends BaseNodeData {
  type: "stickyNote";
  content: string;
  color?: "yellow" | "blue" | "green" | "pink" | "purple" | "orange";
  size?: "small" | "medium" | "large";
  author?: string;
  createdAt?: string;
  tags?: string[];
  attachments?: {
    type: "link" | "file" | "image";
    url: string;
    name: string;
  }[];
}

// Union type for all node data types
export type SpecializedNodeData =
  | AuthNodeData
  | ApiNodeData
  | DatabaseNodeData
  | PaymentNodeData
  | NotificationNodeData
  | AnalyticsNodeData
  | IntegrationNodeData
  | SecurityNodeData
  | StorageNodeData
  | EmailNodeData
  | SmsNodeData
  | GroupNodeData
  | OnboardingNodeData
  | FeatureNodeData
  | CustomNodeData
  | FeedbackNodeData
  | ErrorNodeData
  | SettingsNodeData
  | PermissionsNodeData
  | CachingNodeData
  | SearchNodeData
  | StickyNoteNodeData;

// Base props for all specialized nodes
export interface SpecializedNodeProps<T extends BaseNodeData = BaseNodeData>
  extends NodeProps<T> {
  onDataChange?: (data: Partial<T>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onNavigateToSubFlow?: () => void;
  isReadOnly?: boolean;
  theme?: "light" | "dark";
}

// Handle configuration interface
export interface HandleConfig {
  id: string;
  type: "source" | "target";
  position: "top" | "bottom" | "left" | "right";
  style?: React.CSSProperties;
  className?: string;
  isConnectable?: boolean;
  maxConnections?: number;
  label?: string;
  validation?: (connection: any) => boolean;
}

// Node behavior interface
export interface NodeBehavior {
  onConnect?: (params: any) => void;
  onDisconnect?: (params: any) => void;
  onValidate?: (data: any) => { isValid: boolean; errors: string[] };
  onExecute?: (data: any) => Promise<any>;
  onPreview?: (data: any) => React.ReactNode;
}
