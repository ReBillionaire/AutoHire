/**
 * Authentication Constants
 * Centralized configuration for auth system
 */

export const AUTH_CONFIG = {
  // Session configuration
  SESSION: {
    MAX_AGE: 30 * 24 * 60 * 60, // 30 days
    UPDATE_AGE: 24 * 60 * 60, // 24 hours
  },

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    HASH_ROUNDS: 12,
  },

  // User roles
  ROLES: {
    ADMIN: "ADMIN",
    RECRUITER: "RECRUITER",
    USER: "USER",
    CANDIDATE: "CANDIDATE",
  } as const,

  // User statuses
  STATUSES: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    SUSPENDED: "SUSPENDED",
    DELETED: "DELETED",
  } as const,

  // Company roles
  COMPANY_ROLES: {
    OWNER: "OWNER",
    ADMIN: "ADMIN",
    RECRUITER: "RECRUITER",
    VIEWER: "VIEWER",
  } as const,

  // Route configuration
  ROUTES: {
    // Public routes - no auth required
    PUBLIC: [
      "/",
      "/careers",
      "/api/auth",
      "/api/auth/register",
    ],

    // Protected routes - auth required
    PROTECTED: [
      "/dashboard",
      "/settings",
      "/organization",
      "/admin",
    ],

    // Auth routes - redirect to dashboard if authenticated
    AUTH: [
      "/auth/signin",
      "/auth/signup",
      "/auth/error",
    ],
  },

  // Error messages
  ERRORS: {
    INVALID_CREDENTIALS: "Invalid email or password",
    USER_NOT_FOUND: "User not found",
    USER_EXISTS: "User with this email already exists",
    INVALID_EMAIL: "Invalid email address",
    INVALID_PASSWORD: "Password must be at least 8 characters",
    PASSWORDS_DONT_MATCH: "Passwords do not match",
    INSUFFICIENT_PERMISSIONS: "You don't have permission to access this",
    NOT_AUTHENTICATED: "You must be logged in to access this",
    USER_SUSPENDED: "Your account has been suspended",
  },

  // Success messages
  SUCCESS: {
    REGISTERED: "Account created successfully",
    SIGNED_IN: "You have been signed in",
    SIGNED_OUT: "You have been signed out",
    PASSWORD_RESET: "Password reset email sent",
    EMAIL_VERIFIED: "Email verified successfully",
  },

  // OAuth providers
  OAUTH_PROVIDERS: {
    GOOGLE: "google",
    GITHUB: "github",
    CREDENTIALS: "credentials",
  } as const,

  // Company sizes
  COMPANY_SIZES: {
    STARTUP: "STARTUP",
    SMALL: "SMALL",
    MEDIUM: "MEDIUM",
    LARGE: "LARGE",
    ENTERPRISE: "ENTERPRISE",
  } as const,

  // Subscription plans
  PLANS: {
    FREE: "FREE",
    STARTER: "STARTER",
    PROFESSIONAL: "PROFESSIONAL",
    ENTERPRISE: "ENTERPRISE",
  } as const,
} as const;

// Type exports for autocomplete
export type UserRole = typeof AUTH_CONFIG.ROLES[keyof typeof AUTH_CONFIG.ROLES];
export type UserStatus = typeof AUTH_CONFIG.STATUSES[keyof typeof AUTH_CONFIG.STATUSES];
export type CompanyRole = typeof AUTH_CONFIG.COMPANY_ROLES[keyof typeof AUTH_CONFIG.COMPANY_ROLES];
export type OAuthProvider = typeof AUTH_CONFIG.OAUTH_PROVIDERS[keyof typeof AUTH_CONFIG.OAUTH_PROVIDERS];
export type CompanySize = typeof AUTH_CONFIG.COMPANY_SIZES[keyof typeof AUTH_CONFIG.COMPANY_SIZES];
export type PlanType = typeof AUTH_CONFIG.PLANS[keyof typeof AUTH_CONFIG.PLANS];