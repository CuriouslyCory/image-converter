import { db } from "~/server/db";

/**
 * Custom database-based rate limiter that allows 10 requests per hour per identifier
 * @param identifier - The identifier to rate limit (IP address or user ID)
 * @returns Promise<{ success: boolean; remaining: number }> - Success status and remaining requests
 */
export async function ratelimit(
  identifier: string,
): Promise<{ success: boolean; remaining: number }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
  const limit = 10; // 10 requests per hour

  // Clean up expired records for this identifier
  await db.rateLimit.deleteMany({
    where: {
      identifier,
      expiresAt: {
        lt: now,
      },
    },
  });

  // Count current requests within the last hour
  const currentRequests = await db.rateLimit.count({
    where: {
      identifier,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  // Check if limit is exceeded
  if (currentRequests >= limit) {
    return {
      success: false,
      remaining: 0,
    };
  }

  // Create a new rate limit record
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // Expires in 1 hour
  await db.rateLimit.create({
    data: {
      identifier,
      expiresAt,
    },
  });

  return {
    success: true,
    remaining: limit - currentRequests - 1,
  };
}

/**
 * Rate limiter object that mimics the Upstash ratelimit API
 */
export const ratelimitObj = {
  /**
   * Check and update rate limit for an identifier
   * @param identifier - The identifier to rate limit (IP address or user ID)
   * @returns Promise<{ success: boolean; remaining: number }> - Success status and remaining requests
   */
  limit: ratelimit,
};
