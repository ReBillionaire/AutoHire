// AI Module Type Definitions for AutoHire

// ─── Resume Analysis ─────────────────────────────────────────────
export interface ResumeAnalysisResult {
  candidateInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  languages: string[];
  overallScore: number;
  strengths: string[];
  gaps: string[];
  aiTags: string[];
}

export interface ExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  field: string;
  graduationDate?: string;
  gpa?: string;
}

// ─── Assessment & Answer Analysis ────────────────────────────────
export interface AnswerAnalysisResult {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  isCorrect: boolean;
  confidence: number;
  keyInsights: string[];
}

export interface AssessmentScoringResult {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  sectionScores: SectionScore[];
  overallFeedback: string;
  recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
}

export interface SectionScore {
  section: string;
  score: number;
  maxScore: number;
  percentage: number;
}

// ─── DISC Personality Analysis ───────────────────────────────────
export interface DISCProfile {
  dominance: number;
  influence: number;
  steadiness: number;
  conscientiousness: number;
  primaryType: 'D' | 'I' | 'S' | 'C';
  secondaryType?: 'D' | 'I' | 'S' | 'C';
  summary: string;
  workStyle: string;
  communicationTips: string[];
  strengths: string[];
  challenges: string[];
  idealRoles: string[];
  teamDynamics: string;
}

// ─── Interview Preparation ───────────────────────────────────────
export interface InterviewPrepResult {
  candidateSummary: string;
  strengths: string[];
  areasToExplore: string[];
  suggestedQuestions: InterviewQuestion[];
  keyPointsToProbe: ProbePoint[];
  preparationTips: string[];
  redFlags: string[];
  greenFlags: string[];
}

export interface InterviewQuestion {
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'cultural' | 'growth';
  rationale: string;
  followUps: string[];
  lookFor: string[];
}

export interface ProbePoint {
  area: string;
  reason: string;
  suggestedApproach: string;
  category: string;
}

// ─── Outreach & Email Generation ─────────────────────────────────
export interface OutreachEmailResult {
  subject: string;
  body: string;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'formal';
  personalizationPoints: string[];
  callToAction: string;
}

export interface OutreachCampaign {
  candidateId: string;
  emails: OutreachEmailResult[];
  sequenceType: 'initial' | 'follow_up' | 'interview_invite' | 'rejection' | 'offer';
  scheduledAt?: Date;
}

// ─── Overall Candidate Scoring ───────────────────────────────────
export interface OverallCandidateScore {
  candidateId: string;
  jobId: string;
  resumeScore: number;
  assessmentScore: number;
  interviewScore: number;
  cultureFitScore: number;
  overallScore: number;
  weightedFactors: ScoringFactor[];
  recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
  summary: string;
  nextSteps: string[];
}

export interface ScoringFactor {
  factor: string;
  weight: number;
  score: number;
  weightedScore: number;
  notes: string;
}

// ─── Video Interview Analysis ────────────────────────────────────
export interface VideoAnalysisResult {
  transcription: string;
  duration: number;
  sentimentAnalysis: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;
    segments: SentimentSegment[];
  };
  communicationScore: number;
  keyTopics: string[];
  responseQuality: ResponseQuality[];
  bodyLanguageNotes?: string[];
  overallImpression: string;
  flags: string[];
}

export interface SentimentSegment {
  startTime: number;
  endTime: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  text: string;
}

export interface ResponseQuality {
  questionIndex: number;
  clarity: number;
  relevance: number;
  depth: number;
  overallQuality: number;
  notes: string;
}

// ─── Common AI Config ────────────────────────────────────────────
export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  provider: 'openai' | 'anthropic' | 'google';
}

export interface AIServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  processingTime: number;
}
