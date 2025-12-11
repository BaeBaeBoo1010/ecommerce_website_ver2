import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.warn("⚠️ REDIS_URL not set - Redis caching disabled");
}

// Singleton Redis client
let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!REDIS_URL) return null;

  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected");
    });
  }

  return redis;
}

// Cache helpers
const CACHE_TTL = 300; // 5 minutes default

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("❌ Redis GET error:", err);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("❌ Redis SET error:", err);
    return false;
  }
}

export async function invalidateCache(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (err) {
    console.error("❌ Redis DEL error:", err);
    return false;
  }
}

// Product cache key
export const PRODUCTS_CACHE_KEY = "products:all";
export const PRODUCTS_ADMIN_CACHE_KEY = "products:admin:all";
