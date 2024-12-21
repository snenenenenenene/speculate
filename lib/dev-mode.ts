// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Check if developer mode is enabled (can be overridden in .env)
export const isDevMode = isDev || process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// Check if user has infinite credits
export const hasInfiniteCredits = (role?: string | null) => {
  if (isDevMode) return true;
  return role === 'ADMIN';
};

// Check if paywalls are disabled
export const arePaywallsDisabled = () => {
  return isDevMode || process.env.NEXT_PUBLIC_DISABLE_PAYWALLS === 'true';
};

// Get credit cost for an operation (returns 0 if dev mode or infinite credits)
export const getCreditCost = (cost: number, role?: string | null) => {
  if (hasInfiniteCredits(role)) return 0;
  return cost;
};

// Credit costs for different operations
export const CREDIT_COSTS = {
  FLOW_CREATION: 10,
  NODE_CREATION: 1,
  API_CALL: 1,
  EXPORT: 5,
} as const; 