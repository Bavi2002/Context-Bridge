import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  
  const res = NextResponse.next();

  // Add CORS for Chrome Extension API calls
  if (pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    if (origin && origin.startsWith("chrome-extension://")) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
  }

  // Handle CORS preflight explicitly if needed in middleware
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return res;
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return res;
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
