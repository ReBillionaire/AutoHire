/**
 * Assessment Answer Analyzer - Analyzes candidate assessment responses
 * Uses Anthropic Claude for nuanced behavioral and skill assessment
 */

import { anthropic } from '../ai-clients';
import {
  AssessmentAnalysis,
  AssessmentType,
  AssessmentAnswer,
  AssessmentQuestion,
  AnswerPattern,
  PersonalityIndicators,
  AIAnalysisError,
} from '@/types/ai';

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
 * Format answers for analysis
 */
function formatAnswersForAnalysis(
  answers: AssessmentAnswer[],
  questions?: AssessmentQuestion[]
): string {
  const questionsMap = new Map(questions?.map((q) => [q.id, q]) ?? []);

  return answers
    .map((answer) => {
      const question = questionsMap.get(answer.questionId);
      const questionText = question?.question || `Question ${answer.questionId}`;
      const answerText = Array.isArray(answer.answer)
        ? answer.answer.join(', ')
        : typeof answer.answer === 'object'
          ? JSON.stringify(answer.answer)
          : String(answer.answer);

      return `Q: ${questionText}\nA: ${answerText}${answer.timeSpent ? `\nTime spent: ${answer.timeSpent}s` : ''}`;
    })
    .join('\n\n');
}

/**
 * Validate and normalize assessment analysis
 */
function validateAndNormalizeAnalysis(data: any, assessmentType: AssessmentType): AssessmentAnalysis {
  const categoryScores = data.categoryScores || {};
  if (typeof categoryScores !== 'object' || Array.isArray(categoryScores)) {
    // Fix if it's malformed
    Object.keys(categoryScores).forEach((key) => {
      categoryScores[key] = Math.min(100, Math.max(0, Number(categoryScores[key]) || 0));
    });
  }

  const patterns: AnswerPattern[] = Array.isArray(data.patterns)
    ? data.patterns
        .slice(0, 5)
        .map((p: any) => ({
          pattern: p.pattern || '',
          evidence: Array.isArray(p.evidence) ? p.evidence : [],
          score: Math.min(100, Math.max(0, Number(p.score) || 50)),
          interpretation: p.interpretation || '',
        }))
    : [];

  const personalityIndicators: PersonalityIndicators | undefined = data.personalityIndicators
    ? {
        traits: data.personalityIndicators.traits || {},
        patterns:
          Array.isArray(data.personalityIndicators.patterns) &&
          Array.isArray(data.personalityIndicators.patterns[0]?.pattern)
            ? data.personalityIndicators.patterns
            : [],
        consistency: Math.min(
          100,
          Math.max(0, Number(data.personalityIndicators.consistency) || 50)
        ),
        authenticityScore: Math.min(
          100,
          Math.max(0, Number(data.personalityIndicators.authenticityScore) || 75)
        ),
      }
    : undefined;

  return {
    assessmentType,
    totalScore: Math.min(100, Math.max(0, Number(data.totalScore) || 0)),
    categoryScores,
    strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 5) : [],
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses.slice(0, 5) : [],
    patterns,
    personalityIndicators,
    recommendations: Array.isArray(data.recommendations) ? data.recommendations.slice(0, 5) : [],
    timeMetrics: {
      totalTime: Math.max(0, Number(data.timeMetrics?.totalTime) || 0),
      averagePerQuestion: Math.max(0, Number(data.timeMetrics?.averagePerQuestion) || 0),
      questionsAnswered: Math.max(0, Number(data.timeMetrics?.questionsAnswered) || 0),
      questionsSkipped: Math.max(0, Number(data.timeMetrics?.questionsSkipped) || 0),
    },
    suspiciousActivity: {
      detected: Boolean(data.suspiciousActivity?.detected),
      indicators: Array.isArray(data.suspiciousActivity?.indicators)
        ? data.suspiciousActivity.indicators
        : [],
      confidence: Math.min(100, Math.max(0, Number(data.suspiciousActivity?.confidence) || 0)),
    },
  };
}

/**
 * Build prompt based on assessment type
 */
