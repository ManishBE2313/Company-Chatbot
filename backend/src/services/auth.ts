import { runtimeConfig } from "../config/runtime";

import axios from "axios";

export class AuthService {
  public static getSsoLoginUrl(): string {
    return runtimeConfig.fastApiBaseUrl + "/api/auth/sso/login";
  }
}

export async function getAccessToken() {
  const response = await axios.post(
    `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID!,
      client_secret: process.env.MS_CLIENT_SECRET!,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    })
  );

  return response.data.access_token;
}
