export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  category: "communication" | "developer-tools" | "productivity";
  website: string;
  isActive?: boolean;
  hasModal: boolean;
  modalType?: "oauth" | "api-key" | "custom";
}

export const AVAILABLE_INTEGRATIONS: IntegrationDefinition[] = [
  // Communication
  {
    id: "resend",
    name: "Resend",
    description:
      "Email delivery service for developers with powerful APIs and analytics.",
    category: "communication",
    website: "resend.com",
    hasModal: true,
    modalType: "api-key",
  },
  {
    id: "loops",
    name: "Loops",
    description: "Email marketing platform for modern SaaS companies.",
    category: "communication",
    website: "loops.so",
    hasModal: true,
    modalType: "api-key",
  },
];

export const INTEGRATION_CATEGORIES = {
  communication: {
    name: "Communication",
    description: "Email marketing, messaging, and communication tools",
  },
  "developer-tools": {
    name: "Developer Tools",
    description: "Development, deployment, and version control platforms",
  },
  productivity: {
    name: "Productivity",
    description: "Collaboration, project management, and productivity apps",
  },
} as const;

export function getIntegrationById(
  id: string
): IntegrationDefinition | undefined {
  return AVAILABLE_INTEGRATIONS.find((integration) => integration.id === id);
}

export function getIntegrationsByCategory(
  category: keyof typeof INTEGRATION_CATEGORIES
): IntegrationDefinition[] {
  return AVAILABLE_INTEGRATIONS.filter(
    (integration) => integration.category === category
  );
}
