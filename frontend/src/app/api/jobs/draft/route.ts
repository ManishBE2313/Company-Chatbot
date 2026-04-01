import { NextRequest } from "next/server";
import { proxyToBackend } from "@/app/api/_utils/backendProxy";

export async function POST(request: NextRequest) {
  // This forwards the incoming Next.js request directly to your Node.js backend at "/api/jobs/draft"
  return proxyToBackend(request, "/api/jobs/draft", "POST");
}