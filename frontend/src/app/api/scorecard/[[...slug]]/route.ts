import { NextRequest } from "next/server";
import { proxyToBackend } from "../../_utils/backendProxy";

function buildTargetPath(request: NextRequest, slug?: string[]) {
  const suffix = slug && slug.length > 0 ? "/" + slug.join("/") : "";
  const query = request.nextUrl.search || "";
  return "/api/scorecard" + suffix + query;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await context.params;
  return proxyToBackend(request, buildTargetPath(request, slug), "POST");
}
