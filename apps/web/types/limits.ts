export interface TeamLimits {
  maxTeamMembers: number;
}

export interface ProjectLimits {
  maxProject: number;
}

export interface ClientLimits {
  maxClient: number;
}

export interface AILimits {
  maxValidations: number;
}

export interface APILimits {
  maxCalls: number;
}

export interface AllLimits {
  maxTeamMembers: number;
  maxProject: number;
  maxValidations: number;
  maxCalls: number;
}

export const TEAM_LIMITS: { [productId: string]: TeamLimits } = {
  [process.env.POLAR_STARTER_PRICING!]: {
    maxTeamMembers: 2,
  },
  [process.env.POLAR_BUSINESS_PRICING!]: {
    maxTeamMembers: 10,
  },
  [process.env.POLAR_ENTERPRICE_PRICING!]: {
    maxTeamMembers: 50,
  },
};

export const PROJECTS_LIMITS: { [productId: string]: ProjectLimits } = {
  [process.env.POLAR_STARTER_PRICING!]: {
    maxProject: 3,
  },
  [process.env.POLAR_BUSINESS_PRICING!]: {
    maxProject: 25,
  },
  [process.env.POLAR_ENTERPRICE_PRICING!]: {
    maxProject: 100,
  },
};

export const AI_LIMITS: { [productId: string]: AILimits } = {
  [process.env.POLAR_STARTER_PRICING!]: {
    maxValidations: 3,
  },
  [process.env.POLAR_BUSINESS_PRICING!]: {
    maxValidations: 8,
  },
  [process.env.POLAR_ENTERPRICE_PRICING!]: {
    maxValidations: 15,
  },
};

export const API_LIMITS: { [productId: string]: APILimits } = {
  [process.env.POLAR_STARTER_PRICING!]: {
    maxCalls: 10000, // 10K API calls/month
  },
  [process.env.POLAR_BUSINESS_PRICING!]: {
    maxCalls: 100000, // 100K API calls/month
  },
  [process.env.POLAR_ENTERPRICE_PRICING!]: {
    maxCalls: 1000000, // 1M API calls/month
  },
};

// Combined limits for easy access
export const ALL_LIMITS: { [productId: string]: AllLimits } = {
  [process.env.POLAR_STARTER_PRICING!]: {
    maxTeamMembers: 2,
    maxProject: 3,
    maxValidations: 3,
    maxCalls: 10000,
  },
  [process.env.POLAR_BUSINESS_PRICING!]: {
    maxTeamMembers: 10,
    maxProject: 25,
    maxValidations: 8,
    maxCalls: 100000,
  },
  [process.env.POLAR_ENTERPRICE_PRICING!]: {
    maxTeamMembers: 50,
    maxProject: 100,
    maxValidations: 15,
    maxCalls: 1000000,
  },
};
