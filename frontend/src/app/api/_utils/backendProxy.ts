import axios, { AxiosError, Method } from "axios";
import { NextRequest, NextResponse } from "next/server";

function resolveBackendBaseUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL2,
    "http://127.0.0.1:3000",
  ].filter((value): value is string => Boolean(value));

  const preferred = candidates.find((value) => {
    try {
      const url = new URL(value);
      return url.port !== "3001";
    } catch {
      return true;
    }
  });

  return preferred ?? "http://127.0.0.1:3000";
}

const BACKEND_BASE_URL = resolveBackendBaseUrl();

export async function proxyToBackend(
  request: NextRequest,
  targetPath: string,
  method: Method
) {
  try {
    const contentType = request.headers.get("content-type");
    const userEmail = request.headers.get("x-user-email");
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    const body = method === "GET" ? undefined : await request.text();

    const response = await axios.request({
      url: BACKEND_BASE_URL + targetPath,
      method,
      data: body,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(userEmail ? { "x-user-email": userEmail } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      validateStatus: () => true,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return NextResponse.json(
      {
        message:
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to reach backend service.",
      },
      { status: axiosError.response?.status || 502 }
    );
  }
}
