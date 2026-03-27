import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/ai-clients';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-questions
 * Generate AI-powered assessment questions for a company's question bank
 *
 * Body: {
 *   companyId: string,
 *   domain: string,
 *   category: 'SKILL' | 'COMMUNICATION' | 'EXPERIENCE' | 'PSYCHOMETRIC',
 *   count: number,
 *   difficulty: 'EASY' | 'MEDIUM' | 'HARD',
 *   jobTitle?: string,
 *   companyDescription?: string
 * }
 *
 * Returns: { success: true, questions: [...] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      companyId,
      domain,
      category,
      count = 5,
      difficulty = 'MEDIUM',
      jobTitle,
      companyDescription,
    } = body;

    // Validate required fields
    if (!companyId || !domain || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, domain, category' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['SKILL', 'COMMUNICATION', 'EXPERIENCE', 'PSYCHOMETRIC'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company || company.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized or company not found' },
        { status: 403 }
      );
    }

    // Build prompt based on category
    let systemPrompt = '';
    let userPrompt = '';

    if (category === 'SKILL') {
      systemPrompt = `You are an expert assessment designer specializing in technical and professional skill evaluation.
Generate high-quality multiple-choice questions that accurately assess practical competency.
Respond with a JSON array where each question has this structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The correct option (must be one of the options)",
  "explanation": "Why this is the correct answer and what it tests"
}`;

      userPrompt = `Generate ${count} ${difficulty} multiple-choice skill assessment questions for a ${domain} role.
${jobTitle ? `Job Title: ${jobTitle}` : ''}
${companyDescription ? `Company Context: ${companyDescription}` : ''}

Each question should:
- Test practical competency in ${domain}
- Have 4 distinct options (A, B, C, D)
- Have exactly one clearly correct answer
- Include a clear explanation
- Be appropriate for ${difficulty} level

Respond with ONLY a valid JSON array, no additional text.`;
    } else if (category === 'COMMUNICATION') {
      systemPrompt = `You are an expert in assessing communication and interpersonal skills.
Generate scenario-based questions that evaluate how candidates communicate and handle professional situations.
Respond with a JSON array where each question has:
{
  "question": "A detailed scenario or question about communication/interpersonal skills",
  "explanation": "What this question assesses and the rubric for evaluation",
  "guidingCriteria": ["Look for X", "Listen for Y", "Evaluate Z"]
}`;

      userPrompt = `Generate ${count} ${difficulty} communication assessment questions for a ${domain} professional.
${jobTitle ? `Job Title: ${jobTitle}` : ''}
${companyDescription ? `Company Context: ${companyDescription}` : ''}

Each question should:
- Present a realistic workplace scenario
- Evaluate communication skills, collaboration, or stakeholder management
- Be open-ended (candidates provide 50-500 character responses)
- Include clear evaluation criteria
- Be appropriate for ${difficulty} level

Respond with ONLY a valid JSON array, no additional text.`;
    } else if (category === 'EXPERIENCE') {
      systemPrompt = `You are an expert in assessing professional experience and judgment.
Generate questions that evaluate how candidates apply their experience to novel situations.
Respond with a JSON array where each question has:
{
  "question": "A scenario or question testing experience and professional judgment",
  "explanation": "What experience areas this tests and evaluation approach",
  "guidingCriteria": ["Look for X", "Consider Y", "Evaluate Z"]
}`;

      userPrompt = `Generate ${count} ${difficulty} experience assessment questions for a ${domain} professional.
${jobTitle ? `Job Title: ${jobTitle}` : ''}
${companyDescription ? `Company Context: ${companyDescription}` : ''}

Each question should:
- Present a complex professional scenario requiring judgment
- Evaluate how candidates apply experience to real problems
- Be open-ended (candidates provide 50-500 character responses)
- Require specific professional judgment
- Be appropriate for ${difficulty} level

Respond with ONLY a valid JSON array, no additional text.`;
    } else if (category === 'PSYCHOMETRIC') {
      systemPrompt = `You are an expert psychometrician creating personality and cognitive assessments.
Generate situational judgment questions using a Likert scale (1-5: Strongly Disagree to Strongly Agree).
Respond with a JSON array where each question has:
{
  "question": "A statement for Likert scale assessment",
  "explanation": "What trait/dimension this assesses",
  "dimension": "The personality/cognitive dimension being tested"
}`;

      userPrompt = `Generate ${count} ${difficulty} psychometric assessment questions for evaluating ${domain} professionals.
${jobTitle ? `Job Title: ${jobTitle}` : ''}
${companyDescription ? `Company Context: ${companyDescription}` : ''}

Each question should:
- Be a clear statement for 5-point Likert scale (Strongly Disagree to Strongly Agree)
- Assess personality traits, work styles, or cognitive patterns relevant to ${domain}
- Use validated psychometric principles
- Avoid double negatives and be clear
- Be appropriate for ${difficulty} level

Dimensions may include: conscientiousness, openness, collaboration, resilience, analytical thinking, etc.

Respond with ONLY a valid JSON array, no additional text.`;
    }

    // Call OpenAI to generate questions
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const generatedText = response.choices[0]?.message.content || '';

    // Parse the JSON response
    let parsedQuestions: any[] = [];
    try {
      parsedQuestions = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedText);
      return NextResponse.json(
        { error: 'Failed to parse generated questions' },
        { status: 500 }
      );
    }

    // Validate and transform parsed questions
    const questions = parsedQuestions.map((q: any) => {
      if (category === 'SKILL') {
        return {
          question: q.question,
          options: JSON.stringify(q.options || []),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: 'SKILL',
          difficulty,
          domain,
        };
      } else if (category === 'COMMUNICATION') {
        return {
          question: q.question,
          options: null,
          correctAnswer: null,
          explanation: q.explanation,
          category: 'COMMUNICATION',
          difficulty,
          domain,
        };
      } else if (category === 'EXPERIENCE') {
        return {
          question: q.question,
          options: null,
          correctAnswer: null,
          explanation: q.explanation,
          category: 'EXPERIENCE',
          difficulty,
          domain,
        };
      } else if (category === 'PSYCHOMETRIC') {
        return {
          question: q.question,
          options: JSON.stringify(['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']),
          correctAnswer: null,
          explanation: q.explanation,
          category: 'PSYCHOMETRIC',
          difficulty,
          domain,
        };
      }
    });

    // Save questions to database
    const savedQuestions = await Promise.all(
      questions.map((q: any) =>
        prisma.questionBank.create({
          data: {
            companyId,
            category: q.category,
            domain: q.domain,
            difficulty: q.difficulty,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            aiGenerated: true,
            active: true,
          },
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        questions: savedQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          domain: q.domain,
          options: q.options ? JSON.parse(q.options) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/ai/generate-questions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
