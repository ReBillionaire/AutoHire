// AI Module - Barrel Export
// Central export point for all AI services

export { analyzeResume } from './resume-analyzer';
export { analyzeAnswer, scoreAssessment } from './answer-analyzer';
export { analyzeDISCProfile } from './disc-analyzer';
export { generateInterviewPrep } from './interview-prep';
export { generateOutreachEmail, generateOutreachSequence } from './outreach-agent';
export { calculateOverallScore } from './overall-scorer';
export { analyzeVideoInterview } from './video-analyzer';

// Re-export all types
export type {
  ResumeAnalysisResult,
  ExperienceEntry,
  EducationEntry,
  AnswerAnalysisResult,
  AssessmentScoringResult,
  SectionScore,
  DISCProfile,
  InterviewPrepResult,
  InterviewQuestion,
  ProbePoint,
  OutreachEmailResult,
  OutreachCampaign,
  OverallCandidateScore,
  ScoringFactor,
  VideoAnalysisResult,
  SentimentSegment,
  ResponseQuality,
  AIConfig,
  AIServiceResponse,
} from '@/types/ai';

// Default AI configuration
export const DEFAULT_AI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 4096,
  provider: 'openai' as const,
};

// AI service status check
export async function checkAIServiceHealth(): Promise<{
  available: boolean;
  provider: string;
  latency?: number;
}> {
  const start = Date.now();
  try {
    // Check if API key is configured
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { available: false, provider: 'none' };
    }

    const provider = process.env.OPENAI_API_KEY ? 'openai' : 'anthropic';
    return {
      available: true,
      provider,
      latency: Date.now() - start,
    };
  } catch {
    return { available: false, provider: 'unknown' };
  }
}
