import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const anonymousTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.anonymousToken;

    if (!token) {
      token = randomUUID();
      res.cookie("anonymousToken", token, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 100,
      });
    }

    (req as Request & { anonymousToken?: string }).anonymousToken = token;

    next();
  } catch (error) {
    next(error);
  }
};
