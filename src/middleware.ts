import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication
const PROTECTED_PATHS = ["/app", "/myhome"];

// Routes that require admin role
const ADMIN_PATHS = ["/myhome"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to check path
  const pathWithoutLocale = pathname.replace(/^\/(de|en)/, "") || "/";

  // Check if path is protected
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  );

  if (isProtected) {
    // Check for session token (JWT)
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      // Redirect to auth page
      const locale = pathname.match(/^\/(de|en)/)?.[1] || "de";
      const authUrl = new URL(`/${locale}/auth`, request.url);
      authUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(authUrl);
    }

    // For admin paths, verify admin role via JWT payload
    const isAdminPath = ADMIN_PATHS.some(
      (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
    );

    if (isAdminPath) {
      try {
        // Decode JWT to check role (basic check — full validation in server components)
        const payload = JSON.parse(
          Buffer.from(sessionToken.split(".")[1], "base64").toString()
        );
        // Check if user email contains "admin" (matches our auth logic)
        // In production: store role in JWT token properly
        if (!payload.email?.includes("admin")) {
          const locale = pathname.match(/^\/(de|en)/)?.[1] || "de";
          return NextResponse.redirect(new URL(`/${locale}/app`, request.url));
        }
      } catch {
        // Invalid token — redirect to auth
        const locale = pathname.match(/^\/(de|en)/)?.[1] || "de";
        return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
      }
    }
  }

  // Run i18n middleware for all requests
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(de|en)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
