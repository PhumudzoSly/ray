export const queryKeys = {
  // Waitlist keys
  waitlist: (id: string) => ['waitlist', id] as const,
  waitlistEntries: (waitlistId: string) => ['waitlistEntries', waitlistId] as const,
  waitlistAnalytics: (waitlistId: string) => ['waitlistAnalytics', waitlistId] as const,
  
  // All waitlists
  waitlists: () => ['waitlists'] as const,
} as const; 