import { runtimeConfig } from "../config/runtime";

export class AuthService {
  public static getSsoLoginUrl(): string {
    return runtimeConfig.fastApiBaseUrl + "/api/auth/sso/login";
  }
}
