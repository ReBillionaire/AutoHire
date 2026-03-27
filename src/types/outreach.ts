/**
 * Type definitions for Outreach module
 */

export type OutreachStatus = 'DRAFT' | 'SCHEDULED' | 'POSTED' | 'ARCHIVED';

export type Platform =
  | 'linkedin'
  | 'reddit'
  | 'indeed'
  | 'hackerNews'
  | 'dribbble'
  | 'behance'
  | 'twitter'
  | 'angelList';

export type Priority = 'high' | 'medium' | 'low';

/**
 * Outreach Post - Database model
 */
export interface OutreachPost {
  id: string;
  title: string;
  jobPostingId: string;
  companyId: string;
  createdById: string;
  status: OutreachStatus;
  platforms: Platform[];
  aiPlatformRecs?: string; // JSON stringified
  jobType?: string;
  scheduledAt?: Date;
  postedAt?: Date;
  views: number;
  clicks: number;
  applications: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Platform Content - Database model
 */
export interface PlatformContent {
  id: string;
  platform: Platform;
  outreachPostId: string;
  content: string;
  characterCount: number;
  hashtags?: string;
  bestPostingTime?: string;
  customization?: string; // JSON stringified
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Platform Recommendation from AI analysis
 */
export interface PlatformRecommendation {
  platform: Platform;
  score: number; // 0-100
  reasoning: string;
  priority: Priority;
}

/**
 * Generated content for a platform
 */
export interface GeneratedContent {
  platform: Platform;
  content: string;
  characterCount: number;
  hashtags?: string[];
  bestPostingTime?: string;
  error?: string;
}

/**
 * Job posting details for outreach context
 */
export interface JobPostingForOutreach {
  id: string;
  title: string;
  description: string;
  level: string;
  type: string;
  salary?: string;
  location?: string;
  remote?: string;
  benefits?: string;
  company: {
    id: string;
    name: string;
    website?: string;
    logo?: string;
  };
}

/**
 * Platform profile with guidelines and limits
 */
export interface PlatformProfile {
  name: string;
  icon: string;
  maxCharacters: number;
  tone: string;
  hashtags: number;
  bestPostingTimes: string[];
  characterLimit: string;
  guidelines: string[];
}

/**
 * Posting time recommendation
 */
export interface PostingTimeRecommendation {
  times: string[];
  reasoning: string;
}

/**
 * Validation result for content
 */
export interface ContentValidation {
  valid: boolean;
  errors: string[];
  characterCount: number;
}

/**
 * API Request/Response types
 */

// POST /api/outreach/analyze
export interface AnalyzeJobRequest {
  jobId: string;
}

export interface AnalyzeJobResponse {
  jobId: string;
  jobTitle: string;
  recommendations: PlatformRecommendation[];
}

// POST /api/outreach/generate
export interface GenerateContentRequest {
  jobId: string;
  platforms: Platform[];
}

export interface GenerateContentResponse {
  jobId: string;
  platforms: Platform[];
  contents: GeneratedContent[];
}

// POST /api/outreach (create)
export interface CreateOutreachRequest {
  jobId: string;
  platforms: Platform[];
  platformContents: Record<Platform, GeneratedContent>;
  scheduledAt?: string;
  status?: OutreachStatus;
}

export interface CreateOutreachResponse {
  post: {
    id: string;
    title: string;
    status: OutreachStatus;
    platforms: Platform[];
    createdAt: string;
  };
}

// GET /api/outreach
export interface GetOutreachResponse {
  posts: OutreachPost[];
  total: number;
}

// PATCH /api/outreach (update bulk)
export interface UpdateOutreachRequest {
  ids: string[];
  status: OutreachStatus;
}

export interface UpdateOutreachResponse {
  updated: number;
}

// DELETE /api/outreach
export interface DeleteOutreachRequest {
  ids: string[];
}

export interface DeleteOutreachResponse {
  deleted: number;
}

/**
 * Job type to platform mapping
 */
export interface JobTypePlatformMapping {
  [jobType: string]: Platform[];
}

/**
 * AI Agent analysis result
 */
export interface JobAnalysis {
  type: string;
  seniority: string;
  domain: string;
}

/**
 * Platform content input for generation
 */
export interface PlatformContentInput {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  companyWebsite?: string;
  salary?: string;
  location?: string;
  remote?: string;
  benefits?: string;
}
