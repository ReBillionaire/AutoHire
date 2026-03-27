/**
 * Interview Prep Generator - Creates targeted interview questions based on candidate profile
 * Uses OpenAI to generate questions aligned with DISC profile and candidate gaps
 */

import { openai } from '../ai-clients';
import {
  CompositeCandidateProfile,
  InterviewQuestion,
  InterviewPrep,
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
 * Build interview question prompt
 */
function buildInterviewPrompt(
  candidateProfile: CompositeCandidateProfile,
  jobDescription: string,
  jobTitle: string,
  totalQuestions: number = 10
): string {
  let prompt = `You are an expert interviewer creating a targeted interview guide for a candidate.

Job Title: ${jobTitle}

Job Requirements:
${jobDescription}

Candidate Profile:`;

  if (candidateProfile.resumeAnalysis) {
    prompt += `
Resume: ${candidateProfile.resumeAnalysis.yearsOfExperience} years of experience in ${candidateProfile.resumeAnalysis.industryExperience.join(', ')}.
Key Skills: ${candidateProfile.resumeAnalysis.skills.technical.slice(0, 5).join(', ')}
Gaps: ${candidateProfile.resumeAnalysis.gaps.join(', ')}
Red Flags: ${candidateProfile.resumeAnalysis.redFlags.join(', ') || 'None'}`;
  }

  if (candidateProfile.videoAnalysis) {
    prompt += `
Communication Score: ${candidateProfile.videoAnalysis.metrics.communication}/100
Confidence: ${candidateProfile.videoAnalysis.metrics.confidence}/100`;
  }

  if (candidateProfile.assessmentAnalysis) {
    prompt += `
Assessment Score: ${candidateProfile.assessmentAnalysis.totalScore}/100
Type: ${candidateProfile.assessmentAnalysis.assessmentType}`;
  }

  if (candidateProfile.discProfile) {
    prompt += `
DISC Profile: ${candidateProfile.discProfile.primary} (primary) / ${candidateProfile.discProfile.secondary} (secondary)
Work Style: ${candidateProfile.discProfile.report.workStyle}`;
  }

  prompt += `

Generate ${totalQuestions} targeted interview questions that:
1. Probe identified gaps in skills or experience
2. Explore red flags or concerns
3. Are tailored to their DISC profile communication style
4. Align with the job requirements
5. Include behavioral, technical, situational, and cultural fit questions

Include a mix of:
- 4 behavioral questions (past behavior predicts future)
- 3 technical or situational questions (specific to the role)
- 2 cultural fit questions (values and team dynamics)
- 1 follow-up/probing question (to clarify or go deeper)

For each question, provide:
- The question itself
- Category (behavioral/technical/situational/cultural/follow_up)
- Target area being assessed
- Difficulty level
- Rationale for this question
- Evaluation criteria (what good/bad answers look like)
- Expected answer length
- Scoring rubric/guidance

Return ONLY valid JSON array of questions:
[
  {
    "id": "q1",
    "question": "string",
    "category": "behavioral|technical|situational|cultural|follow_up",
    "targetArea": "string",
    "difficulty": "easy|medium|hard",
    "rationale": "string",
    "evaluationCriteria": ["criterion1", "criterion2"],
    "expectedAnswerLength": "short|medium|long",
    "scoringRubric": "string"
  }
]`;

  return prompt;
}

/**
 * Validate interview question
 */
function validateQuestion(q: any, index: number): InterviewQuestion {
  return {
    id: q.id || `q${index + 1}`,
    question: q.question || 'Question not provided',
    category: ['behavioral', 'technical', 'situational', 'cultural', 'follow_up'].includes(
      q.category
    )
      ? q.category
      : 'behavioral',
    targetArea: q.targetArea || 'General competency',
    difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
    rationale: q.rationale || '',
    evaluationCriteria: Array.isArray(q.evaluationCriteria) ? q.evaluationCriteria : [],
    expectedAnswerLength: ['short', 'medium', 'long'].includes(q.expectedAnswerLength)
      ? q.expectedAnswerLength
      : 'medium',
    scoringRubric: q.scoringRubric || '',
  };
}

/**
 * Generate conversation starters
 */
function generateConversationStarters(
  candidateProfile: CompositeCandidateProfile
): string[] {
  const starters: string[] = [];

  if (candidateProfile.resumeAnalysis?.strengths) {
    starters.push(
      `I noticed in your resume that ${candidateProfile.resumeAnalysis.strengths[0]?.toLowerCase()}. Can you tell me more about that?`
    );
  }

  if (candidateProfile.resumeAnalysis?.industryExperience[0]) {
    starters.push(
      `I see you have experience in ${candidateProfile.resumeAnalysis.industryExperience[0]}. What drew you to that industry?`
    );
  }

  if (candidateProfile.videoAnalysis?.strengths[0]) {
    starters.push(
      `Based on our initial conversation, I was impressed with how you ${candidateProfile.videoAnalysis.strengths[0]?.toLowerCase()}. Tell us more about your approach.`
    );
  }

  starters.push('Thanks for joining us today. How are you feeling about the opportunity?');
  starters.push('What questions do you have about the role or our company?');

  return starters.slice(0, 3);
}

/**
 * Identify red flags to probe
 */
function identifyRedFlagsToProbe(candidateProfile: CompositeCandidateProfile): string[] {
  const flags: string[] = [];

  if (candidateProfile.resumeAnalysis?.redFlags) {
    flags.push(...candidateProfile.resumeAnalysis.redFlags);
  }

  if (candidateProfile.assessmentAnalysis?.suspiciousActivity.detected) {
    flags.push('Assessment integrity - probe understanding of concepts');
  }

  if (
    candidateProfile.videoAnalysis &&
    candidateProfile.videoAnalysis.metrics.confidence < 50
  ) {
    flags.push('Low confidence in communication - explore comfort with public speaking');
  }

  return flags.slice(0, 5);
}

/**
 * Identify strengths to explore
 */
function identifyStrengthsToExplore(candidateProfile: CompositeCandidateProfile): string[] {
  const strengths: string[] = [];

  if (candidateProfile.resumeAnalysis?.strengths) {
    strengths.push(...candidateProfile.resumeAnalysis.strengths.slice(0, 2));
  }

  if (candidateProfile.videoAnalysis?.strengths) {
    strengths.push(...candidateProfile.videoAnalysis.strengths.slice(0, 2));
  }

  return strengths;
}

/**
 * Generate culture fit questions based on DISC profile
 */
function generateCultureFitQuestions(candidateProfile: CompositeCandidateProfile): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];

  const discProfile = candidateProfile.discProfile;
  if (!discProfile) {
    // Generic culture fit questions
    questions.push({
      id: 'culture-1',
      question: 'How do you approach working in a team environment?',
      category: 'cultural',
      targetArea: 'Team Collaboration',
      difficulty: 'medium',
      rationale: 'Understand team dynamics and collaboration style',
      evaluationCriteria: ['Values collaboration', 'Respects diverse perspectives', 'Contributes ideas'],
      expectedAnswerLength: 'medium',
      scoringRubric: 'Strong answer acknowledges different work styles and shows flexibility',
    });

    questions.push({
      id: 'culture-2',
      question: 'Describe your ideal work environment and company culture.',
      category: 'cultural',
      targetArea: 'Culture Fit',
      difficulty: 'medium',
      rationale: 'Assess alignment with company values and work environment',
      evaluationCriteria: ['Aligned with company values', 'Specific examples', 'Realistic expectations'],
      expectedAnswerLength: 'medium',
      scoringRubric: 'Good fit when described environment aligns with actual company culture',
    });
  } else {
    // DISC-tailored culture fit questions
    const discType = discProfile.primary;

    if (discType === 'D') {
      questions.push({
        id: 'culture-d1',
        question:
          'How do you handle situations where you need to collaborate with a slower-paced team?',
        category: 'cultural',
        targetArea: 'Adaptability',
        difficulty: 'medium',
        rationale: 'D types can struggle with pace mismatches; probe flexibility',
        evaluationCriteria: [
          'Acknowledges own pace',
          'Shows patience',
          'Finds productive collaboration',
        ],
        expectedAnswerLength: 'medium',
        scoringRubric: 'Good if shows self-awareness and willingness to adapt',
      });

      questions.push({
        id: 'culture-d2',
        question: 'Tell us about a time when you had to soften your approach or be more diplomatic.',
        category: 'behavioral',
        targetArea: 'Emotional Intelligence',
        difficulty: 'medium',
        rationale: 'D types can be too direct; assess EQ and relationship awareness',
        evaluationCriteria: ['Self-awareness', 'Positive outcome', 'Learned from experience'],
        expectedAnswerLength: 'medium',
        scoringRubric: 'Strong if shows genuine reflection and relationship consideration',
      });
    } else if (discType === 'I') {
      questions.push({
        id: 'culture-i1',
        question: 'How do you stay focused and avoid getting distracted by multiple opportunities?',
        category: 'situational',
        targetArea: 'Focus & Execution',
        difficulty: 'medium',
        rationale: 'I types can scatter focus; assess prioritization ability',
        evaluationCriteria: ['Systems for prioritization', 'Completes projects', 'Learns from mistakes'],
        expectedAnswerLength: 'medium',
        scoringRubric: 'Good if shows awareness of tendency and concrete systems',
      });

      questions.push({
        id: 'culture-i2',
        question: 'Describe a project you saw through to completion despite losing initial excitement.',
        category: 'behavioral',
        targetArea: 'Commitment',
        difficulty: 'medium',
        rationale: 'I types lose excitement; probe follow-through capability',
        evaluationCriteria: ['Stayed committed', 'Completed well', 'Reflects maturity'],
        expectedAnswerLength: 'medium',
        scoringRubric: 'Strong if shows persistence and professional responsibility',
      });
    } else if (discType === 'S') {
      questions.push({
        id: 'culture-s1',
        question: 'Tell us about a time when you had to advocate strongly for a change you believed in.',
        category: 'behavioral',
        targetArea: 'Initiative',
        difficulty: 'medium',
        rationale: 'S types avoid conflict; assess ability to speak up',
        evaluationCriteria': ['Took initiative', 'Handled respectfully', 'Positive outcome'],
        expectedAnswerLength: 'medium',
        scoringRubric: 'Good if shows assertiveness without aggression',
      });

      questions.push({
        id: 'culture-s2',
        question:
          'How do you respond when there are significant changes to processes or team structure?',
        category: 'situational',
        targetArea: 'Adaptability',
        difficulty: 'medium',
        rationale: 'S types resist change; assess flexibility',
        evaluationCriteria: ['Positive attitude', 'Embraces growth', 'Adapts'],
        expectedAnswerLength: 'medium',
        scoringRubric: 'Good if shows openness and willingness to learn',
      });
    } else if (discType === 'C') {
      questions.push({
        id: 'culture-c1',
        question: 'Describe a situation where you had to make a decision with incomplete information.',
        category: 'situational',
        targetArea: 'Decision Making Under Uncertainty',
        difficulty: 'medium',
        rationale: 'C types struggle with ambiguity; assess comfort with imperfect data',
        evaluationCriteria: [
          'Made reasonable decision',
          'Managed discomfort',
          'Good outcome',
        ],
        expectedAnswerLength: 'medium',
        scoringRubric: 'Good if shows practical problem-solving beyond perfectionism',
      });

      questions.push({
        id: 'culture-c2',
        question: 'How do you balance quality standards with meeting deadlines?',
        category: 'situational',
        targetArea: 'Pragmatism',
        difficulty: 'medium',
        rationale: 'C types may sacrifice speed for perfection; assess balance',
        evaluationCriteria: [
          'Understands business priorities',
          'Quality appropriate for context',
          'Meets timelines',
        ],
        expectedAnswerLength: 'medium',
        scoringRubric: 'Strong if shows business acumen and pragmatic approach',
      });
    }
  }

  return questions;
}

