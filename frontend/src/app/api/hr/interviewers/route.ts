import { NextRequest } from "next/server";
import { proxyToBackend } from "../../_utils/backendProxy"; 

export async function GET(request: NextRequest) {
  // Forward to the exact path you registered in your Express router
  return proxyToBackend(request, "/api/hr/user/interviewers", "GET");
}