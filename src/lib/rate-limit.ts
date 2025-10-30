import { kv } from "@vercel/kv";

import { env } from "@/lib/env";

interface RateLimitOptions {
  limit?: number;
  windowSeconds?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
}

const memoryStore = new Map<
  string,
  { count: number; expiresAt: number; windowSeconds: number; limit: number }
>();

export async function rateLimitByKey(
  key: string,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const limit = options.limit ?? 5;
  const windowSeconds = options.windowSeconds ?? 60;
  const now = Math.floor(Date.now() / 1000);

  if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    const redisKey = `society:rate:${key}`;
    const count = await kv.incr(redisKey);
    if (count === 1) {
      await kv.expire(redisKey, windowSeconds);
    }
    const ttl = await kv.ttl(redisKey);
    return {
      allowed: count <= limit,
      remaining: Math.max(limit - count, 0),
      reset: now + (ttl ?? windowSeconds),
    };
  }

  const existing = memoryStore.get(key);
  if (!existing || existing.expiresAt <= now) {
    memoryStore.set(key, {
      count: 1,
      expiresAt: now + windowSeconds,
      windowSeconds,
      limit,
    });
    return { allowed: true, remaining: limit - 1, reset: now + windowSeconds };
  }

  existing.count += 1;
  const allowed = existing.count <= limit;
  return {
    allowed,
    remaining: Math.max(existing.limit - existing.count, 0),
    reset: existing.expiresAt,
  };
}

export async function rateLimitIp(
  ip: string,
  options?: RateLimitOptions,
): Promise<RateLimitResult> {
  return rateLimitByKey(`ip:${ip}`, options);
}
