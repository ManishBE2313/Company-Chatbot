import { NextRequest } from "next/server";
import { proxyToBackend } from "@/app/api/_utils/backendProxy"; // Use your exact import path here

export async function POST(
  req: NextRequest,
  // 1. Update the type: params is now a Promise
  { params }: { params: Promise<{ jobId: string }> } 
) {
  // 2. Await the params to extract the jobId
  const resolvedParams = await params; 

  return proxyToBackend(
    req, 
    `/api/hr/jobs/${resolvedParams.jobId}/sharepoint-sync`, 
    "POST"
  );
}