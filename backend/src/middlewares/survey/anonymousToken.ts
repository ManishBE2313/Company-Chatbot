import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const anonymousTokenMiddleware = (req: Request,res: Response,next: NextFunction) => {
  try {
    let token = req.cookies?.anonymousToken;

    //If token not present → generate new one
    if (!token) {
      token = randomUUID();
       res.cookie("anonymousToken", token, {
        httpOnly: true,     // not accessible via JS (secure)
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 100 // 1 year
      });
    }

    //Attach token to request
    (req as Request & { anonymousToken?: string }).anonymousToken = token;

    next();

  } catch (error) {
    next(error);
  }
};