import type { OutreachEmailResult, AIServiceResponse } from '@/types/ai';

const OUTREACH_EMAIL_PROMPT = `You are an expert recruiter writing personalized outreach emails. Write professional, warm, and engaging emails that feel personal — not templated.

Guidelines:
- Keep subject lines under 60 characters
- Keep emails concise (150-250 words)
- Reference specific details about the candidate
- Include a clear call to action
- Match the tone to the email type

Return a JSON object with:
- subject: email subject line
- body: full email body (use {{candidateName}}, {{jobTitle}}, {{company}} as variables)
- tone: one of "professional", "casual", "enthusiastic", "formal"
- personalizationPoints: array of specific details used for personalization
- callToAction: the specific ask or next step`;

type EmailType = 'initial' | 'follow_up' | 'interview_invite' | 'rejection' | 'offer';

/**
 * Generate a personalized outreach email
 */
export async function generateOutreachEmail(params: {
  candidateName: string;
  jobTitle: string;
  company: string;
  emailType: EmailType;
  candidateBackground?: string;
  customContext?: string;
}): Promise<AIServiceResponse<OutreachEmailResult>> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        success: true,
        data: getTemplateEmail(params),
        processingTime: Date.now() - startTime,
      };
    }

    const contextParts = [
      `Email Type: ${params.emailType}`,
      `Candidate: ${params.candidateName}`,
      `Position: ${params.jobTitle}`,
      `Company: ${params.company}`,
    ];

    if (params.candidateBackground) {
      contextParts.push(`Candidate Background: ${params.candidateBackground}`);
    }
    if (params.customContext) {
      contextParts.push(`Additional Context: ${params.customContext}`);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: OUTREACH_EMAIL_PROMPT },
          { role: 'user', content: contextParts.join('\n') },
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
    const result = JSON.parse(data.choices[0].message.content) as OutreachEmailResult;

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
      error: error instanceof Error ? error.message : 'Failed to generate email',
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Generate a complete outreach email sequence
 */
export async function generateOutreachSequence(params: {
  candidateName: string;
  jobTitle: string;
  company: string;
  candidateBackground?: string;
}): Promise<AIServiceResponse<OutreachEmailResult[]>> {
  const startTime = Date.now();
  const sequence: OutreachEmailResult[] = [];

  const types: EmailType[] = ['initial', 'follow_up', 'interview_invite'];

  for (const emailType of types) {
    const result = await generateOutreachEmail({ ...params, emailType });
    if (result.success && result.data) {
      sequence.push(result.data);
    }
  }

  return {
    success: true,
    data: sequence,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Template-based fallback emails when AI is not available
 */
function getTemplateEmail(params: {
  candidateName: string;
  jobTitle: string;
  company: string;
  emailType: EmailType;
}): OutreachEmailResult {
  const { candidateName, jobTitle, company, emailType } = params;

  const templates: Record<EmailType, OutreachEmailResult> = {
    initial: {
      subject: `Exciting ${jobTitle} opportunity at ${company}`,
      body: `Hi ${candidateName},\n\nI came across your profile and was impressed by your background. We have an exciting ${jobTitle} position at ${company} that I think could be a great fit for your skills and experience.\n\nWould you be open to a brief conversation to learn more about the opportunity? I'd love to share more details about the role and our team.\n\nLooking forward to connecting!\n\nBest regards`,
      tone: 'professional',
      personalizationPoints: ['Candidate name', 'Job title', 'Company name'],
      callToAction: 'Schedule a brief conversation',
    },
    follow_up: {
      subject: `Following up: ${jobTitle} at ${company}`,
      body: `Hi ${candidateName},\n\nI wanted to follow up on my previous message about the ${jobTitle} position at ${company}. I understand you're likely busy, but I'd still love the opportunity to discuss this role with you.\n\nThe team is growing quickly and we're looking for talented individuals like yourself. Even if the timing isn't right now, I'd value the chance to connect.\n\nWould you have 15 minutes this week for a quick chat?\n\nBest regards`,
      tone: 'casual',
      personalizationPoints: ['Candidate name', 'Job title'],
      callToAction: '15-minute chat this week',
    },
    interview_invite: {
      subject: `Interview invitation: ${jobTitle} at ${company}`,
      body: `Hi ${candidateName},\n\nThank you for your interest in the ${jobTitle} position at ${company}. We've reviewed your application and would like to invite you to an interview.\n\nPlease let us know your availability for the coming week, and we'll coordinate a time that works for everyone.\n\nWe're looking forward to learning more about you!\n\nBest regards`,
      tone: 'enthusiastic',
      personalizationPoints: ['Candidate name', 'Job title', 'Company name'],
      callToAction: 'Share availability for interview',
    },
    rejection: {
      subject: `Update on your application at ${company}`,
      body: `Hi ${candidateName},\n\nThank you for taking the time to apply for the ${jobTitle} position at ${company} and for your interest in joining our team.\n\nAfter careful consideration, we've decided to move forward with other candidates whose experience more closely aligns with our current needs.\n\nWe truly appreciate your interest and encourage you to apply for future openings that match your skills. We'll keep your information on file for upcoming opportunities.\n\nWishing you all the best in your career journey.\n\nBest regards`,
      tone: 'formal',
      personalizationPoints: ['Candidate name', 'Job title', 'Company name'],
      callToAction: 'Consider future opportunities',
    },
    offer: {
      subject: `Offer letter: ${jobTitle} at ${company}`,
      body: `Hi ${candidateName},\n\nWe are thrilled to extend an offer for the ${jobTitle} position at ${company}! After meeting with the team, we're confident you'll be an excellent addition.\n\nPlease find the formal offer details attached. We'd love to discuss any questions you might have.\n\nWe're excited about the possibility of you joining our team and look forward to hearing from you!\n\nWarm regards`,
      tone: 'enthusiastic',
      personalizationPoints: ['Candidate name', 'Job title', 'Company name'],
      callToAction: 'Review offer and respond',
    },
  };

  return templates[emailType] || templates.initial;
}
