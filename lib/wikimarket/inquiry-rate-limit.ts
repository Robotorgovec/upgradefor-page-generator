type RateLimitEntry = {
  timestamps: number[];
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const globalForRateLimit = globalThis as typeof globalThis & {
  __wikimarketInquiryRateLimit?: Map<string, RateLimitEntry>;
};

const requestStore = globalForRateLimit.__wikimarketInquiryRateLimit ?? new Map<string, RateLimitEntry>();

if (!globalForRateLimit.__wikimarketInquiryRateLimit) {
  globalForRateLimit.__wikimarketInquiryRateLimit = requestStore;
}

export function getClientIdentifier(forwardedForHeader: string | null): string {
  if (!forwardedForHeader) {
    return "unknown";
  }

  const firstForwardedIp = forwardedForHeader.split(",")[0]?.trim();
  return firstForwardedIp || "unknown";
}

export function checkInquiryRateLimit(clientIdentifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const currentEntry = requestStore.get(clientIdentifier) ?? { timestamps: [] };
  const timestamps = currentEntry.timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestTimestamp = timestamps[0] ?? now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp)) / 1000)),
    };
  }

  timestamps.push(now);
  requestStore.set(clientIdentifier, { timestamps });

  return { allowed: true };
}
