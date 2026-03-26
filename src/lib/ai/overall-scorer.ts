import type { OverallCandidateScore, ScoringFactor, AIServiceResponse } from '@/types/ai';

/**
 * Default scoring weights for candidate evaluation
 */
const DEFAULT_WEIGHTS = {
  resume: 0.25,
  assessment: 0.30,
  interview: 0.30,
  cultureFit: 0.15,
};

/**
 * Calculate overall candidate score with weighted factors
 */
export async function calculateOverallScore(params: {
  candidateId: string;
  jobId: string;
  resumeScore?: number;
  assessmentScore?: number;
  interviewScore?: number;
  cultureFitScore?: number;
  customWeights?: {
    resume?: number;
    assessment?: number;
    interview?: number;
    cultureFit?: number;
  };
}): Promise<AIServiceResponse<OverallCandidateScore>> {
  const startTime = Date.now();

  try {
    const weights = {
      ...DEFAULT_WEIGHTS,
      ...params.customWeights,
    };

    // Normalize weights to sum to 1
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const normalizedWeights = {
      resume: weights.resume / totalWeight,
      assessment: weights.assessment / totalWeight,
      interview: weights.interview / totalWeight,
      cultureFit: weights.cultureFit / totalWeight,
    };

    const scores = {
      resume: params.resumeScore ?? 0,
      assessment: params.assessmentScore ?? 0,
      interview: params.interviewScore ?? 0,
      cultureFit: params.cultureFitScore ?? 0,
    };

    // Count how many scores we actually have
    const availableScores = [
      params.resumeScore !== undefined,
      params.assessmentScore !== undefined,
      params.interviewScore !== undefined,
      params.cultureFitScore !== undefined,
    ].filter(Boolean).length;

    // Build weighted factors
    const weightedFactors: ScoringFactor[] = [
      {
        factor: 'Resume & Experience',
        weight: normalizedWeights.resume,
        score: scores.resume,
        weightedScore: scores.resume * normalizedWeights.resume,
        notes: params.resumeScore !== undefined
          ? `Resume scored ${scores.resume}/100`
          : 'Not yet evaluated',
      },
      {
        factor: 'Assessment Performance',
        weight: normalizedWeights.assessment,
        score: scores.assessment,
        weightedScore: scores.assessment * normalizedWeights.assessment,
        notes: params.assessmentScore !== undefined
          ? `Assessment scored ${scores.assessment}/100`
          : 'Assessment not completed',
      },
      {
        factor: 'Interview Performance',
        weight: normalizedWeights.interview,
        score: scores.interview,
        weightedScore: scores.interview * normalizedWeights.interview,
        notes: params.interviewScore !== undefined
          ? `Interview scored ${scores.interview}/100`
          : 'Interview not completed',
      },
      {
        factor: 'Culture Fit',
        weight: normalizedWeights.cultureFit,
        score: scores.cultureFit,
        weightedScore: scores.cultureFit * normalizedWeights.cultureFit,
        notes: params.cultureFitScore !== undefined
          ? `Culture fit scored ${scores.cultureFit}/100`
          : 'Not yet assessed',
      },
    ];

    // Calculate overall weighted score
    const overallScore = Math.round(
      weightedFactors.reduce((sum, f) => sum + f.weightedScore, 0)
    );

    // Determine recommendation
    let recommendation: OverallCandidateScore['recommendation'];
    if (availableScores < 2) {
      recommendation = 'MAYBE'; // Not enough data
    } else if (overallScore >= 85) {
      recommendation = 'STRONG_YES';
    } else if (overallScore >= 70) {
      recommendation = 'YES';
    } else if (overallScore >= 55) {
      recommendation = 'MAYBE';
    } else if (overallScore >= 40) {
      recommendation = 'NO';
    } else {
      recommendation = 'STRONG_NO';
    }

    // Generate summary
    const summaryParts: string[] = [];
    if (params.resumeScore !== undefined) {
      summaryParts.push(`Resume: ${scores.resume}%`);
    }
    if (params.assessmentScore !== undefined) {
      summaryParts.push(`Assessment: ${scores.assessment}%`);
    }
    if (params.interviewScore !== undefined) {
      summaryParts.push(`Interview: ${scores.interview}%`);
    }
    if (params.cultureFitScore !== undefined) {
      summaryParts.push(`Culture Fit: ${scores.cultureFit}%`);
    }

    const summary = availableScores === 0
      ? 'No evaluation data available yet.'
      : `Overall score: ${overallScore}/100 based on ${availableScores} evaluation(s). ${summaryParts.join(', ')}.`;

    // Generate next steps
    const nextSteps: string[] = [];
    if (params.resumeScore === undefined) nextSteps.push('Complete resume screening');
    if (params.assessmentScore === undefined) nextSteps.push('Send assessment to candidate');
    if (params.interviewScore === undefined) nextSteps.push('Schedule interview');
    if (params.cultureFitScore === undefined) nextSteps.push('Evaluate culture fit');

    if (recommendation === 'STRONG_YES' || recommendation === 'YES') {
      nextSteps.push('Consider extending an offer');
    } else if (recommendation === 'MAYBE') {
      nextSteps.push('Gather additional data points before deciding');
    } else {
      nextSteps.push('Consider other candidates for this position');
    }

    return {
      success: true,
      data: {
        candidateId: params.candidateId,
        jobId: params.jobId,
        resumeScore: scores.resume,
        assessmentScore: scores.assessment,
        interviewScore: scores.interview,
        cultureFitScore: scores.cultureFit,
        overallScore,
        weightedFactors,
        recommendation,
        summary,
        nextSteps,
      },
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate score',
      processingTime: Date.now() - startTime,
    };
  }
}
