import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-clients';

export const dynamic = 'force-dynamic';

interface GenerateJDRequest {
  mode: 'prompt' | 'reference' | 'refine';
  // For prompt mode:
  prompt?: string;
  jobTitle?: string;
  department?: string;
  level?: string;
  // For reference mode:
  referenceJd?: string;
  // For refine mode:
  currentJd?: string;
  feedback?: string;
  // Common:
  companyName?: string;
  industry?: string;
  tone?: 'professional' | 'casual' | 'startup' | 'corporate';
}

interface GenerateJDResponse {
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salary_suggestion?: string;
  keywords: string[];
  summary: string;
}

const SYSTEM_PROMPT = `You are an expert HR professional and job description writer with 15+ years of experience. Your task is to generate professional, well-structured job descriptions that attract top talent while accurately representing the role.

When generating job descriptions, follow these principles:
1. CLARITY: Use clear, concise language that any candidate can understand
2. STRUCTURE: Follow a consistent format with clear sections (About the Role, Key Responsibilities, Requirements, Benefits, Salary)
3. APPEAL: Write in an engaging tone that reflects company culture
4. SPECIFICITY: Include concrete details, metrics, and examples rather than generic statements
5. INCLUSIVITY: Use inclusive language that encourages diverse applicants
6. SEO: Include relevant keywords naturally throughout (5-10 keywords)

Always respond with valid JSON matching this exact structure:
{
  "title": "Job Title",
  "description": "2-3 paragraph overview of the role, team, and impact",
  "requirements": "Bullet-pointed list of required qualifications, skills, and experience. Include years of experience, technical skills, and soft skills",
  "benefits": "Bullet-pointed list of benefits, perks, and company culture highlights",
  "salary_suggestion": "Optional: salary range suggestion based on industry standards",
  "keywords": ["keyword1", "keyword2", ...],
  "summary": "Single sentence summary of the role"
}`;

function getPromptByMode(req: GenerateJDRequest): string {
  switch (req.mode) {
    case 'prompt':
      return `Generate a professional job description based on this user description:

User Input: "${req.prompt}"
Job Title: ${req.jobTitle || 'Not specified'}
Department: ${req.department || 'Not specified'}
Experience Level: ${req.level || 'Not specified'}
Company: ${req.companyName || 'Not specified'}
Industry: ${req.industry || 'Not specified'}
Tone: ${req.tone || 'professional'}

Create a complete, professional job description that expands on the user's input with industry best practices and standard requirements for this role level.`;

    case 'reference':
      return `Restructure and improve this existing job description. Make it more professional, better organized, and more compelling while keeping the core role intact:

Original JD:
${req.referenceJd}

Company: ${req.companyName || 'Not specified'}
Industry: ${req.industry || 'Not specified'}
Desired Tone: ${req.tone || 'professional'}

Please improve the structure, clarity, and appeal while maintaining the essential role information.`;

    case 'refine':
      return `Refine this job description based on the feedback provided:

Current JD:
${req.currentJd}

Feedback/Refinement Request:
${req.feedback}

Company: ${req.companyName || 'Not specified'}
Tone: ${req.tone || 'professional'}

Apply the feedback while maintaining professional quality and completeness.`;

    default:
      throw new Error('Invalid mode');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateJDRequest = await request.json();

    // Validate required fields based on mode
    if (!body.mode) {
      return NextResponse.json(
        { error: 'Mode is required' },
        { status: 400 }
      );
    }

    if (body.mode === 'prompt' && !body.prompt && !body.jobTitle) {
      return NextResponse.json(
        { error: 'Either prompt or jobTitle is required for prompt mode' },
        { status: 400 }
      );
    }

    if (body.mode === 'reference' && !body.referenceJd) {
      return NextResponse.json(
        { error: 'referenceJd is required for reference mode' },
        { status: 400 }
      );
    }

    if (body.mode === 'refine' && (!body.currentJd || !body.feedback)) {
      return NextResponse.json(
        { error: 'currentJd and feedback are required for refine mode' },
        { status: 400 }
      );
    }

    const userPrompt = getPromptByMode(body);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    let result: GenerateJDResponse;
    try {
      result = JSON.parse(content) as GenerateJDResponse;
    } catch (e) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Validate response structure
    if (!result.title || !result.description || !result.requirements) {
      throw new Error('Generated JD is missing required fields');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('JD generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate JD';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
