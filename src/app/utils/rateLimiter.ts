// utils/rateLimiter.ts
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints (login/signup)
 * Limits each IP to 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Generic rate limiter
 * @param windowMs duration of window in ms
 * @param max max requests allowed in window
 */
export const createRateLimiter = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    message: { message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
