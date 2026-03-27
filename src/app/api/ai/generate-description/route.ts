import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle } = await request.json();

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    // TODO: Call OpenAI API or similar to generate description
    // Example using OpenAI:
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4',
    //   messages: [{
    //     role: 'user',
    //     content: `Generate a professional job description for a ${jobTitle} position...`
    //   }]
    // });

    // Placeholder response
    const placeholderDescription = `About This Role

We are seeking a talented ${jobTitle} to join our growing team. This is a unique opportunity to make a significant impact on our product and company culture.

Key Responsibilities

- Lead and deliver on critical projects
- Collaborate with cross-functional teams to drive success
- Contribute to continuous improvement of our processes
- Mentor and support team members when needed

Required Qualifications

- 3+ years of relevant experience
- Strong problem-solving and analytical skills
- Excellent communication abilities
- Proven track record of delivering results

What We Offer

- Competitive compensation and benefits package
- Flexible work arrangements
- Professional development opportunities
- A collaborative and inclusive work environment
- Opportunity to work with cutting-edge technology`;

    return NextResponse.json({
      description: placeholderDescription,
      success: true,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}
