import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  limit: number;
  keyGenerator?: (req: Request) => string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function makeRateLimiter(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator?.(req) ?? req.ip ?? req.socket.remoteAddress ?? "global";
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      const freshBucket: Bucket = { count: 1, resetAt: now + options.windowMs };
      buckets.set(key, freshBucket);
      res.setHeader("X-RateLimit-Limit", String(options.limit));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, options.limit - freshBucket.count)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(freshBucket.resetAt / 1000)));
      return next();
    }

    if (existing.count >= options.limit) {
      res.setHeader("Retry-After", String(Math.ceil((existing.resetAt - now) / 1000)));
      res.setHeader("X-RateLimit-Limit", String(options.limit));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(existing.resetAt / 1000)));
      return res.status(429).json({
        error: "Too many requests",
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
      });
    }

    existing.count += 1;
    buckets.set(key, existing);
    res.setHeader("X-RateLimit-Limit", String(options.limit));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, options.limit - existing.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(existing.resetAt / 1000)));
    return next();
  };
}

export const authLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 40
});

export const aiLimiter = makeRateLimiter({
  windowMs: 60 * 1000,
  limit: 60
});
