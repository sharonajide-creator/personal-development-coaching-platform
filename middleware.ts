// Phase 5 — Route hardening.
// - User routes require a Better Auth session cookie; deep auth + role checks
//   still happen in server pages (dashboard/admin) and API handlers.
// - /admin requires COACH_ADMIN (enforced server-side; middleware only ensures login).
// - No community routes exist in MVP — any /community access is 404 by design.

import { NextResponse, type NextRequest } from "next/server";

const USER_ROUTES = [
  "/dashboard",
  "/assessment",
  "/goals",
  "/paths",
  "/learn",
  "/journal",
  "/journey",
  "/ask-coach",
  "/bookings",
  "/store",
  "/profile",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth =
    USER_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`)) ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/");

  // Public: marketing, auth, health, SEO files.
  if (!needsAuth) return NextResponse.next();
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname.startsWith("/api/health")) return NextResponse.next();

  // Better Auth session cookies (v1 default names).
  const hasSession =
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");

  if (!hasSession) {
    // API → 401 JSON, pages → redirect to /login (preserves launch UX).
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|preview).*)"],
};
