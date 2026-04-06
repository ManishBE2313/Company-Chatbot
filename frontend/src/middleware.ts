// src/middleware.ts
// Updated to also protect all /hr/* routes.
// Role-level checks (admin/superadmin) are handled inside each page,
// middleware only checks that a valid session cookie exists.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // All routes that don't need a login
  const isPublicPath = path === "/login";

  // Cookie name must match what the central auth service sets
  const token = request.cookies.get("authcookie1")?.value || "";

  // No token on a protected route → send to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Already logged in but visiting login → send to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    // Protect all /hr pages and any nested routes under it
    "/hr/:path*",
  ],
};