/**
 * Generate interview prep guide
 */
export async function generateInterviewQuestions(
  candidateProfile: CompositeCandidateProfile,
  jobDescription: string,
  jobTitle: string,
  totalQuestions: number = 10
): Promise<InterviewPrep> {
  if (!candidateProfile || !candidateProfile.id) {
    throw new AIAnalysisError('INVALID_INPUT', 'Candidate profile is required');
  }

  if (!jobDescription || !jobDescription.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Job description is required');
  }

  if (!jobTitle || !jobTitle.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Job title is required');
  }

  const prompt = buildInterviewPrompt(candidateProfile, jobDescription, jobTitle, totalQuestions);

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
      temperature: 0.4,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new AIAnalysisError('API_ERROR', 'No response from OpenAI');
    }

    const cleaned = extractJSON(content);
    let parsed: any[];

    try {
      // Try to parse as array
      parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
    } catch {
      // Try to extract questions from object
      const obj = JSON.parse(cleaned);
      parsed = Array.isArray(obj.questions) ? obj.questions : [obj];
    }

    const questions = parsed
      .slice(0, totalQuestions)
      .map((q: any, i: number) => validateQuestion(q, i));

    // Add culture fit questions
    const cultureQuestions = generateCultureFitQuestions(candidateProfile);
    const technicalQuestions = questions.filter((q) => q.category === 'technical').slice(0, 3);

    // Build focus areas
    const focusAreas = [
      {
        area: 'Technical Capability',
        importance: 'critical' as const,
        rationale: 'Ensure candidate can perform core job functions',
        suggestedQuestions: 3,
      },
      {
        area: 'Experience Relevance',
        importance: 'critical' as const,
        rationale: 'Verify past experience maps to role requirements',
        suggestedQuestions: 2,
      },
      {
        area: 'Team Fit',
        importance: 'important' as const,
        rationale: 'Assess compatibility with team dynamics',
        suggestedQuestions: 2,
      },
      {
        area: 'Growth Potential',
        importance: 'important' as const,
        rationale: 'Understand trajectory and learning agility',
        suggestedQuestions: 2,
      },
      {
        area: 'Red Flag Resolution',
        importance: 'critical' as const,
        rationale: 'Address any concerns from application materials',
        suggestedQuestions: 1,
      },
    ];

    // Build other components
    const conversationStarters = generateConversationStarters(candidateProfile);
    const redFlagsToProbe = identifyRedFlagsToProbe(candidateProfile);
    const strengthsToExplore = identifyStrengthsToExplore(candidateProfile);

    // Estimate time
    const shortQuestions = questions.filter((q) => q.expectedAnswerLength === 'short').length;
    const mediumQuestions = questions.filter((q) => q.expectedAnswerLength === 'medium').length;
    const longQuestions = questions.filter((q) => q.expectedAnswerLength === 'long').length;
    const estimatedTotalTime =
      shortQuestions * 2 + mediumQuestions * 3 + longQuestions * 5 + 5; // +5 for intro/outro

    // Build interviewer notes
    let interviewerNotes = `Interview for ${jobTitle}.\n\n`;
    if (candidateProfile.discProfile) {
      interviewerNotes += `DISC Profile: ${candidateProfile.discProfile.primary} (Primary) / ${candidateProfile.discProfile.secondary} (Secondary)\n`;
      interviewerNotes += `Recommended approach: ${candidateProfile.discProfile.report.interviewApproach}\n\n`;
    }
    interviewerNotes += `Key areas to probe: ${focusAreas.slice(0, 3).map((f) => f.area).join(', ')}\n`;
    if (redFlagsToProbe.length > 0) {
      interviewerNotes += `Red flags to address: ${redFlagsToProbe.join(', ')}\n`;
    }

    return {
      candidateId: candidateProfile.id,
      jobId: 'unknown',
      questions,
      focusAreas,
      conversationStarters,
      redFlagsToProbe,
      strengthsToExplore,
      cultureFitQuestions: cultureQuestions,
      technicalQuestions,
      estimatedTotalTime,
      interviewerNotes,
    };
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new AIAnalysisError(
        'PARSING_ERROR',
        'Failed to parse OpenAI response as JSON',
        error.message
      );
    }

    throw new AIAnalysisError(
      'API_ERROR',
      'Failed to generate interview questions',
      error instanceof Error ? error.message : String(error)
    );
  }
}
