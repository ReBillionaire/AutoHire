import type {
  AnswerAnalysisResult,
  AssessmentScoringResult,
  SectionScore,
  AIServiceResponse,
} from '@/types/ai';

const ANSWER_ANALYSIS_PROMPT = `You are an expert assessment evaluator. Analyze the candidate's answer to the given question.

Return a JSON object with:
- score: numeric score (0-100)
- maxScore: maximum possible score (always 100)
- feedback: detailed feedback on the answer
- isCorrect: boolean indicating if the answer is correct/satisfactory
- confidence: your confidence in the evaluation (0-1)
- keyInsights: array of key observations about the answer`;

/**
 * Analyze a single answer from an assessment
 */
export async function analyzeAnswer(
  question: string,
  answer: string,
  questionType: 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE',
  correctAnswer?: string,
  rubric?: string
): Promise<AIServiceResponse<AnswerAnalysisResult>> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback: simple scoring for multiple choice
      if (questionType === 'MULTIPLE_CHOICE' && correctAnswer) {
        const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        return {
          success: true,
          data: {
            questionId: '',
            score: isCorrect ? 100 : 0,
            maxScore: 100,
            feedback: isCorrect ? 'Correct answer.' : `Incorrect. The correct answer is: ${correctAnswer}`,
            isCorrect,
            confidence: 1,
            keyInsights: [isCorrect ? 'Answered correctly' : 'Answered incorrectly'],
          },
          processingTime: Date.now() - startTime,
        };
      }

      return {
        success: false,
        error: 'OpenAI API key not configured',
        processingTime: Date.now() - startTime,
      };
    }

    const contextParts = [
      `Question: ${question}`,
      `Question Type: ${questionType}`,
      `Candidate Answer: ${answer}`,
    ];

    if (correctAnswer) contextParts.push(`Expected Answer: ${correctAnswer}`);
    if (rubric) contextParts.push(`Evaluation Rubric: ${rubric}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ANSWER_ANALYSIS_PROMPT },
          { role: 'user', content: contextParts.join('\n\n') },
        ],
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `OpenAI API error: ${response.status}`,
        processingTime: Date.now() - startTime,
      };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content) as AnswerAnalysisResult;

    return {
      success: true,
      data: result,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze answer',
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Score an entire assessment based on individual answer results
 */
export async function scoreAssessment(
  answerResults: AnswerAnalysisResult[],
  sections?: { name: string; questionIds: string[] }[]
): Promise<AIServiceResponse<AssessmentScoringResult>> {
  const startTime = Date.now();

  try {
    const totalScore = answerResults.reduce((sum, r) => sum + r.score, 0);
    const maxPossibleScore = answerResults.reduce((sum, r) => sum + r.maxScore, 0);
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Calculate section scores
    const sectionScores: SectionScore[] = sections
      ? sections.map((section) => {
          const sectionResults = answerResults.filter((r) =>
            section.questionIds.includes(r.questionId)
          );
          const sScore = sectionResults.reduce((sum, r) => sum + r.score, 0);
          const sMax = sectionResults.reduce((sum, r) => sum + r.maxScore, 0);
          return {
            section: section.name,
            score: sScore,
            maxScore: sMax,
            percentage: sMax > 0 ? Math.round((sScore / sMax) * 100) : 0,
          };
        })
      : [
          {
            section: 'Overall',
            score: totalScore,
            maxScore: maxPossibleScore,
            percentage,
          },
        ];

    // Determine recommendation
    let recommendation: AssessmentScoringResult['recommendation'];
    if (percentage >= 90) recommendation = 'STRONG_YES';
    else if (percentage >= 75) recommendation = 'YES';
    else if (percentage >= 60) recommendation = 'MAYBE';
    else if (percentage >= 40) recommendation = 'NO';
    else recommendation = 'STRONG_NO';

    const correctCount = answerResults.filter((r) => r.isCorrect).length;

    return {
      success: true,
      data: {
        totalScore,
        maxPossibleScore,
        percentage,
        sectionScores,
        overallFeedback: `Candidate scored ${percentage}% (${correctCount}/${answerResults.length} correct). ${
          percentage >= 75
            ? 'Strong performance overall.'
            : percentage >= 50
              ? 'Moderate performance with areas for improvement.'
              : 'Below expectations. Significant gaps identified.'
        }`,
        recommendation,
      },
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to score assessment',
      processingTime: Date.now() - startTime,
    };
  }
}
