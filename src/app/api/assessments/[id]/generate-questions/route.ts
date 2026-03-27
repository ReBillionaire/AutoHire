import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

let _client: Anthropic | null = null;
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const ASSESSMENT_PROMPTS = {
  SKILL: `Generate 10 challenging technical interview questions for a {job_role} position.
Include a mix of:
- 3 multiple choice conceptual questions
- 3 scenario-based questions
- 4 open-ended questions

Format each question as JSON with: text, type, options (for multiple choice)`,

  PSYCHOMETRIC: `Generate 10 psychometric assessment questions to evaluate personality traits for a {job_role} position.
Use a mix of:
- 5 Likert scale questions (5-point)
- 5 forced choice pairs

Format each question as JSON with: text, type, scale (for likert)`,

  ATTITUDE: `Generate 10 attitude/culture fit assessment questions for a {job_role} position.
Include questions about:
- Work values and priorities
- Team collaboration preferences
- Learning and growth mindset
- Problem-solving approach
- Work-life balance perspectives

Format each question as JSON with: text, type (use likert)`,

  BACKGROUND: `Generate 10 background verification questions for a {job_role} position.
Include questions about:
- Employment history
- Educational credentials
- Skills verification
- Reference information
- Work authorization

Format each question as JSON with: text, type (mix of yes/no and open text)`,
};

export async function POST(request: NextRequest) {
  try {
    const { job_role, assessment_type, count = 10 } = await request.json();

    if (!job_role || !assessment_type) {
      return NextResponse.json(
        { error: 'Missing job_role or assessment_type' },
        { status: 400 }
      );
    }

    const prompt = ASSESSMENT_PROMPTS[assessment_type as keyof typeof ASSESSMENT_PROMPTS] || '';

    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid assessment type' },
        { status: 400 }
      );
    }

    const message = await getClient().messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt.replace('{job_role}', job_role) + `\n\nGenerate ${count} questions.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON questions from response
    const jsonMatches = content.text.match(/\{[^{}]*\}/g) || [];
    const questions = jsonMatches
      .slice(0, count)
      .map((jsonStr) => {
        try {
          return JSON.parse(jsonStr);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (questions.length === 0) {
      // Fallback: generate basic questions if parsing fails
      const fallbackQuestions = generateFallbackQuestions(job_role, assessment_type, count);
      return NextResponse.json({ questions: fallbackQuestions });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

function generateFallbackQuestions(
  jobRole: string,
  assessmentType: string,
  count: number
) {
  const fallbacks = {
    SKILL: [
      {
        text: `What is your experience with the primary tech stack for a ${jobRole}?`,
        type: 'multiple_choice',
        options: [
          { id: '1', text: 'Extensive (5+ years)' },
          { id: '2', text: 'Moderate (2-5 years)' },
          { id: '3', text: 'Some experience (< 2 years)' },
          { id: '4', text: 'No experience' },
        ],
      },
      {
        text: `Describe your approach to solving complex technical problems as a ${jobRole}.`,
        type: 'open_text',
      },
      {
        text: `Rate your proficiency in system design and architecture`,
        type: 'likert',
        scale: 5,
      },
    ],
    PSYCHOMETRIC: [
      {
        text: 'I prefer working independently over collaborating with others',
        type: 'likert',
        scale: 5,
      },
      {
        text: 'I adapt quickly when plans change unexpectedly',
        type: 'likert',
        scale: 5,
      },
      {
        text: 'I focus on getting things done quickly vs. ensuring perfection',
        type: 'forced_choice',
        options: [
          { id: '1', text: 'Getting things done quickly' },
          { id: '2', text: 'Ensuring perfection' },
        ],
      },
    ],
    ATTITUDE: [
      {
        text: 'I view challenges as opportunities to learn and grow',
        type: 'likert',
        scale: 5,
      },
      {
        text: 'I am committed to continuous learning and skill development',
        type: 'likert',
        scale: 5,
      },
      {
        text: 'I prefer structured processes vs. autonomy and flexibility',
        type: 'likert',
        scale: 5,
      },
    ],
    BACKGROUND: [
      {
        text: 'Do you have prior experience as a professional in this field?',
        type: 'multiple_choice',
        options: [
          { id: 'yes', text: 'Yes' },
          { id: 'no', text: 'No' },
        ],
      },
      {
        text: 'Please describe your most recent relevant job experience',
        type: 'open_text',
      },
    ],
  };

  const baseQuestions = fallbacks[assessmentType as keyof typeof fallbacks] || [];
  const questions = [];

  for (let i = 0; i < count; i++) {
    const baseQ = baseQuestions[i % baseQuestions.length];
    questions.push({
      ...baseQ,
      text: baseQ.text.replace('$ROLE', jobRole),
    });
  }

  return questions;
}
