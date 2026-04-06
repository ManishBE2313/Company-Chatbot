import axios, { AxiosError, Method } from "axios";
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8001";

export async function proxyToFastApi(
  request: NextRequest,
  targetPath: string,
  method: Method
) {
  try {
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    const body = method === "GET" ? undefined : await request.text();

    const response = await axios.request({
      url: FASTAPI_BASE_URL + targetPath,
      method,
      data: body,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      validateStatus: () => true,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; detail?: string }>;
    return NextResponse.json(
      {
        message:
          axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to reach FastAPI service.",
      },
      { status: axiosError.response?.status || 502 }
    );
  }
}
