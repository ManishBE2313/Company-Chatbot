import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth";

export class AuthController {
  public static async initiateSsoLogin(_req: Request, res: Response, next: NextFunction) {
    try {
      const redirectUrl = AuthService.getSsoLoginUrl();
      if (!redirectUrl) {
        throw new Error("SSO configuration is missing: FASTAPI URL not set.");
      }
      console.log(`[AuthController] redirecting to SSO login: ${redirectUrl}`);
      return res.redirect(302, redirectUrl);
    } catch (error) {
      next(error);
    }
  }
}
