/**
 * Overall Scorer - Composite candidate scoring across all evaluation dimensions
 * Weights: Resume 30%, Assessment 35%, Video 15%, DISC 20%
 */

import { openai } from '../ai-clients';
import {
  ResumeAnalysis,
  VideoAnalysis,
  AssessmentAnalysis,
  DISCProfile,
  OverallScore,
  WeightedScores,
  ScoringBreakdown,
  CandidateComparison,
  AIAnalysisError,
} from '@/types/ai';

const SCORING_WEIGHTS = {
  resume: 0.3,
  assessment: 0.35,
  video: 0.15,
  disc: 0.2,
};

/**
 * Extract JSON from response that might be wrapped in markdown
 */
function extractJSON(response: string): string {
  let cleaned = response.trim();

  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }

  return cleaned;
}

/**
 * Calculate weighted component score
 */
function calculateWeightedScore(
  resumeScore: number,
  assessmentScore: number,
  videoScore: number,
  discScore: number
): number {
  const weighted =
    resumeScore * SCORING_WEIGHTS.resume +
    assessmentScore * SCORING_WEIGHTS.assessment +
    videoScore * SCORING_WEIGHTS.video +
    discScore * SCORING_WEIGHTS.disc;

  return Math.round(weighted);
}

/**
 * Calculate resume component score
 */
function calculateResumeScore(analysis: ResumeAnalysis): number {
  // Base fit score
  let score = analysis.fitScore * 0.4;

  // Adjust based on experience level (0.3 weight)
  const yearsScore = Math.min(100, (analysis.yearsOfExperience / 10) * 100);
  score += yearsScore * 0.3;

  // Adjust based on skill gaps (0.2 weight)
  const gapPenalty = (analysis.gaps.length * 5) / Math.max(1, analysis.skillMatchMatrix.length);
  const skillScore = Math.max(0, 100 - gapPenalty);
  score += skillScore * 0.2;

  // Adjust based on red flags (0.1 weight)
  const flagPenalty = (analysis.redFlags.length * 10) / Math.max(1, 3);
  const flagScore = Math.max(0, 100 - flagPenalty);
  score += flagScore * 0.1;

  return Math.round(Math.min(100, score));
}

/**
 * Calculate assessment component score
 */
function calculateAssessmentScore(analysis: AssessmentAnalysis): number {
  // Use total score as base
  let score = analysis.totalScore * 0.6;

  // Add category average (0.3 weight)
  const categoryScores = Object.values(analysis.categoryScores);
  const categoryAverage =
    categoryScores.length > 0
      ? categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
      : 50;
  score += categoryAverage * 0.3;

  // Adjust for suspicious activity (0.1 weight)
  const suspiciousPenalty = analysis.suspiciousActivity.detected
    ? (analysis.suspiciousActivity.confidence / 100) * 30
    : 0;
  score -= suspiciousPenalty * 0.1;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Calculate video component score
 */
function calculateVideoScore(analysis: VideoAnalysis): number {
  // Average all metrics
  const metrics = Object.values(analysis.metrics);
  const metricsAverage = metrics.reduce((a, b) => a + b, 0) / metrics.length;

  // Use overall score as primary (0.5 weight)
  let score = analysis.overallScore * 0.5;

  // Use metrics average (0.4 weight)
  score += metricsAverage * 0.4;

  // Adjust for emotional intelligence (0.1 weight)
  score += analysis.emotionalIntelligence * 0.1;

  return Math.round(Math.min(100, score));
}

/**
 * Calculate DISC component score
 * In DISC, all types can be equally valuable; score is about fit for role
 */
function calculateDISCScore(profile: DISCProfile): number {
  // DISC isn't pass/fail - it's about fit and self-awareness
  // Score based on how distinct the profile is (self-aware people have more differentiated scores)
  const scores = Object.values(profile.scores);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  // More differentiated = more self-aware = higher score
  const differentiation = maxScore - minScore;
  const awarenessScore = Math.min(100, 50 + differentiation);

  return Math.round(awarenessScore);
}

/**
 * Determine recommendation level
 */
function determineRecommendation(
  overallScore: number
): 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no' {
  if (overallScore >= 85) return 'strong_yes';
  if (overallScore >= 70) return 'yes';
  if (overallScore >= 50) return 'maybe';
  if (overallScore >= 35) return 'no';
  return 'strong_no';
}

