export const CREDIT_PACKS = [
  {
    amount: 100,
    price: 10,
    name: "Starter Pack",
    description: "Perfect for trying out the platform",
    popular: false,
  },
  {
    amount: 500,
    price: 40,
    name: "Pro Pack",
    description: "Most popular for active users",
    popular: true,
  },
  {
    amount: 2000,
    price: 120,
    name: "Team Pack",
    description: "Best value for teams",
    popular: false,
  },
] as const;

export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    interval: "month",
    description: "For individuals getting started",
    features: [
      "1 flow",
      "Basic nodes only",
      "Community support",
      "60 API calls/hour",
    ],
    limits: {
      flows: 1,
      apiCalls: 60,
      teamMembers: 1,
    },
  },
  pro: {
    name: "Pro",
    price: 20,
    interval: "month",
    description: "For professional creators",
    features: [
      "Unlimited flows",
      "All node types",
      "Priority support",
      "500 API calls/hour",
      "Team collaboration",
      "Custom branding",
    ],
    limits: {
      flows: Infinity,
      apiCalls: 500,
      teamMembers: 5,
    },
  },
  team: {
    name: "Team",
    price: 50,
    interval: "month",
    description: "For growing teams",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Advanced analytics",
      "Custom domain",
      "SSO authentication",
      "Dedicated support",
    ],
    limits: {
      flows: Infinity,
      apiCalls: Infinity,
      teamMembers: Infinity,
    },
  },
} as const;

// Credit costs for different operations
export const CREDIT_COSTS = {
  FLOW_CREATION: 10,
  NODE_CREATION: 1,
  API_CALL: 1,
  EXPORT: 5,
  TEAM_MEMBER: 5,
  CUSTOM_DOMAIN: 20,
} as const;

// Feature flags and limits
export const FEATURES = {
  maxFlowsPerProject: {
    free: 1,
    pro: Infinity,
    team: Infinity,
  },
  maxTeamMembers: {
    free: 1,
    pro: 5,
    team: Infinity,
  },
  maxApiCalls: {
    free: 60,
    pro: 500,
    team: Infinity,
  },
  allowedNodes: {
    free: ["startNode", "endNode", "singleChoice", "yesNo"],
    pro: ["startNode", "endNode", "singleChoice", "multipleChoice", "yesNo", "weightNode", "functionNode"],
    team: ["startNode", "endNode", "singleChoice", "multipleChoice", "yesNo", "weightNode", "functionNode"],
  },
} as const;

// Helper functions
export function getTierLimits(tier: keyof typeof SUBSCRIPTION_TIERS) {
  return SUBSCRIPTION_TIERS[tier].limits;
}

export function isFeatureAvailable(feature: keyof typeof FEATURES, tier: keyof typeof SUBSCRIPTION_TIERS) {
  return FEATURES[feature][tier];
}

export function getNodeTypes(tier: keyof typeof SUBSCRIPTION_TIERS) {
  return FEATURES.allowedNodes[tier];
} 