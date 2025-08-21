import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  console.warn(
    "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are not set. Redis client will not be initialized."
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.exp(retryCount) * 50,
  },
  // Add connection pooling and timeout optimizations
  keepAlive: true,
});

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error("Redis connection test failed:", error);
    return false;
  }
}