function buildAnalysisPrompt(assessmentType: AssessmentType, jobContext: string): string {
  const basePrompt = `You are an expert assessment analyst and organizational psychologist. Analyze the candidate's assessment responses carefully.

Job Context: ${jobContext}

Provide a comprehensive analysis in valid JSON format (no markdown code blocks).`;

  const typeSpecificPrompts = {
    skill: `For this SKILL ASSESSMENT, evaluate:
1. Technical competency in each skill area
2. Depth of knowledge demonstrated
3. Problem-solving approach
4. Practical application examples
5. Score each skill category on 0-100
6. Identify strengths and gaps

Return JSON:
{
  "totalScore": number (0-100),
  "categoryScores": {
    "[skill_name]": number,
    ...
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "patterns": [
    {
      "pattern": "identified pattern",
      "evidence": ["quote or example"],
      "score": number,
      "interpretation": "what this means"
    }
  ],
  "recommendations": ["specific training areas"],
  "timeMetrics": {
    "totalTime": number,
    "averagePerQuestion": number,
    "questionsAnswered": number,
    "questionsSkipped": number
  },
  "suspiciousActivity": {
    "detected": boolean,
    "indicators": ["indicator"],
    "confidence": number
  }
}`,

    psychometric: `For this PSYCHOMETRIC ASSESSMENT, evaluate:
1. Personality dimensions revealed
2. Work style preferences
3. Decision-making patterns
4. Interpersonal tendencies
5. Consistency of responses (reliability)
6. Detect any response patterns suggesting answers aren't genuine

Return JSON:
{
  "totalScore": number (0-100),
  "categoryScores": {
    "extroversion": number,
    "conscientiousness": number,
    "agreeableness": number,
    "neuroticism": number,
    "openness": number
  },
  "strengths": ["personality strength"],
  "weaknesses": ["potential limitation"],
  "patterns": [
    {
      "pattern": "behavioral pattern",
      "evidence": ["example"],
      "score": number,
      "interpretation": "meaning"
    }
  ],
  "personalityIndicators": {
    "traits": {
      "[trait_name]": number (0-100)
    },
    "patterns": [],
    "consistency": number (0-100, how consistent responses are),
    "authenticityScore": number (0-100, likelihood answers are genuine)
  },
  "recommendations": ["coaching area"],
  "timeMetrics": {
    "totalTime": number,
    "averagePerQuestion": number,
    "questionsAnswered": number,
    "questionsSkipped": number
  },
  "suspiciousActivity": {
    "detected": boolean,
    "indicators": ["potential issue"],
    "confidence": number
  }
}`,

    attitude: `For this ATTITUDE/VALUES ASSESSMENT, evaluate:
1. Alignment with stated company values
2. Work ethic and motivation
3. Integrity and ethics indicators
4. Growth mindset vs fixed mindset
5. Team orientation vs individualism
6. Red flags for cultural fit issues

Return JSON:
{
  "totalScore": number (0-100),
  "categoryScores": {
    "values_alignment": number,
    "work_ethic": number,
    "integrity": number,
    "growth_mindset": number,
    "cultural_fit": number
  },
  "strengths": ["attitude strength"],
  "weaknesses": ["potential concern"],
  "patterns": [
    {
      "pattern": "attitude pattern",
      "evidence": ["quote"],
      "score": number,
      "interpretation": "what this reveals"
    }
  ],
  "recommendations": ["cultural fit note"],
  "timeMetrics": {
    "totalTime": number,
    "averagePerQuestion": number,
    "questionsAnswered": number,
    "questionsSkipped": number
  },
  "suspiciousActivity": {
    "detected": boolean,
    "indicators": ["concern"],
    "confidence": number
  }
}`,

    situational: `For this SITUATIONAL JUDGMENT TEST, evaluate:
1. Problem-solving approach
2. Decision quality and reasoning
3. Prioritization skills
4. Handling of conflicting priorities
5. Communication in difficult situations
6. Ethical considerations in decisions

Return JSON:
{
  "totalScore": number (0-100),
  "categoryScores": {
    "problem_solving": number,
    "decision_quality": number,
    "prioritization": number,
    "communication": number,
    "ethics": number
  },
  "strengths": ["strength"],
  "weaknesses": ["weakness"],
  "patterns": [
    {
      "pattern": "decision pattern",
      "evidence": ["scenario and response"],
      "score": number,
      "interpretation": "quality assessment"
    }
  ],
  "recommendations": ["development area"],
  "timeMetrics": {
    "totalTime": number,
    "averagePerQuestion": number,
    "questionsAnswered": number,
    "questionsSkipped": number
  },
  "suspiciousActivity": {
    "detected": boolean,
    "indicators": ["indicator"],
    "confidence": number
  }
}`,

    technical: `For this TECHNICAL ASSESSMENT, evaluate:
1. Technical depth and breadth
2. Problem-solving methodology
3. Code quality (if applicable)
4. Understanding of fundamentals
5. Practical implementation capability
6. Handling of edge cases

Return JSON:
{
  "totalScore": number (0-100),
  "categoryScores": {
    "fundamentals": number,
    "problem_solving": number,
    "implementation": number,
    "code_quality": number,
    "advanced_concepts": number
  },
  "strengths": ["technical strength"],
  "weaknesses": ["knowledge gap"],
  "patterns": [
    {
      "pattern": "technical pattern",
      "evidence": ["code snippet or explanation"],
      "score": number,
      "interpretation": "technical assessment"
    }
  ],
  "recommendations": ["skill development"],
  "timeMetrics": {
    "totalTime": number,
    "averagePerQuestion": number,
    "questionsAnswered": number,
    "questionsSkipped": number
  },
  "suspiciousActivity": {
    "detected": boolean,
    "indicators": ["cheating indicator"],
    "confidence": number
  }
}`,
  };

  return `${basePrompt}\n\n${typeSpecificPrompts[assessmentType]}`;
}

