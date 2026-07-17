/**
 * Best-effort in-memory rate limiter (per server instance / warm process).
 * Good enough to blunt casual spam & brute-force on a small site. For strict,
 * distributed limits behind multiple instances, swap for Upstash/Redis.
 */
const store = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    store.set(key, hits);
    return false; // blocked
  }
  hits.push(now);
  store.set(key, hits);
  return true; // allowed
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
