import { NextRequest } from "next/server";
import { proxyToBackend } from "../../_utils/backendProxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/auth/me", "GET");
}
