import { StandardNode } from "./StandardNode";
import { ConditionalNode } from "./ConditionalNode";
import { StartNode } from "./StartNode";
import { EndNode } from "./EndNode";
import { BooleanNode } from "./BooleanNode";
import { FlowNodeRouter } from "./FlowNodeRouter";

// Import specialized node components
import { AuthNode } from "./AuthNode";
import { ApiNode } from "./ApiNode";
import { DatabaseNode } from "./DatabaseNode";
import { PaymentNode } from "./PaymentNode";
import { NotificationNode } from "./NotificationNode";
import { EmailNode } from "./EmailNode";
import { OnboardingNode } from "./OnboardingNode";
import { FeatureNode } from "./FeatureNode";
import { AnalyticsNode } from "./AnalyticsNode";
import { IntegrationNode } from "./IntegrationNode";
import { SecurityNode } from "./SecurityNode";
import { StorageNode } from "./StorageNode";
import { SmsNode } from "./SmsNode";

// Node type map for React Flow
export const nodeTypeComponents = {
  default: StandardNode,
  conditional: ConditionalNode,
  start: StartNode,
  end: EndNode,
  boolean: BooleanNode,
  flowNode: FlowNodeRouter, // This handles the FlowNode type and routes to appropriate components

  // Specialized node components
  auth: AuthNode,
  api: ApiNode,
  database: DatabaseNode,
  payment: PaymentNode,
  notification: NotificationNode,
  email: EmailNode,
  onboarding: OnboardingNode,
  feature: FeatureNode,
  analytics: AnalyticsNode,
  integration: IntegrationNode,
  security: SecurityNode,
  storage: StorageNode,
  sms: SmsNode,

  // Remaining nodes using StandardNode as fallback until specialized components are created
  feedback: StandardNode,
  error: StandardNode,
  settings: StandardNode,
  permissions: StandardNode,
  caching: StandardNode,
  search: StandardNode,
  group: StandardNode,
  custom: StandardNode,
  stickyNote: StandardNode,
} as const;
