import { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_utils/backendProxy";

function buildTargetPath(request: NextRequest, slug?: string[]) {
  const suffix = slug && slug.length > 0 ? "/" + slug.join("/") : "";
  const query = request.nextUrl.search || "";
  return "/api/hr/applications" + suffix + query;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await context.params;
  return proxyToBackend(request, buildTargetPath(request, slug), "GET");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await context.params;
  return proxyToBackend(request, buildTargetPath(request, slug), "PATCH");
}
