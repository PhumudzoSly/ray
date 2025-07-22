export const queryKeys = {
  // Waitlist keys
  waitlist: (id: string) => ["waitlist", id] as const,
  waitlistEntries: (waitlistId: string) =>
    ["waitlistEntries", waitlistId] as const,
  waitlistAnalytics: (waitlistId: string) =>
    ["waitlistAnalytics", waitlistId] as const,
  filteredWaitlistEntries: (
    waitlistId: string,
    search?: string,
    status?: string,
    limit?: number,
    offset?: number
  ) =>
    [
      "filteredWaitlistEntries",
      waitlistId,
      search,
      status,
      limit,
      offset,
    ] as const,

  // All waitlists
  waitlists: () => ["waitlists"] as const,
} as const;
