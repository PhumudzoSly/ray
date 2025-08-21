export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'developer-tools' | 'productivity' | 'browser-tools';
  icon: string;
  website: string;
  isActive?: boolean;
  hasModal: boolean;
  modalType?: 'oauth' | 'api-key' | 'custom';
}

export const AVAILABLE_INTEGRATIONS: IntegrationDefinition[] = [
  // Communication
  {
    id: 'resend',
    name: 'Resend',
    description: 'Email delivery service for developers with powerful APIs and analytics.',
    category: 'communication',
    icon: '📧',
    website: 'resend.com',
    hasModal: true,
    modalType: 'api-key'
  },
  {
    id: 'loops',
    name: 'Loops',
    description: 'Email marketing platform for modern SaaS companies.',
    category: 'communication',
    icon: '🔄',
    website: 'loops.so',
    hasModal: true,
    modalType: 'api-key'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Cloud-based email delivery service for transactional and marketing emails.',
    category: 'communication',
    icon: '📮',
    website: 'sendgrid.com',
    hasModal: true,
    modalType: 'api-key'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'All-in-one marketing platform for growing businesses.',
    category: 'communication',
    icon: '🐵',
    website: 'mailchimp.com',
    hasModal: true,
    modalType: 'oauth'
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    description: 'Email marketing platform built for creators and online businesses.',
    category: 'communication',
    icon: '✉️',
    website: 'convertkit.com',
    hasModal: true,
    modalType: 'api-key'
  },
  
  // Developer Tools
  {
    id: 'github',
    name: 'GitHub',
    description: 'Version control and collaboration platform for developers.',
    category: 'developer-tools',
    icon: '🐙',
    website: 'github.com',
    hasModal: true,
    modalType: 'oauth'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Platform for frontend frameworks and static sites.',
    category: 'developer-tools',
    icon: '▲',
    website: 'vercel.com',
    hasModal: true,
    modalType: 'api-key'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Online payment processing for internet businesses.',
    category: 'developer-tools',
    icon: '💳',
    website: 'stripe.com',
    hasModal: true,
    modalType: 'api-key'
  },
  
  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes, docs, and collaboration.',
    category: 'productivity',
    icon: '📝',
    website: 'notion.so',
    hasModal: true,
    modalType: 'oauth'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Business communication platform for teams.',
    category: 'productivity',
    icon: '💬',
    website: 'slack.com',
    hasModal: true,
    modalType: 'oauth'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Voice, video, and text communication service.',
    category: 'productivity',
    icon: '🎮',
    website: 'discord.com',
    hasModal: true,
    modalType: 'oauth'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automation platform that connects your apps and services.',
    category: 'productivity',
    icon: '⚡',
    website: 'zapier.com',
    hasModal: true,
    modalType: 'api-key'
  },
  
  // Browser Tools
  {
    id: 'chrome-extension',
    name: 'Chrome Extension',
    description: 'Browser extension for enhanced productivity and workflow.',
    category: 'browser-tools',
    icon: '🌐',
    website: 'chrome.google.com',
    hasModal: true,
    modalType: 'custom'
  },
  {
    id: 'firefox-addon',
    name: 'Firefox Add-on',
    description: 'Firefox browser extension for enhanced functionality.',
    category: 'browser-tools',
    icon: '🦊',
    website: 'addons.mozilla.org',
    hasModal: true,
    modalType: 'custom'
  }
];

export const INTEGRATION_CATEGORIES = {
  'communication': {
    name: 'Communication',
    description: 'Email marketing, messaging, and communication tools'
  },
  'developer-tools': {
    name: 'Developer Tools',
    description: 'Development, deployment, and version control platforms'
  },
  'productivity': {
    name: 'Productivity',
    description: 'Collaboration, project management, and productivity apps'
  },
  'browser-tools': {
    name: 'Browser Tools',
    description: 'Browser extensions and web-based utilities'
  }
} as const;

export function getIntegrationById(id: string): IntegrationDefinition | undefined {
  return AVAILABLE_INTEGRATIONS.find(integration => integration.id === id);
}

export function getIntegrationsByCategory(category: keyof typeof INTEGRATION_CATEGORIES): IntegrationDefinition[] {
  return AVAILABLE_INTEGRATIONS.filter(integration => integration.category === category);
}