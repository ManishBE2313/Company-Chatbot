import { NextFunction, Request, Response } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const apiLimiter = new RateLimiterMemory({
  points: Number(process.env.API_RATE_LIMIT_POINTS || 30),
  duration: Number(process.env.API_RATE_LIMIT_DURATION_SECONDS || 60),
});

export async function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const identifier =
    req.ip ||
    req.headers["x-forwarded-for"]?.toString() ||
    req.socket.remoteAddress ||
    "unknown-client";

  try {
    await apiLimiter.consume(identifier);
    next();
  } catch {
    res.status(429).json({
      message: "Too many requests. Please try again shortly.",
    });
  }
}
