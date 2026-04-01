import { runtimeConfig } from "../config/runtime";

export class AuthService {
  public static getSsoLoginUrl(): string {
    const base = runtimeConfig.fastApiBaseUrl?.replace(/\/+$/, "") || "http://127.0.0.1:8000";
    return `${base}/api/auth/sso/login`;
  }
}
