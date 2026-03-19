import { NextRequest } from "next/server";
import { proxyToBackend } from "../../_utils/backendProxy";

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/jobs/setup", "POST");
}
