import type { Request, RequestHandler } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Use environment-based configuration
const isProduction = process.env.NODE_ENV === "production";

type LimiterConfig = {
  windowMs: number;
  limit: number;
  message: string;
};

// Development: Extremely high limits to not interfere with testing and hot reload
// Production: Reasonable limits for an ecommerce storefront (a single page view can
// trigger several API calls, so read limits must stay generous).
const configs: Record<string, LimiterConfig> = {
  api: {
    windowMs: 60 * 1000,
    limit: isProduction ? 300 : 10000,
    message: "Too many requests. Please try again after a minute.",
  },
  userAction: {
    windowMs: 60 * 1000,
    limit: isProduction ? 40 : 5000,
    message: "Too many requests. Please try again after a minute.",
  },
  auth: {
    windowMs: 60 * 1000,
    limit: isProduction ? 30 : 2000,
    message: "Too many authentication requests. Please try again after a minute.",
  },
  admin: {
    windowMs: 60 * 1000,
    limit: isProduction ? 300 : 2000,
    message: "Admin API rate limit exceeded. Please try again after a minute.",
  },
  checkout: {
    windowMs: 60 * 1000,
    limit: isProduction ? 20 : 1000,
    message: "Too many checkout attempts. Please try again after a minute.",
  },
};

// Create reusable limiter factory
const createLimiter = (config: LimiterConfig) =>
  rateLimit({
    windowMs: config.windowMs,
    limit: config.limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // CORS preflight requests must never consume a client's quota, otherwise the
    // browser gets a 429 on OPTIONS and the real request is never sent.
    skip: (req: Request) => req.method === "OPTIONS",
    // `ipKeyGenerator` normalises IPv6 addresses to a subnet. express-rate-limit v8
    // throws (ERR_ERL_KEY_GEN_IPV6) if a custom key generator reads `req.ip` directly.
    keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? "unknown"),
    handler: (req, res) => {
      res.status(429).json({
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
  });

export const apiLimiter = createLimiter(configs.api);
export const userActionLimiter = createLimiter(configs.userAction);
export const authLimiter = createLimiter(configs.auth);
export const adminLimiter = createLimiter(configs.admin);
export const checkoutLimiter = createLimiter(configs.checkout);

/**
 * Applies a relaxed limiter to safe/read requests (GET, HEAD) and a stricter one to
 * mutating requests. Used for routers that mix browsing with sensitive writes
 * (e.g. listing orders vs. creating an order).
 */
export const methodAwareLimiter =
  (readLimiter: RequestHandler, writeLimiter: RequestHandler): RequestHandler =>
  (req, res, next) => {
    const limiter = req.method === "GET" || req.method === "HEAD" ? readLimiter : writeLimiter;
    return limiter(req, res, next);
  };
