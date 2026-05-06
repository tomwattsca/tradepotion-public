/**
 * In-memory sliding-window rate limiter.
 *
 * Each key (typically an IP) gets a fixed-size window. When the window
 * fills up, subsequent requests are rejected until older entries expire.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Prune stale entries every 60 seconds to prevent memory leaks
const PRUNE_INTERVAL_MS = 60_000;
let lastPrune = Date.now();

function pruneStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;

  store.forEach((entry, key) => {
    if (entry.timestamps.length === 0 || now - entry.timestamps[entry.timestamps.length - 1] > windowMs) {
      store.delete(key);
    }
  });
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Check whether a request identified by `key` is within the rate limit.
 *
 * @param key       Unique identifier (e.g. IP address)
 * @param limit     Maximum number of requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  pruneStaleEntries(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the current window
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldestInWindow + windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetMs: windowMs,
  };
}