/**
 * Build comparison using OpenAI
 */
async function buildComparison(
  resumeAnalysis: ResumeAnalysis,
  videoAnalysis: VideoAnalysis | undefined,
  assessmentAnalysis: AssessmentAnalysis | undefined,
  discProfile: DISCProfile | undefined,
  jobDescription: string
): Promise<CandidateComparison> {
  const prompt = `Analyze this candidate profile against the job requirements and provide:
1. Key strengths relative to the role
2. Key weaknesses relative to the role
3. Unique qualities that stand out
4. Role alignment score (0-100): how well suited for this specific role
5. Cultural fit score (0-100): based on personality and work style
6. Growth potential score (0-100): ability to grow into and beyond role

Job Requirements:
${jobDescription}

Candidate Profile:
Resume: ${JSON.stringify(resumeAnalysis, null, 2)}
${videoAnalysis ? `\nCommunication: ${JSON.stringify(videoAnalysis, null, 2)}` : ''}
${assessmentAnalysis ? `\nAssessment: ${JSON.stringify(assessmentAnalysis, null, 2)}` : ''}
${discProfile ? `\nDISC: ${JSON.stringify(discProfile, null, 2)}` : ''}

Return ONLY valid JSON:
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "uniqueQualities": ["string"],
  "roleAlignment": number,
  "cultureFitScore": number,
  "growthPotential": number
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const cleaned = extractJSON(content);
    const parsed = JSON.parse(cleaned);

    return {
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      uniqueQualities: Array.isArray(parsed.uniqueQualities) ? parsed.uniqueQualities : [],
      roleAlignment: Math.min(100, Math.max(0, Number(parsed.roleAlignment) || 0)),
      cultureFitScore: Math.min(100, Math.max(0, Number(parsed.cultureFitScore) || 0)),
      growthPotential: Math.min(100, Math.max(0, Number(parsed.growthPotential) || 0)),
    };
  } catch (error) {
    // Return default comparison on error
    return {
      strengths: [],
      weaknesses: [],
      uniqueQualities: [],
      roleAlignment: 50,
      cultureFitScore: 50,
      growthPotential: 50,
    };
  }
}

/**
 * Build detailed reasoning for recommendation
 */
function buildReasoning(
  overallScore: number,
  componentScores: WeightedScores,
  comparison: CandidateComparison,
  resumeAnalysis: ResumeAnalysis
): string {
  const resumeStrength = componentScores.resume >= 70 ? 'strong' : 'weak';
  const assessmentStrength = componentScores.assessment >= 70 ? 'strong' : 'weak';
  const videoStrength = componentScores.video >= 70 ? 'strong' : 'weak';

  const roleAlignmentText =
    comparison.roleAlignment >= 80
      ? 'exceptional role fit'
      : comparison.roleAlignment >= 60
        ? 'good role fit'
        : 'moderate role fit';

  const cultureFitText =
    comparison.cultureFitScore >= 80
      ? 'strong cultural alignment'
      : comparison.cultureFitScore >= 60
        ? 'adequate cultural fit'
        : 'potential cultural fit concerns';

  return `This candidate demonstrates ${resumeStrength} resume credentials (${componentScores.resume}/100) with ${resumeAnalysis.yearsOfExperience} years of relevant experience. Their assessment performance shows ${assessmentStrength} competency (${componentScores.assessment}/100). Communication abilities are ${videoStrength} (${componentScores.video}/100). Overall, they present ${roleAlignmentText} and ${cultureFitText}. The composite score of ${overallScore}/100 suggests this candidate is a ${overallScore >= 70 ? 'strong' : 'moderate'} prospect.`;
}

/**
 * Identify red and green flags
 */
function identifyFlags(
  resumeAnalysis: ResumeAnalysis,
  assessmentAnalysis: AssessmentAnalysis | undefined,
  videoAnalysis: VideoAnalysis | undefined
): { redFlags: string[]; greenFlags: string[] } {
  const redFlags: string[] = [...resumeAnalysis.redFlags];
  const greenFlags: string[] = [...resumeAnalysis.strengths];

  if (assessmentAnalysis?.suspiciousActivity.detected) {
    redFlags.push(
      `Assessment integrity concern (${assessmentAnalysis.suspiciousActivity.confidence}% confidence)`
    );
  }

  if (videoAnalysis) {
    if (videoAnalysis.metrics.confidence < 40) {
      redFlags.push('Low confidence level in video response');
    }
    if (videoAnalysis.metrics.professionalism < 40) {
      redFlags.push('Professionalism concerns in communication');
    }

    if (videoAnalysis.metrics.enthusiasm > 85) {
      greenFlags.push('Exceptional enthusiasm and energy');
    }
    if (videoAnalysis.metrics.communication > 85) {
      greenFlags.push('Excellent communication skills');
    }
  }

  return { redFlags: [...new Set(redFlags)], greenFlags: [...new Set(greenFlags)] };
}

/**
 * Determine next steps based on score
 */
function determineNextSteps(
  overallScore: number,
  recommendation: string,
  componentScores: WeightedScores
): string[] {
  const steps: string[] = [];

  if (overallScore >= 80) {
    steps.push('Schedule final interview round');
    steps.push('Conduct reference checks');
    steps.push('Prepare offer details');
  } else if (overallScore >= 65) {
    steps.push('Schedule second interview');
    if (componentScores.video < 60) {
      steps.push('Assess communication skills in live conversation');
    }
    if (componentScores.assessment < 60) {
      steps.push('Conduct skills assessment or technical evaluation');
    }
  } else if (overallScore >= 50) {
    steps.push('Request additional clarification on specific areas');
    steps.push('Consider for future opportunities if stronger candidates emerge');
  } else {
    steps.push('Pass on this candidate');
    steps.push('Maintain in talent pool for future relevant roles');
  }

  return steps;
}

/**
 * Determine interview focus areas
 */
function determineInterviewFocusAreas(
  resumeAnalysis: ResumeAnalysis,
  componentScores: WeightedScores
): string[] {
  const focusAreas: string[] = [];

  if (componentScores.resume < 70) {
    focusAreas.push('Clarify experience gaps and skill development');
  }

  if (resumeAnalysis.redFlags.length > 0) {
    focusAreas.push('Address employment gaps and transitions');
  }

  if (componentScores.video < 70) {
    focusAreas.push('Assess interpersonal and communication skills');
  }

  if (componentScores.assessment < 70) {
    focusAreas.push('Probe technical competency and problem-solving approach');
  }

  focusAreas.push('Assess alignment with team and company culture');
  focusAreas.push('Discuss growth trajectory and career aspirations');

  return focusAreas;
}

/**
 * Calculate overall candidate score
 */
export async function calculateOverallScore(
  candidateId: string,
  jobId: string,
  resumeAnalysis: ResumeAnalysis,
  videoAnalysis?: VideoAnalysis,
  assessmentAnalysis?: AssessmentAnalysis,
  discProfile?: DISCProfile,
  jobDescription?: string
): Promise<OverallScore> {
  // Calculate component scores
  const resumeScore = calculateResumeScore(resumeAnalysis);
  const assessmentScore = assessmentAnalysis ? calculateAssessmentScore(assessmentAnalysis) : 50;
  const videoScore = videoAnalysis ? calculateVideoScore(videoAnalysis) : 50;
  const discScore = discProfile ? calculateDISCScore(discProfile) : 50;

  // Calculate weighted overall score
  const componentScores: WeightedScores = {
    resume: resumeScore,
    assessment: assessmentScore,
    video: videoScore,
    disc: discScore,
  };

  const overallScore = calculateWeightedScore(
    resumeScore,
    assessmentScore,
    videoScore,
    discScore
  );

  // Determine recommendation
  const recommendation = determineRecommendation(overallScore);

  // Calculate confidence
  const componentCount = [resumeAnalysis, videoAnalysis, assessmentAnalysis, discProfile].filter(
    Boolean
  ).length;
  const baseConfidence = Math.min(100, 60 + componentCount * 10);
  const qualityAdjustment = Math.abs(resumeScore - assessmentScore) > 20 ? -10 : 0;
  const confidence = Math.max(40, Math.min(95, baseConfidence + qualityAdjustment));

  // Build comparison
  const comparison = await buildComparison(
    resumeAnalysis,
    videoAnalysis,
    assessmentAnalysis,
    discProfile,
    jobDescription || 'No job description provided'
  );

  // Identify flags
  const { redFlags, greenFlags } = identifyFlags(
    resumeAnalysis,
    assessmentAnalysis,
    videoAnalysis
  );

  // Determine next steps
  const nextSteps = determineNextSteps(overallScore, recommendation, componentScores);

  // Determine interview focus areas
  const interviewFocusAreas = determineInterviewFocusAreas(resumeAnalysis, componentScores);

  // Build reasoning
  const reasoning = buildReasoning(overallScore, componentScores, comparison, resumeAnalysis);

  // Calculate performance estimates
  const estimatedPerformance = {
    technicalCapability: assessmentScore,
    teamIntegration: discProfile
      ? Math.round((100 - Math.abs(discProfile.scores.dominance - 50) / 50) * 100)
      : 50,
    growthTrajectory: Math.round((resumeAnalysis.yearsOfExperience / 15) * 100),
    retentionLikelihood: discProfile ? discProfile.scores.steadiness : 50,
  };

  const scoring: ScoringBreakdown = {
    weights: SCORING_WEIGHTS,
    componentScores,
    overallScore,
  };

  return {
    candidateId,
    jobId,
    scoring,
    comparison,
    recommendation,
    confidence,
    reasoning,
    redFlags,
    greenFlags,
    nextSteps,
    interviewFocusAreas,
    estimatedPerformance,
  };
}

/**
 * Compare multiple candidates
 */
export async function compareMultipleCandidates(
  candidateScores: OverallScore[]
): Promise<{
  rankings: Array<{ candidateId: string; rank: number; score: number; recommendation: string }>;
  topCandidates: string[];
  analysis: string;
}> {
  const sorted = [...candidateScores].sort(
    (a, b) => b.scoring.overallScore - a.scoring.overallScore
  );

  const rankings = sorted.map((score, index) => ({
    candidateId: score.candidateId,
    rank: index + 1,
    score: score.scoring.overallScore,
    recommendation: score.recommendation,
  }));

  const topCandidates = sorted
    .filter((s) => s.recommendation === 'strong_yes' || s.recommendation === 'yes')
    .slice(0, 3)
    .map((s) => s.candidateId);

  const topScore = sorted[0];
  const analysis =
    sorted.length > 1
      ? `Top candidate (${topScore.candidateId}) scores ${topScore.scoring.overallScore}/100 vs second place (${sorted[1]?.candidateId}) at ${sorted[1]?.scoring.overallScore}/100. Difference of ${topScore.scoring.overallScore - (sorted[1]?.scoring.overallScore || 0)} points suggests ${topScore.scoring.overallScore - (sorted[1]?.scoring.overallScore || 0) > 10 ? 'clear differentiation' : 'candidates are competitive'}.`
      : 'Only one candidate provided for comparison.';

  return { rankings, topCandidates, analysis };
}