/**
 * Analyze assessment answers
 * @param answers - Array of assessment answers
 * @param assessmentType - Type of assessment
 * @param jobContext - Job context for evaluation
 * @param questions - Optional question details for context
 * @returns Detailed assessment analysis
 */
export async function analyzeAssessmentAnswers(
  answers: AssessmentAnswer[],
  assessmentType: AssessmentType,
  jobContext: string,
  questions?: AssessmentQuestion[]
): Promise<AssessmentAnalysis> {
  if (!answers || answers.length === 0) {
    throw new AIAnalysisError('INVALID_INPUT', 'Assessment answers cannot be empty');
  }

  if (!jobContext || !jobContext.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Job context cannot be empty');
  }

  const formattedAnswers = formatAnswersForAnalysis(answers, questions);
  const prompt = buildAnalysisPrompt(assessmentType, jobContext);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nCandidateAssessmentResponses:\n${formattedAnswers}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new AIAnalysisError('API_ERROR', 'Unexpected response type from Claude');
    }

    const cleaned = extractJSON(content.text);
    const parsed = JSON.parse(cleaned);
    const validated = validateAndNormalizeAnalysis(parsed, assessmentType);

    return validated;
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new AIAnalysisError(
        'PARSING_ERROR',
        'Failed to parse Claude response as JSON',
        error.message
      );
    }

    throw new AIAnalysisError(
      'API_ERROR',
      'Failed to analyze assessment answers',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Quick scoring without full analysis
 */
export async function quickScoreAnswers(
  answers: AssessmentAnswer[],
  assessmentType: AssessmentType
): Promise<number> {
  if (!answers || answers.length === 0) {
    throw new AIAnalysisError('INVALID_INPUT', 'Assessment answers cannot be empty');
  }

  const formattedAnswers = formatAnswersForAnalysis(answers);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Score these ${assessmentType} assessment answers on a scale of 0-100. Consider completeness, quality, and demonstration of relevant competencies.

Return ONLY a JSON object: {"score": number}

ANSWERS:
${formattedAnswers}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new AIAnalysisError('API_ERROR', 'Unexpected response type from Claude');
    }

    const cleaned = extractJSON(content.text);
    const parsed = JSON.parse(cleaned);
    return Math.min(100, Math.max(0, Number(parsed.score) || 0));
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    throw new AIAnalysisError(
      'QUICK_SCORE_ERROR',
      'Failed to quickly score answers',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Detect if responses appear genuine or suspicious
 */
export async function detectSuspiciousActivity(
  answers: AssessmentAnswer[],
  questions?: AssessmentQuestion[]
): Promise<{
  suspicious: boolean;
  indicators: string[];
  confidence: number;
  recommendation: string;
}> {
  if (!answers || answers.length === 0) {
    throw new AIAnalysisError('INVALID_INPUT', 'Assessment answers cannot be empty');
  }

  const formattedAnswers = formatAnswersForAnalysis(answers, questions);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Analyze these assessment responses for signs of suspicious activity like:
- Copied answers from internet
- AI-generated responses (unnaturally polished or formatted)
- Inconsistent quality (some answers perfect, others poor)
- Answers that don't match the person's background/experience
- Suspiciously short or evasive responses to difficult questions
- Pattern of always choosing the "best" answer without nuance
- Timing indicators suggesting collaboration or cheating

Return JSON:
{
  "suspicious": boolean,
  "indicators": ["specific indicator"],
  "confidence": number (0-100),
  "recommendation": "whether to flag for review or proceed"
}

ANSWERS:
${formattedAnswers}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new AIAnalysisError('API_ERROR', 'Unexpected response type from Claude');
    }

    const cleaned = extractJSON(content.text);
    const parsed = JSON.parse(cleaned);

    return {
      suspicious: Boolean(parsed.suspicious),
      indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
      recommendation: parsed.recommendation || 'Proceed with normal review process',
    };
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    throw new AIAnalysisError(
      'FRAUD_DETECTION_ERROR',
      'Failed to detect suspicious activity',
      error instanceof Error ? error.message : String(error)
    );
  }
}
