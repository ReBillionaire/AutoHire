/**
 * AI Analysis Types for AutoHire
 * Comprehensive TypeScript interfaces for all AI analysis modules
 */

// ============================================================================
// RESUME ANALYSIS TYPES
// ============================================================================

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location?: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  description: string;
  highlights: string[];
  achievements?: string[];
  technologies?: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  year: string;
  gpa?: string;
  honors?: string;
}

export interface SkillsBreakdown {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications?: string[];
}

export interface SkillMatch {
  required: string;
  found: boolean;
  evidence: string;
  confidence: number; // 0-100
}

export interface ResumeAnalysis {
  contactInfo: ContactInfo;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillsBreakdown;
  fitScore: number; // 0-100
  strengths: string[];
  gaps: string[];
  redFlags: string[];
  summary: string;
  skillMatchMatrix: SkillMatch[];
  yearsOfExperience: number;
  industryExperience: string[];
  careerTrajectory: string;
}

// ============================================================================
// VIDEO/TRANSCRIPT ANALYSIS TYPES
// ============================================================================

export interface VideoAnalysisMetrics {
  communication: number; // 0-100
  confidence: number; // 0-100
  enthusiasm: number; // 0-100
  professionalism: number; // 0-100
  clarity: number; // 0-100
  pacing: number; // 0-100
  bodyLanguage?: number; // 0-100
  eyeContact?: number; // 0-100
}

export interface KeyQuote {
  quote: string;
  timestamp?: string;
  significance: string;
  metric: keyof VideoAnalysisMetrics;
}

export interface VideoAnalysis {
  metrics: VideoAnalysisMetrics;
  overallScore: number; // 0-100
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  keyQuotes: KeyQuote[];
  recommendations: string[];
  speakingPace: string;
  vocabularyLevel: string;
  emotionalIntelligence: number; // 0-100
  transcriptLength: number; // word count
  umCount?: number;
  filler_words?: Record<string, number>;
}

// ============================================================================
// ASSESSMENT ANALYSIS TYPES
// ============================================================================

export type AssessmentType = 'skill' | 'psychometric' | 'attitude' | 'situational' | 'technical';

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'open_ended' | 'likert' | 'ranking' | 'coding';
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // seconds
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | number | string[] | Record<string, any>;
  timeSpent?: number; // seconds
  attempts?: number;
}

export interface AnswerPattern {
  pattern: string;
  evidence: string[];
  score: number; // 0-100
  interpretation: string;
}

export interface PersonalityIndicators {
  traits: Record<string, number>; // trait name -> 0-100
  patterns: AnswerPattern[];
  consistency: number; // 0-100, how consistent responses are
  authenticityScore: number; // 0-100, likelihood answer is genuine
}

export interface AssessmentAnalysis {
  assessmentType: AssessmentType;
  totalScore: number; // 0-100
  categoryScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  patterns: AnswerPattern[];
  personalityIndicators?: PersonalityIndicators;
  recommendations: string[];
  timeMetrics: {
    totalTime: number; // seconds
    averagePerQuestion: number;
    questionsAnswered: number;
    questionsSkipped: number;
  };
  suspiciousActivity: {
    detected: boolean;
    indicators: string[];
    confidence: number; // 0-100
  };
}

// ============================================================================
// DISC PROFILE TYPES
// ============================================================================

export interface DISCScores {
  dominance: number; // 0-100
  influence: number; // 0-100
  steadiness: number; // 0-100
  conscientiousness: number; // 0-100
}

export interface DISCCompatibility {
  bestWith: string[];
  challengesWith: string[];
}

export interface DISCReport {
  title: string;
  primaryDescription: string;
  communicationStyle: string;
  workStyle: string;
  strengths: string[];
  blindSpots: string[];
  teamDynamics: string;
  interviewApproach: string;
  compatibilityFactors: DISCCompatibility;
}

export interface DISCProfile {
  primary: 'D' | 'I' | 'S' | 'C';
  secondary: 'D' | 'I' | 'S' | 'C';
  scores: DISCScores;
  report: DISCReport;
}

