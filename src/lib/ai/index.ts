/**
 * AI Analysis Engine - Export All Public Functions
 * Central hub for all AI analysis capabilities
 */

// Resume Analysis
export {
  analyzeResume,
  scoreResumeQuality,
  extractAchievements,
} from './resume-analyzer';

// Video Analysis
export {
  analyzeVideoTranscript,
  scoreSpecificMetrics,
  generateTargetedFeedback,
} from './video-analyzer';

// Assessment Answer Analysis
export {
  analyzeAssessmentAnswers,
  quickScoreAnswers,
  detectSuspiciousActivity,
} from './answer-analyzer';

// DISC Profile Analysis
export {
  analyzeResponses,
  calculateDISCScores,
  determinePrimaryProfile,
  generateDISCReport,
  generateCompleteDISCProfile,
} from './disc-analyzer';

// Overall Scoring
export {
  calculateOverallScore,
  compareMultipleCandidates,
} from './overall-scorer';

// Interview Preparation
export {
  generateInterviewQuestions,
} from './interview-prep';

// AI Clients
export { openai, anthropic } from '../ai-clients';
