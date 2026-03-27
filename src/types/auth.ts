/**
 * Authentication Type Definitions
 * Central place for all auth-related types
 */

import type { User as PrismaUser, Account, Session as PrismaSession } from "@prisma/client";

/**
 * Extended User type from NextAuth
 */
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: string;
  orgId: string | null;
}

/**
 * Extended Session type
 */
export interface AuthSession {
  user: AuthUser;
  expires: string;
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  id: string;
  email: string | null;
  role: string;
  orgId: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Registration Form Data
 */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  orgName?: string;
}

/**
 * Login Form Data
 */
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * User Roles
 */
export type UserRole = "ADMIN" | "RECRUITER" | "USER" | "CANDIDATE";

/**
 * User Status
 */
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DELETED";

/**
 * Organization Roles
 */
export type OrgRole = "OWNER" | "ADMIN" | "RECRUITER" | "MEMBER";

/**
 * OAuth Provider Types
 */
export type OAuthProvider = "google" | "github" | "credentials";

/**
 * Auth Error Types
 */
export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "USER_EXISTS"
  | "INVALID_EMAIL"
  | "INVALID_PASSWORD"
  | "PASSWORDS_DONT_MATCH"
  | "INSUFFICIENT_PERMISSIONS"
  | "NOT_AUTHENTICATED"
  | "USER_SUSPENDED"
  | "EMAIL_ALREADY_VERIFIED"
  | "EMAIL_NOT_VERIFIED"
  | "TOKEN_EXPIRED"
  | "INVALID_TOKEN";

/**
 * Auth Error Response
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  status: number;
}

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
}

/**
 * Registration Response
 */
export interface RegisterResponse {
  user: AuthUser;
  message: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  user: AuthUser;
  session: AuthSession;
  message: string;
}

/**
 * Session Response
 */
export interface SessionResponse {
  user: AuthUser | null;
  expires: string | null;
}

/**
 * Auth Config Types
 */
export interface AuthConfig {
  session: {
    maxAge: number;
    updateAge: number;
    strategy: "jwt" | "database";
  };
  password: {
    minLength: number;
    hashRounds: number;
  };
  routes: {
    public: string[];
    protected: string[];
    auth: string[];
  };
}

/**
 * User with Organization Info
 */
export interface UserWithOrg extends AuthUser {
  organizationId?: string;
  organizationName?: string;
  organizationRole?: OrgRole;
}

/**
 * Credentials Provider Type
 */
export interface CredentialsProvider {
  name: string;
  credentials: {
    email: string;
    password: string;
  };
}

/**
 * OAuth Account Info
 */
export interface OAuthAccount {
  provider: string;
  providerAccountId: string;
  type: "oauth" | "oidc";
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

/**
 * Verify Email Token
 */
export interface VerifyEmailToken {
  identifier: string;
  token: string;
  expires: Date;
}

/**
 * Reset Password Token
 */
export interface ResetPasswordToken {
  userId: string;
  token: string;
  expires: Date;
}

/**
 * Auth Context Type (for client components)
 */
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

/**
 * Use Auth Hook Return Type
 */
export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  orgId: string | null;
}

/**
 * Middleware Request with Auth
 */
export interface AuthRequest {
  user: AuthUser;
  token: JWTPayload;
}

/**
 * Organization Membership
 */
export interface OrgMembership {
  userId: string;
  organizationId: string;
  role: OrgRole;
  joinedAt: Date;
}

/**
 * Company/Organization Type
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User with Organization Memberships
 */
export interface UserWithMemberships extends AuthUser {
  organizationMemberships: OrgMembership[];
}

/**
 * Auth State for Client
 */
export interface AuthState {
  status: "unauthenticated" | "loading" | "authenticated";
  user: AuthUser | null;
  error: string | null;
}

/**
 * Session Update Payload
 */
export interface SessionUpdatePayload {
  role?: string;
  orgId?: string;
  [key: string]: any;
}

/**
 * Password Reset Request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password Reset Confirm
 */
export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Email Verification Request
 */
export interface EmailVerificationRequest {
  token: string;
}

/**
 * Company Size Enum
 */
export enum CompanySize {
  STARTUP = "STARTUP",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  ENTERPRISE = "ENTERPRISE",
}

/**
 * Subscription Plan Enum
 */
export enum PlanType {
  FREE = "FREE",
  STARTER = "STARTER",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
}

/**
 * Interview Type Enum
 */
export enum InterviewType {
  SCREENING = "SCREENING",
  PHONE = "PHONE",
  TECHNICAL = "TECHNICAL",
  BEHAVIORAL = "BEHAVIORAL",
  CASE_STUDY = "CASE_STUDY",
  PRESENTATION = "PRESENTATION",
  FINAL = "FINAL",
}

/**
 * Interview Status Enum
 */
export enum InterviewStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

/**
 * Application Status Enum
 */
export enum ApplicationStatus {
  APPLIED = "APPLIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  SHORTLISTED = "SHORTLISTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
  ACCEPTED = "ACCEPTED",
}

/**
 * Job Posting Status Enum
 */
export enum JobStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED",
}

/**
 * Job Level Enum
 */
export enum JobLevel {
  ENTRY = "ENTRY",
  MID = "MID",
  SENIOR = "SENIOR",
  LEAD = "LEAD",
  EXECUTIVE = "EXECUTIVE",
}

/**
 * Job Type Enum
 */
export enum JobType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  TEMPORARY = "TEMPORARY",
  INTERNSHIP = "INTERNSHIP",
}

/**
 * Remote Type Enum
 */
export enum RemoteType {
  ONSITE = "ONSITE",
  HYBRID = "HYBRID",
  REMOTE = "REMOTE",
}

/**
 * Candidate Status Enum
 */
export enum CandidateStatus {
  APPLIED = "APPLIED",
  SCREENING = "SCREENING",
  INTERVIEW = "INTERVIEW",
  OFFER = "OFFER",
  HIRED = "HIRED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

/**
 * Candidate Source Enum
 */
export enum CandidateSource {
  WEBSITE = "WEBSITE",
  LINKEDIN = "LINKEDIN",
  EMAIL = "EMAIL",
  REFERRAL = "REFERRAL",
  IMPORTED = "IMPORTED",
  API = "API",
}
