"use client";

import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

export interface CurrentUser extends Session["user"] {
  id: string;
  role: string;
  orgId: string | null;
}

/**
 * Hook to get the current authenticated user
 * Returns null if user is not authenticated or session is loading
 */
export function useCurrentUser(): CurrentUser | null {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  return session.user as CurrentUser;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const user = useCurrentUser();
  return !!user;
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(role: string): boolean {
  const user = useCurrentUser();
  if (!user) return false;

  return user.role === role || user.role === "admin";
}

/**
 * Hook to get the user's organization ID
 */
export function useOrgId(): string | null {
  const user = useCurrentUser();
  return user?.orgId || null;
}