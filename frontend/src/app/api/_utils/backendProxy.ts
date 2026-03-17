import axios, { AxiosError, Method } from "axios";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3000";

export async function proxyToBackend(
  request: NextRequest,
  targetPath: string,
  method: Method
) {
  try {
    const contentType = request.headers.get("content-type");
    const body = method === "GET" ? undefined : await request.text();

    const response = await axios.request({
      url: BACKEND_BASE_URL + targetPath,
      method,
      data: body,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
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
