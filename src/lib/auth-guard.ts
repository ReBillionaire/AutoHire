import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Get the current user's session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require specific role - throws error if user lacks required role
 */
export async function requireRole(requiredRole: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasRole = (user as any).role === requiredRole || (user as any).role === "admin";
  if (!hasRole) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  return user;
}

/**
 * Check if user has access to organization
 */
export async function requireOrgAccess(orgId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const userOrgId = (user as any).orgId;
  if (userOrgId !== orgId && (user as any).role !== "admin") {
    throw new Error("You don't have access to this organization");
  }

  return user;
}

/**
 * HOC for protecting API routes with authentication
 */
export function withAuth(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add user to request for use in handler
    (req as any).user = user;
    return handler(req, context);
  };
}

/**
 * HOC for protecting API routes with role check
 */
export function withRole(
  role: string,
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userRole = (user as any).role;
    if (userRole !== role && userRole !== "admin") {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    (req as any).user = user;
    return handler(req, context);
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
