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

export interface IdeasLimits {
  maxIdeas: number;
}

export interface APILimits {
  maxCalls: number;
}

export interface AllLimits {
  maxTeamMembers: number;
  maxProject: number;
  maxValidations: number;
  maxIdeas: number;
  maxCalls: number;
}

export const TEAM_LIMITS: { [productId: string]: TeamLimits } = {
  [process.env.DODO_STARTER_PLAN!]: {
    maxTeamMembers: 1,
  },
  [process.env.DODO_PRO_PLAN!]: {
    maxTeamMembers: 5,
  },
  [process.env.DODO_ENTERPRISE_PLAN!]: {
    maxTeamMembers: 50,
  },
};

export const PROJECTS_LIMITS: { [productId: string]: ProjectLimits } = {
  [process.env.DODO_STARTER_PLAN!]: {
    maxProject: 5,
  },
  [process.env.DODO_PRO_PLAN!]: {
    maxProject: 25,
  },
  [process.env.DODO_ENTERPRISE_PLAN!]: {
    maxProject: 150,
  },
};

export const AI_LIMITS: { [productId: string]: AILimits } = {
  [process.env.DODO_STARTER_PLAN!]: {
    maxValidations: 3,
  },
  [process.env.DODO_PRO_PLAN!]: {
    maxValidations: 8,
  },
  [process.env.DODO_ENTERPRISE_PLAN!]: {
    maxValidations: 15,
  },
};

export const IDEAS_LIMITS: { [productId: string]: IdeasLimits } = {
  [process.env.DODO_STARTER_PLAN!]: {
    maxIdeas: 3,
  },
  [process.env.DODO_PRO_PLAN!]: {
    maxIdeas: 10,
  },
  [process.env.DODO_ENTERPRISE_PLAN!]: {
    maxIdeas: 50,
  },
};

export const API_LIMITS: { [productId: string]: APILimits } = {
  [process.env.DODO_STARTER_PLAN!]: {
    maxCalls: 10000, // 10K API calls/month
  },
  [process.env.DODO_PRO_PLAN!]: {
    maxCalls: 100000, // 100K API calls/month
  },
  [process.env.DODO_ENTERPRISE_PLAN!]: {
    maxCalls: 1000000, // 1M API calls/month
  },
};

// Combined limits for easy access
export const ALL_LIMITS: { [productId: string]: AllLimits } = {
  [process.env.DODO_STARTER_PLAN!]: {
    maxTeamMembers: 1,
    maxProject: 5,
    maxValidations: 3,
    maxIdeas: 2,
    maxCalls: 10000,
  },
  [process.env.DODO_PRO_PLAN!]: {
    maxTeamMembers: 5,
    maxProject: 25,
    maxValidations: 8,
    maxIdeas: 5,
    maxCalls: 100000,
  },
  [process.env.DODO_ENTERPRISE_PLAN!]: {
    maxTeamMembers: 50,
    maxProject: 50,
    maxValidations: 15,
    maxIdeas: 10,
    maxCalls: 1000000,
  },
};
