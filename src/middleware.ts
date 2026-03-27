import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Protected routes that require authentication
 */
const protectedRoutes = ["/dashboard", "/settings", "/organization", "/admin"];

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/careers",
  "/api/auth",
  "/api/auth/register",
];

/**
 * Routes that authenticated users should not access (redirect to dashboard)
 */
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route));

  // Check if route is auth-only (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // If route is protected and user is not authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and tries to access login/register, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Default: allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
