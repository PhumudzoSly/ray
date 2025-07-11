export interface AuthProvider {
  name: string;
  description: string;
  features: string[];
  link: string;
  pricing: "free" | "freemium" | "paid";
  deployment: ("cloud" | "self-hosted" | "both")[];
  protocols: string[];
  platforms: ("web" | "mobile" | "both")[];
}

export const AUTH_PROVIDERS: AuthProvider[] = [
  {
    name: "In-House Authentication",
    description: "Custom-built authentication system for complete control",
    features: [
      "Full customization",
      "Complete data ownership",
      "Custom business logic",
      "No third-party dependencies",
      "Tailored security policies",
    ],
    link: "#",
    pricing: "free",
    deployment: ["both"],
    protocols: ["JWT", "Session-based", "OAuth 2.0", "OpenID Connect"],
    platforms: ["both"],
  },
  {
    name: "Auth0",
    description:
      "Universal identity platform for web, mobile, and legacy applications",
    features: [
      "Universal login",
      "Multi-factor authentication",
      "Social login",
      "Enterprise connections",
      "Anomaly detection",
      "Rules and hooks",
    ],
    link: "https://auth0.com/",
    pricing: "freemium",
    deployment: ["cloud"],
    protocols: ["OAuth 2.0", "OpenID Connect", "SAML", "WS-Federation"],
    platforms: ["both"],
  },
  {
    name: "Firebase Authentication",
    description: "Google's authentication service for web and mobile apps",
    features: [
      "Email/password auth",
      "Phone authentication",
      "Social providers",
      "Anonymous auth",
      "Custom auth",
      "Multi-factor auth",
    ],
    link: "https://firebase.google.com/products/auth",
    pricing: "freemium",
    deployment: ["cloud"],
    protocols: ["OAuth 2.0", "OpenID Connect", "Custom tokens"],
    platforms: ["both"],
  },
  {
    name: "Supabase Auth",
    description: "Open-source authentication with PostgreSQL backend",
    features: [
      "Email/password auth",
      "Magic links",
      "Social providers",
      "Row-level security",
      "JWT tokens",
      "Multi-factor auth",
    ],
    link: "https://supabase.com/auth",
    pricing: "freemium",
    deployment: ["both"],
    protocols: ["JWT", "OAuth 2.0", "OpenID Connect"],
    platforms: ["both"],
  },
  {
    name: "AWS Cognito",
    description: "Amazon's user identity and data synchronization service",
    features: [
      "User pools",
      "Identity pools",
      "Social and enterprise identity",
      "Multi-factor auth",
      "Advanced security",
      "Lambda triggers",
    ],
    link: "https://aws.amazon.com/cognito/",
    pricing: "freemium",
    deployment: ["cloud"],
    protocols: ["OAuth 2.0", "OpenID Connect", "SAML"],
    platforms: ["both"],
  },
  {
    name: "Clerk",
    description: "Complete user management platform for modern applications",
    features: [
      "Pre-built UI components",
      "Multi-factor auth",
      "Social login",
      "Organizations",
      "User management",
      "Session management",
    ],
    link: "https://clerk.com/",
    pricing: "freemium",
    deployment: ["cloud"],
    protocols: ["JWT", "OAuth 2.0", "OpenID Connect"],
    platforms: ["both"],
  },
  {
    name: "Okta",
    description: "Enterprise identity and access management platform",
    features: [
      "Single sign-on",
      "Multi-factor auth",
      "Lifecycle management",
      "API access management",
      "Advanced server access",
      "Privileged access",
    ],
    link: "https://www.okta.com/",
    pricing: "paid",
    deployment: ["cloud"],
    protocols: ["SAML", "OAuth 2.0", "OpenID Connect", "SCIM"],
    platforms: ["both"],
  },
  {
    name: "Microsoft Azure AD B2C",
    description: "Customer identity access management solution",
    features: [
      "Social and local accounts",
      "Custom policies",
      "Multi-factor auth",
      "Conditional access",
      "Identity protection",
      "B2B collaboration",
    ],
    link: "https://azure.microsoft.com/en-us/products/active-directory/external-identities/b2c/",
    pricing: "freemium",
    deployment: ["cloud"],
    protocols: ["OAuth 2.0", "OpenID Connect", "SAML"],
    platforms: ["both"],
  },
  {
    name: "Keycloak",
    description: "Open-source identity and access management solution",
    features: [
      "Single sign-on",
      "Identity brokering",
      "Social login",
      "User federation",
      "Admin console",
      "Account management",
    ],
    link: "https://www.keycloak.org/",
    pricing: "free",
    deployment: ["both"],
    protocols: ["OAuth 2.0", "OpenID Connect", "SAML"],
    platforms: ["both"],
  },
  {
    name: "Passport.js",
    description: "Simple, unobtrusive authentication middleware for Node.js",
    features: [
      "500+ authentication strategies",
      "Lightweight",
      "Modular",
      "Social providers",
      "Local authentication",
      "Custom strategies",
    ],
    link: "https://www.passportjs.org/",
    pricing: "free",
    deployment: ["self-hosted"],
    protocols: ["OAuth 2.0", "OpenID Connect", "SAML", "Local"],
    platforms: ["web"],
  },
  {
    name: "NextAuth.js",
    description: "Complete open-source authentication solution for Next.js",
    features: [
      "Built for Next.js",
      "Multiple providers",
      "JWT support",
      "Database sessions",
      "TypeScript support",
      "Security best practices",
    ],
    link: "https://next-auth.js.org/",
    pricing: "free",
    deployment: ["self-hosted"],
    protocols: ["OAuth 2.0", "OpenID Connect", "JWT"],
    platforms: ["web"],
  },
  {
    name: "Ory",
    description: "Open-source identity infrastructure for everyone",
    features: [
      "Identity management",
      "Access control",
      "OAuth2 and OpenID Connect",
      "Multi-factor auth",
      "Self-service",
      "Cloud and on-premise",
    ],
    link: "https://www.ory.sh/",
    pricing: "freemium",
    deployment: ["both"],
    protocols: ["OAuth 2.0", "OpenID Connect", "JWT"],
    platforms: ["both"],
  },
];

// Helper functions
export const getAuthByDeployment = (
  deployment: "cloud" | "self-hosted" | "both"
) => {
  return AUTH_PROVIDERS.filter(
    (provider) =>
      provider.deployment.includes(deployment) ||
      provider.deployment.includes("both")
  );
};

export const getFreeAuthProviders = () => {
  return AUTH_PROVIDERS.filter((provider) => provider.pricing === "free");
};

export const getFreemiumAuthProviders = () => {
  return AUTH_PROVIDERS.filter((provider) => provider.pricing === "freemium");
};

export const getPaidAuthProviders = () => {
  return AUTH_PROVIDERS.filter((provider) => provider.pricing === "paid");
};

export const getAuthByPlatform = (platform: "web" | "mobile" | "both") => {
  return AUTH_PROVIDERS.filter(
    (provider) =>
      provider.platforms.includes(platform) ||
      provider.platforms.includes("both")
  );
};

export const getAuthByProtocol = (protocol: string) => {
  return AUTH_PROVIDERS.filter((provider) =>
    provider.protocols.includes(protocol)
  );
};
