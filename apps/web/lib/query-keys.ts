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
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    // Legacy support
    limit?: number,
    offset?: number
  ) =>
    [
      "filteredWaitlistEntries",
      waitlistId,
      search,
      status,
      page,
      pageSize,
      sortBy,
      sortOrder,
      limit,
      offset,
    ] as const,

  // All waitlists
  waitlists: () => ["waitlists"] as const,

  // Documents keys
  documents: {
    entity: (entityType?: string, entityId?: string) =>
      ["documents", entityType, entityId] as const,
  },
} as const;
