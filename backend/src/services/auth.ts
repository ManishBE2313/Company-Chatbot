import { runtimeConfig } from "../config/runtime";

import axios from "axios";

export class AuthService {
  public static getSsoLoginUrl(): string {
    const base = runtimeConfig.fastApiBaseUrl?.replace(/\/+$/, "") || "http://127.0.0.1:8000";
    return `${base}/api/auth/sso/login`;
  }
}

export async function getAccessToken() {
  const response = await axios.post(
    `https://login.microsoftonline.com/${process.env.SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.SHAREPOINT_CLIENT_ID!,
      client_secret: process.env.SHAREPOINT_CLIENT_SECRET!,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    })
  );

  return response.data.access_token;
}