// ============================================================================
// OVERALL SCORING TYPES
// ============================================================================

export interface WeightedScores {
  resume: number;
  assessment: number;
  video: number;
  disc: number;
}

export interface ScoringBreakdown {
  weights: {
    resume: number; // typically 30%
    assessment: number; // typically 35%
    video: number; // typically 15%
    disc: number; // typically 20%
  };
  componentScores: WeightedScores;
  overallScore: number; // 0-100
}

export interface CandidateComparison {
  strengths: string[];
  weaknesses: string[];
  uniqueQualities: string[];
  roleAlignment: number; // 0-100
  cultureFitScore: number; // 0-100
  growthPotential: number; // 0-100
}

export interface OverallScore {
  candidateId: string;
  jobId: string;
  scoring: ScoringBreakdown;
  comparison: CandidateComparison;
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  confidence: number; // 0-100
  reasoning: string;
  redFlags: string[];
  greenFlags: string[];
  nextSteps: string[];
  interviewFocusAreas: string[];
  estimatedPerformance: {
    technicalCapability: number; // 0-100
    teamIntegration: number; // 0-100
    growthTrajectory: number; // 0-100
    retentionLikelihood: number; // 0-100
  };
}

// ============================================================================
// INTERVIEW PREP TYPES
// ============================================================================

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'cultural' | 'follow_up';
  targetArea: string; // e.g., "leadership", "conflict resolution"
  difficulty: 'easy' | 'medium' | 'hard';
  rationale: string; // why this question is asked
  evaluationCriteria: string[];
  expectedAnswerLength: 'short' | 'medium' | 'long';
  scoringRubric?: string;
}

export interface InterviewPrep {
  candidateId: string;
  jobId: string;
  questions: InterviewQuestion[];
  focusAreas: {
    area: string;
    importance: 'critical' | 'important' | 'nice_to_have';
    rationale: string;
    suggestedQuestions: number;
  }[];
  conversationStarters: string[];
  redFlagsToProbe: string[];
  strengthsToExplore: string[];
  cultureFitQuestions: InterviewQuestion[];
  technicalQuestions: InterviewQuestion[];
  estimatedTotalTime: number; // minutes
  interviewerNotes: string;
}

// ============================================================================
// COMPOSITE CANDIDATE PROFILE
// ============================================================================

export interface CompositeCandidateProfile {
  id: string;
  resumeAnalysis?: ResumeAnalysis;
  videoAnalysis?: VideoAnalysis;
  assessmentAnalysis?: AssessmentAnalysis;
  discProfile?: DISCProfile;
  overallScore?: OverallScore;
  interviewPrep?: InterviewPrep;
  analysisTimestamp: Date;
  completeness: {
    hasResume: boolean;
    hasVideo: boolean;
    hasAssessment: boolean;
    hasDISC: boolean;
    allComponentsComplete: boolean;
  };
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface AnalyzeResumeRequest {
  resumeText: string;
  jobDescription: string;
}

export interface AnalyzeVideoRequest {
  transcript: string;
  videoUrl?: string;
  duration?: number;
  jobDescription: string;
}

export interface AnalyzeAnswersRequest {
  answers: AssessmentAnswer[];
  assessmentType: AssessmentType;
  jobContext: string;
  questions?: AssessmentQuestion[];
}

export interface OverallScoreRequest {
  candidateId: string;
  jobId: string;
  resumeAnalysis: ResumeAnalysis;
  videoAnalysis?: VideoAnalysis;
  assessmentAnalysis?: AssessmentAnalysis;
  discProfile?: DISCProfile;
}

export interface InterviewPrepRequest {
  candidateProfile: CompositeCandidateProfile;
  jobDescription: string;
  jobTitle: string;
  totalQuestions?: number;
}

export interface AIAnalysisResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  processingTime: number; // ms
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AIAnalysisError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIAnalysisError';
  }
}
