import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiter instances
export const hourlyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1 h'),
  analytics: true,
  prefix: 'ratelimit:hourly',
});

export const dailyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10000, '1 d'),
  analytics: true,
  prefix: 'ratelimit:daily',
});

export async function checkRateLimit(identifier: string) {
  // Check both hourly and daily limits
  const [hourlyResult, dailyResult] = await Promise.all([
    hourlyRateLimit.limit(identifier),
    dailyRateLimit.limit(identifier)
  ]);

  // Return combined result
  return {
    success: hourlyResult.success && dailyResult.success,
    limit: Math.min(hourlyResult.limit, dailyResult.limit),
    remaining: Math.min(hourlyResult.remaining, dailyResult.remaining),
    reset: Math.min(hourlyResult.reset, dailyResult.reset),
  };
} 