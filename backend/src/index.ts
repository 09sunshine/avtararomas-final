import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { ordersRouter } from "./routes/orders.js";
import { reviewsRouter } from "./routes/reviews.js";
import { productsRouter } from "./routes/products.js";
import { adminRouter } from "./routes/admin.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { couponsRouter } from "./routes/coupons.js";
import { contactRouter } from "./routes/contact.js";
import { newsletterRouter } from "./routes/newsletter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {
  apiLimiter,
  authLimiter,
  adminLimiter,
  checkoutLimiter,
  userActionLimiter,
  methodAwareLimiter,
} from "./middleware/rateLimiter.js";

const app = express();
const port = Number(process.env.PORT || 4001);

// Number of trusted reverse proxies (Render/Vercel/Nginx = 1). Must be set so that
// req.ip is the real client IP, otherwise every user shares one rate-limit bucket.
// Never use `true` here: express-rate-limit rejects a permissive trust proxy setting.
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? (process.env.NODE_ENV === "production" ? 1 : 0)));

// Robust, universal CORS configuration
// Reflects incoming origin so browsers accept credentials: true for custom domains, Vercel, localhost, etc.
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Non-browser clients (curl, mobile apps, Razorpay webhooks, health checks) send no Origin.
    // Browser clients send their page Origin. Reflecting origin back satisfies CORS specification
    // for all domains (e.g. custom domain, www subdomain, Vercel deployments, localhost).
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours preflight cache
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(
  express.json({
    limit: "2mb",
    // Keep the raw body so webhook signatures can be verified byte-for-byte
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: string }).rawBody = buf.toString("utf8");
    },
  })
);

// Health check - light rate limiting
app.use("/health", apiLimiter, healthRouter);

// Auth endpoints - strict rate limiting to prevent brute force
app.use("/api/auth", authLimiter, authRouter);

// Orders - reads (order history) stay generous, writes (checkout) are strict
app.use("/api/orders", methodAwareLimiter(apiLimiter, checkoutLimiter), ordersRouter);

// Reviews - reads are public browsing, posting a review is a user action
app.use("/api/reviews", methodAwareLimiter(apiLimiter, userActionLimiter), reviewsRouter);

// Products - public browsing, moderate limits
app.use("/api/products", apiLimiter, productsRouter);

// Admin - separate moderate limit
app.use("/api/admin", adminLimiter, adminRouter);

// Webhooks - Razorpay, moderate limit
app.use("/api/webhooks", apiLimiter, webhooksRouter);

// Coupons - reads are for the admin panel, validation/writes are user actions
app.use("/api/coupons", methodAwareLimiter(apiLimiter, userActionLimiter), couponsRouter);

// Contact form - prevent spam
app.use("/api/contact", userActionLimiter, contactRouter);

// Newsletter - prevent spam
app.use("/api/newsletter", userActionLimiter, newsletterRouter);

// Unknown routes should return JSON, not Express' default HTML error page
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

app.listen(port, () => {
  const env = process.env.NODE_ENV || "development";
  console.log(`Avtar Aromas backend running on port ${port} [${env}]`);
});

export default app;
