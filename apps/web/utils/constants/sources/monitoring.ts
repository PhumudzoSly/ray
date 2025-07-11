export interface MonitoringProvider {
  name: string;
  description: string;
  features: string[];
  link: string;
  pricing: 'free' | 'freemium' | 'paid';
  monitoringTypes: string[];
  platforms: ('web' | 'mobile' | 'both')[];
}

export const MONITORING_PROVIDERS: MonitoringProvider[] = [
  {
    name: "Sentry",
    description: "Application monitoring and error tracking software",
    features: [
      "Error tracking",
      "Performance monitoring",
      "Release tracking",
      "User feedback",
      "Alerts",
      "Integrations"
    ],
    link: "https://sentry.io/",
    pricing: 'freemium',
    monitoringTypes: ['Error Tracking', 'Performance', 'Release Tracking'],
    platforms: ['both']
  }
]; 