import { db } from './db';

interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
  remaining: number;
}

/**
 * Checks and increments the rate limit for a given key using the database.
 * @param key Unique identifier (e.g., 'login:192.168.1.1')
 * @param maxAttempts Maximum allowed attempts in the window
 * @param windowMs Time window in milliseconds
 * @param blockMs Optional: How long to block if max attempts is exceeded
 * @returns RateLimitResult with allowed status and remaining attempts
 */
export async function checkRateLimitDB(
  key: string,
  maxAttempts: number,
  windowMs: number,
  blockMs?: number
): Promise<RateLimitResult> {
  const now = new Date();

  // 1. Fetch current record
  let record = await db.rateLimit.findUnique({
    where: { key },
  });

  if (!record) {
    // New entry
    await db.rateLimit.create({
      data: {
        key,
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
      },
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // 2. Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 1000),
      remaining: 0,
    };
  }

  // 3. Check if window has expired
  if (record.resetAt <= now) {
    // Reset window
    record = await db.rateLimit.update({
      where: { key },
      data: {
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
        blockedUntil: null, // Clear any past block
      },
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // 4. Increment within window
  const newCount = record.count + 1;
  let blockedUntil = null;

  if (newCount > maxAttempts) {
    // Limit exceeded
    if (blockMs) {
      blockedUntil = new Date(now.getTime() + blockMs);
    } else {
      // Just block until the window resets
      blockedUntil = record.resetAt;
    }
  }

  record = await db.rateLimit.update({
    where: { key },
    data: {
      count: newCount,
      blockedUntil,
    },
  });

  if (blockedUntil) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000),
      remaining: 0,
    };
  }

  return { allowed: true, remaining: Math.max(0, maxAttempts - newCount) };
}

/**
 * Resets the rate limit for a specific key (e.g., after successful login)
 */
export async function resetRateLimitDB(key: string): Promise<void> {
  try {
    await db.rateLimit.delete({
      where: { key },
    });
  } catch (error) {
    // Ignore error if record doesn't exist
  }
}

/**
 * Background cleanup to remove expired entries and keep the table small
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  try {
    const now = new Date();
    await db.rateLimit.deleteMany({
      where: {
        OR: [
          // Expired windows and not blocked
          { resetAt: { lte: now }, blockedUntil: null },
          // Or expired blocks
          { blockedUntil: { lte: now } },
        ]
      }
    });
  } catch (error) {
    console.error('Failed to cleanup rate limits:', error);
  }
}
