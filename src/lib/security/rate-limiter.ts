/**
 * @file rate-limiter.ts
 * @description In-memory sliding window rate limiter foundation for auth endpoints.
 * Provides a clean interface capable of swapping to Redis/Upstash in production.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class MemoryRateLimiter {
  private storage = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodically clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Checks whether an action for a given key exceeds the window rate limit.
   * @param key Identifies the rate limited subject (e.g. IP + endpoint, or email)
   * @param limit Max allowed hits
   * @param windowMs Window duration in milliseconds
   */
  public async check(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetMs: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.storage.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.storage.set(key, record);
    }

    // Filter out timestamps outside current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0];
      const resetMs = oldestInWindow + windowMs - now;
      return {
        allowed: false,
        remaining: 0,
        resetMs: Math.max(resetMs, 0),
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: limit - record.timestamps.length,
      resetMs: windowMs,
    };
  }

  /**
   * Resets rate limit for a key (e.g. upon successful authentication).
   */
  public async reset(key: string): Promise<void> {
    this.storage.delete(key);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.storage.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60 * 60 * 1000);
      if (record.timestamps.length === 0) {
        this.storage.delete(key);
      }
    }
  }
}

export const rateLimiter = new MemoryRateLimiter();
