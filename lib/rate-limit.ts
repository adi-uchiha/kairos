import { NextRequest } from 'next/server';
import { redis } from './redis';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds when the limit resets
}

/**
 * Checks if a request should be rate-limited.
 * Uses a Redis atomic INCR with an EXPIRE fallback.
 * Fails-open if Redis encounters any errors.
 */
export async function rateLimit(
  ip: string,
  action: string,
  limit: number,
  windowInSeconds: number
): Promise<RateLimitResult> {
  if (!redis) {
    return { success: true, limit, remaining: limit, reset: 0 };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowInSeconds) * windowInSeconds;
  const key = `ratelimit:${ip}:${action}:${windowStart}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowInSeconds);
    }

    const remaining = Math.max(0, limit - current);
    const reset = windowStart + windowInSeconds;

    return {
      success: current <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error(`[RateLimit] Error checking rate limit for ${ip} on action ${action}:`, error);
    // Fail open in case of Redis connection/auth issues so the app doesn't go down
    return { success: true, limit, remaining: 1, reset: 0 };
  }
}

/**
 * Resolves the client's public IP address from request headers.
 */
export function getClientIp(req: NextRequest): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',');
    return ips[0].trim();
  }

  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  if ((req as any).ip) return (req as any).ip;

  return '127.0.0.1';
}

/**
 * Creates a standard JSON 429 Too Many Requests response.
 */
export function createRateLimitResponse(resetTimestamp: number): Response {
  const retryAfter = Math.max(1, resetTimestamp - Math.floor(Date.now() / 1000));
  return new Response(
    JSON.stringify({
      error: 'rate_limited',
      message: `Too many requests. Please slow down. Try again in ${retryAfter} seconds.`,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  );
}

