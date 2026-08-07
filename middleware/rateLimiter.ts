import rateLimit from "express-rate-limit";

// Global API rate limiter for standard routes
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // 300 requests per 15 mins per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again later."
  }
});

// Strict rate limiter for compute-heavy security analysis & AI inference routes
export const strictApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requests per 15 mins per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Security analysis rate limit exceeded. Please wait 15 minutes."
  }
});
