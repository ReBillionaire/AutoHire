import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-clients';

export const dynamic = 'force-dynamic';

interface GenerateSnippetsRequest {
  jobTitle: string;
  description: string;
  companyName: string;
  location: string;
  applyUrl: string;
}

interface SnippetResponse {
  linkedin: {
    content: string;
    hashtags: string[];
  };
  twitter: {
    content: string;
    hashtags: string[];
  };
  facebook: {
    content: string;
    hashtags: string[];
  };
}

const SYSTEM_PROMPT = `You are a social media marketing expert specializing in recruitment marketing. Your task is to create platform-specific content snippets that drive engagement and applications.

Guidelines:
1. LINKEDIN: Professional, detailed, company-focused. 200-250 words. Focus on career growth and company culture.
2. TWITTER: Concise, punchy, with urgency. Max 280 characters. Include 2-3 hashtags.
3. FACEBOOK: Engaging, conversational, personal touch. 150-200 words. Appeal to community and benefits.

Each platform should:
- Have a clear call-to-action
- Include 2-3 relevant hashtags
- Be authentic and compelling
- Drive clicks to the apply URL

Respond with valid JSON matching this exact structure:
{
  "linkedin": {
    "content": "Full LinkedIn post content",
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  },
  "twitter": {
    "content": "Tweet content (max 280 chars)",
    "hashtags": ["#tag1", "#tag2"]
  },
  "facebook": {
    "content": "Facebook post content",
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSnippetsRequest = await request.json();

    // Validate required fields
    if (!body.jobTitle || !body.description || !body.companyName || !body.location || !body.applyUrl) {
      return NextResponse.json(
        { error: 'jobTitle, description, companyName, location, and applyUrl are required' },
        { status: 400 }
      );
    }

    const userPrompt = `Generate social media snippets for this job posting:

Job Title: ${body.jobTitle}
Company: ${body.companyName}
Location: ${body.location}
Apply URL: ${body.applyUrl}

Job Description:
${body.description}

Create engaging, platform-specific content that will drive applications.`;

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
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    let result: SnippetResponse;
    try {
      result = JSON.parse(content) as SnippetResponse;
    } catch (e) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Validate response structure
    if (!result.linkedin?.content || !result.twitter?.content || !result.facebook?.content) {
      throw new Error('Generated snippets are missing required fields');
    }

    // Ensure Twitter content is within 280 character limit
    if (result.twitter.content.length > 280) {
      result.twitter.content = result.twitter.content.substring(0, 277) + '...';
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Snippets generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate snippets';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
