// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Get the path the user is trying to visit
  const path = request.nextUrl.pathname;

  // 2. Define our protected and public routes
  const isPublicPath = path === "/login";

  // 3. Read the token from the cookies (Matches the cookie name set in FastAPI)
  const token = request.cookies.get("authcookie1")?.value || "";

  // 4. Redirect Logic
  // If the user is trying to access a protected route (like the chat widget) but has no token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // If the user is ALREADY logged in but tries to visit the login page, send them to the chat
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // Otherwise, let them proceed normally
  return NextResponse.next();
}

// 5. Specify which paths this middleware should run on
export const config = {
  matcher: [
    "/",
    "/login",
    // Add any other protected frontend routes here in the future
  ],
};