import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger.js";

// General API rate limiter (100 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health" || req.path === "/api/health";
  },
  keyGenerator: (req) => {
    // Use user id if authenticated, otherwise use IP
    return req.user?.id || req.ip;
  },
});

// Auth rate limiter (5 attempts per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.body?.email || req.ip;
  },
});

// Strict rate limiter for sensitive operations (10 requests per hour)
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many requests from this IP, please try again after an hour.",
});

// Create IP whitelist (for internal services)
const ipWhitelist = (process.env.IP_WHITELIST || "").split(",").filter(Boolean);

export const createCustomLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    skip: (req) => {
      // Skip for whitelisted IPs
      const clientIp = req.ip || req.connection.remoteAddress;
      return ipWhitelist.includes(clientIp);
    },
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
  });
};

logger.info("Rate limiting configured (Memory Store - no Redis needed)");
