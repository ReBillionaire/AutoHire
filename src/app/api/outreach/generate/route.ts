import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generatePlatformContent,
  suggestPostingTimes,
  generateHashtags,
} from '@/lib/ai/outreach-agent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, platforms } = body;

    if (!jobId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Job ID and platforms are required' },
        { status: 400 }
      );
    }

    // Fetch job posting details
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: { name: true, website: true, logo: true },
        },
      },
    });

    if (!jobPosting) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Generate content for each platform
    const contents = await Promise.all(
      platforms.map(async (platform: string) => {
        try {
          // Generate platform-specific content
          const content = await generatePlatformContent(platform, {
            jobTitle: jobPosting.title,
            jobDescription: jobPosting.description,
            companyName: jobPosting.company.name,
            companyWebsite: jobPosting.company.website || undefined,
            salary: jobPosting.salary || undefined,
            location: jobPosting.location || undefined,
            remote: jobPosting.remote,
            benefits: jobPosting.benefits || undefined,
          });

          // Get best posting time
          const timingInfo = await suggestPostingTimes(platform);

          // Generate hashtags if applicable
          const hashtags = await generateHashtags(
            platform,
            jobPosting.title,
            jobPosting.description
          );

          return {
            platform,
            content,
            characterCount: content.length,
            hashtags,
            bestPostingTime: timingInfo.times[0],
          };
        } catch (error) {
          console.error(`Error generating content for ${platform}:`, error);
          return {
            platform,
            content: `[Auto-generated content for ${jobPosting.title}]\n\n${jobPosting.description}`,
            characterCount: 0,
            hashtags: [],
            bestPostingTime: null,
            error: `Failed to generate AI content`,
          };
        }
      })
    );

    return NextResponse.json({
      jobId,
      platforms,
      contents,
    });
  } catch (error) {
    console.error('POST /api/outreach/generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate platform-specific content' },
      { status: 500 }
    );
  }
}
