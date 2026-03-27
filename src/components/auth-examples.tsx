/**
 * Authentication Usage Examples
 * Reference implementations for common patterns
 */

// ============================================================================
// SERVER COMPONENT EXAMPLES
// ============================================================================

// Example 1: Get current user in a server component
import { getCurrentUser, requireAuth } from "@/lib/auth-guard";

export async function UserGreeting() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Hello, {user.name}!</div>;
}

// Example 2: Require authentication before rendering
export async function ProtectedPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

// Example 3: Check user role on server
export async function AdminPanel() {
  const user = await requireAuth();

  // Type-safe role check
  if ((user as any).role !== "ADMIN") {
    return <div>Access denied</div>;
  }

  return <div>Admin Panel</div>;
}

// ============================================================================
// CLIENT COMPONENT EXAMPLES
// ============================================================================

"use client";

import { useCurrentUser, useHasRole, useIsAuthenticated, useOrgId } from "@/hooks/use-current-user";
import { signOut } from "next-auth/react";

// Example 4: Display user info in client component
export function ClientUserCard() {
  const user = useCurrentUser();
  const isAdmin = useHasRole("ADMIN");

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {isAdmin && <span className="badge">Admin</span>}
    </div>
  );
}

// Example 5: Conditional rendering based on auth status
export function Header() {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();

  return (
    <header className="flex justify-between items-center p-4">
      <h1>AutoHire</h1>
      <nav>
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name}</span>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
              className="btn"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <a href="/login" className="btn">
              Sign in
            </a>
            <a href="/register" className="btn btn-primary">
              Sign up
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}

// Example 6: Check role before rendering admin content
export function AdminMenu() {
  const isAdmin = useHasRole("ADMIN");
  const isRecruiter = useHasRole("RECRUITER");

  return (
    <menu>
      {isRecruiter && <li><a href="/jobs">Jobs</a></li>}
      {isRecruiter && <li><a href="/candidates">Candidates</a></li>}
      {isAdmin && <li><a href="/admin/settings">Admin Settings</a></li>}
      {isAdmin && <li><a href="/admin/users">User Management</a></li>}
    </menu>
  );
}

// Example 7: Get and display user's organization
export function OrgSelector() {
  const orgId = useOrgId();
  const user = useCurrentUser();

  if (!orgId) {
    return <div>No organization selected</div>;
  }

  return (
    <div>
      <p>Current organization: {orgId}</p>
      <p>User: {user?.name}</p>
    </div>
  );
}

// ============================================================================
// API ROUTE EXAMPLES
// ============================================================================

// Example 8: Protected API route
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";

async function handler(req: NextRequest) {
  const user = (req as any).user;

  return NextResponse.json({
    message: `Hello, ${user.name}`,
    user: user,
  });
}

export const GET = withAuth(handler);

// Example 9: Admin-only API route
import { withRole } from "@/lib/auth-guard";

async function adminHandler(req: NextRequest) {
  return NextResponse.json({
    message: "Admin access granted",
  });
}

export const ADMIN_GET = withRole("ADMIN", adminHandler);

// ============================================================================
// FORM EXAMPLES
// ============================================================================

// Example 10: Sign out form
export function SignOutForm() {
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <form action={handleSignOut}>
      <button type="submit">Sign out</button>
    </form>
  );
}

// Example 11: Update user session
export function UpdateSessionButton() {
  const handleUpdate = async () => {
    // After updating user in database, trigger session update
    const res = await fetch("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ action: "update" }),
    });
  };

  return (
    <button onClick={handleUpdate}>
      Refresh Session
    </button>
  );
}

// ============================================================================
// MIDDLEWARE EXAMPLES
// ============================================================================

// Example 12: Manual role check in component
export async function RoleGate({ role, children }: { role: string; children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const hasRole = (user as any).role === role || (user as any).role === "ADMIN";

  return hasRole ? children : null;
}

// Example 13: Admin-only layout
export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  if ((user as any).role !== "ADMIN") {
    return <div>Access denied</div>;
  }

  return (
    <div className="admin-layout">
      <aside>Admin Navigation</aside>
      <main>{children}</main>
    </div>
  );
}

// ============================================================================
// HOOK EXAMPLES
// ============================================================================

// Example 14: Custom hook combining multiple auth checks
export function useAuthenticatedUser() {
  const user = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated || !user) {
    return null;
  }

  return user;
}

// Example 15: Custom hook for organization access
export function useOrgContext() {
  const orgId = useOrgId();
  const user = useCurrentUser();
  const isOrgOwner = (user as any).orgId === orgId && (user as any).role === "OWNER";

  return {
    orgId,
    user,
    isOrgOwner,
  };
}
