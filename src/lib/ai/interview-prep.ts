import type { InterviewPrepResult, InterviewQuestion, ProbePoint, AIServiceResponse } from '@/types/ai';

const INTERVIEW_PREP_PROMPT = `You are an expert interview coach helping hiring managers prepare for candidate interviews.

Based on the candidate's resume, job description, and any assessment results, generate a comprehensive interview preparation guide.

Return a JSON object with:
- candidateSummary: brief overview of the candidate
- strengths: array of candidate strengths relevant to the role
- areasToExplore: array of areas that need further investigation
- suggestedQuestions: array of { question, category, rationale, followUps, lookFor }
- keyPointsToProbe: array of { area, reason, suggestedApproach, category }
- preparationTips: array of general tips for this interview
- redFlags: array of potential concerns
- greenFlags: array of positive indicators`;

/**
 * Generate interview preparation materials for a candidate
 */
export async function generateInterviewPrep(params: {
  candidateName: string;
  resumeText?: string;
  jobTitle: string;
  jobDescription?: string;
  interviewType: string;
  assessmentScore?: number;
  previousInterviewNotes?: string;
}): Promise<AIServiceResponse<InterviewPrepResult>> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return a well-structured fallback
      return {
        success: true,
        data: generateFallbackPrep(params),
        processingTime: Date.now() - startTime,
      };
    }

    const contextParts = [
      `Candidate: ${params.candidateName}`,
      `Position: ${params.jobTitle}`,
      `Interview Type: ${params.interviewType}`,
    ];

    if (params.resumeText) contextParts.push(`Resume:\n${params.resumeText}`);
    if (params.jobDescription) contextParts.push(`Job Description:\n${params.jobDescription}`);
    if (params.assessmentScore !== undefined) contextParts.push(`Assessment Score: ${params.assessmentScore}%`);
    if (params.previousInterviewNotes) contextParts.push(`Previous Notes:\n${params.previousInterviewNotes}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        max_tokens: 3072,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: INTERVIEW_PREP_PROMPT },
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
    const result = JSON.parse(data.choices[0].message.content) as InterviewPrepResult;

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
      error: error instanceof Error ? error.message : 'Failed to generate interview prep',
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Generate fallback interview prep when AI is not available
 */
function generateFallbackPrep(params: {
  candidateName: string;
  jobTitle: string;
  interviewType: string;
  assessmentScore?: number;
}): InterviewPrepResult {
  const questions: InterviewQuestion[] = [
    {
      question: `Walk me through your experience that's most relevant to the ${params.jobTitle} role.`,
      category: 'behavioral',
      rationale: 'Understand depth of relevant experience',
      followUps: ['What was your specific contribution?', 'What would you do differently?'],
      lookFor: ['Specificity', 'Self-awareness', 'Relevance to role'],
    },
    {
      question: 'Describe a challenging technical problem you solved recently.',
      category: 'technical',
      rationale: 'Assess problem-solving approach and technical depth',
      followUps: ['What alternatives did you consider?', 'How did you validate your solution?'],
      lookFor: ['Structured thinking', 'Technical depth', 'Pragmatism'],
    },
    {
      question: 'Tell me about a time you had a disagreement with a colleague. How did you handle it?',
      category: 'behavioral',
      rationale: 'Evaluate conflict resolution and communication skills',
      followUps: ['What was the outcome?', 'What did you learn?'],
      lookFor: ['Empathy', 'Communication', 'Resolution focus'],
    },
    {
      question: 'Where do you see yourself in 2-3 years?',
      category: 'growth',
      rationale: 'Assess career alignment and ambition',
      followUps: ['How does this role fit into that plan?', 'What skills do you want to develop?'],
      lookFor: ['Alignment with role', 'Growth mindset', 'Realistic expectations'],
    },
    {
      question: 'What questions do you have about the role or our team?',
      category: 'cultural',
      rationale: 'Gauge genuine interest and preparation',
      followUps: [],
      lookFor: ['Thoughtful questions', 'Research on company', 'Interest in team dynamics'],
    },
  ];

  const probePoints: ProbePoint[] = [
    {
      area: 'Technical depth',
      reason: 'Verify hands-on capability matches resume claims',
      suggestedApproach: 'Ask for specific examples with technical details',
      category: 'Technical',
    },
    {
      area: 'Team collaboration',
      reason: 'Understand how they work with others',
      suggestedApproach: 'Use STAR method to explore past team experiences',
      category: 'Behavioral',
    },
    {
      area: 'Problem-solving approach',
      reason: 'Assess analytical and creative thinking',
      suggestedApproach: 'Present a hypothetical scenario relevant to the role',
      category: 'Technical',
    },
  ];

  return {
    candidateSummary: `${params.candidateName} is being interviewed for the ${params.jobTitle} position.${
      params.assessmentScore ? ` Assessment score: ${params.assessmentScore}%.` : ''
    }`,
    strengths: [
      'Applied for the position showing genuine interest',
      'Progressed through the hiring pipeline',
    ],
    areasToExplore: [
      'Depth of technical experience',
      'Cultural fit and team dynamics',
      'Long-term career alignment',
    ],
    suggestedQuestions: questions,
    keyPointsToProbe: probePoints,
    preparationTips: [
      'Start with open-ended questions to build rapport',
      'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
      'Take notes to reference during scorecard completion',
      'Leave 5-10 minutes for candidate questions',
      'Be consistent across candidates for the same role',
    ],
    redFlags: [],
    greenFlags: [],
  };
}
