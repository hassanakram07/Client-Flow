import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pass through internal Next.js assets and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Read session cookie
  const sessionCookie = req.cookies.get("nexops_session")?.value;
  let sessionUser: { role?: string } | null = null;

  if (sessionCookie) {
    try {
      sessionUser = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      try {
        sessionUser = JSON.parse(sessionCookie);
      } catch {
        sessionUser = null;
      }
    }
  }

  // Root redirect
  if (pathname === "/") {
    if (!sessionUser) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const target = sessionUser.role === "client" ? "/portal/dashboard" : "/admin/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Already logged in trying to access login or signup
  if ((pathname === "/login" || pathname === "/signup") && sessionUser?.role) {
    const target = sessionUser.role === "client" ? "/portal/dashboard" : "/admin/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Protected Admin routes
  if (pathname.startsWith("/admin")) {
    if (!sessionUser) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Client role cannot access admin area
    if (sessionUser.role === "client") {
      return NextResponse.redirect(new URL("/portal/dashboard", req.url));
    }
  }

  // Protected Portal routes
  if (pathname.startsWith("/portal")) {
    if (!sessionUser) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Admin/Team members visiting portal can be redirected to admin dashboard or allowed
    if (sessionUser.role === "admin" || sessionUser.role === "team") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // API rate limiting headers simulation
  if (pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", "100");
    res.headers.set("X-RateLimit-Remaining", "99");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
