// Simple in-memory rate limiter for API routes
// For production, use Upstash Redis instead

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || "10");
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW || "60000");

export function rateLimit(identifier: string): {
  success: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const existing = requestCounts.get(identifier);

  if (!existing || now > existing.resetAt) {
    // New window
    const resetAt = now + WINDOW_MS;
    requestCounts.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return {
    success: true,
    remaining: MAX_REQUESTS - existing.count,
    resetAt: existing.resetAt,
  };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || real || "unknown";
}
