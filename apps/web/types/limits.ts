export interface TeamLimits {
  maxTeamMembers: number;
}

export interface ProjectLimits {
  maxProject: number;
}

export interface ClientLimits {
  maxClient: number;
}

export const TEAM_LIMITS: { [productId: string]: TeamLimits } = {
  [process.env.POLAR_STARTER_PRICING!]: {
    maxTeamMembers: 3,
  },
  [process.env.POLAR_BUSINESS_PRICING!]: {
    maxTeamMembers: 10,
  },
  [process.env.POLAR_ENTERPRICE_PRICING!]: {
    maxTeamMembers: 100, // Unlimited members
  },
};

export const PROJECTS_LIMITS: { [productId: string]: ProjectLimits } = {
  [process.env.POLAR_STARTER_PRICING!]: {
    maxProject: 3,
  },
  [process.env.POLAR_BUSINESS_PRICING!]: {
    maxProject: 10,
  },

  [process.env.POLAR_ENTERPRICE_PRICING!]: {
    maxProject: 100, // Unlimited projects
  },
};
