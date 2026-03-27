import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeJobForPlatforms } from '@/lib/ai/outreach-agent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Fetch job posting details
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: { name: true, website: true },
        },
      },
    });

    if (!jobPosting) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Analyze job for platform recommendations
    const recommendations = await analyzeJobForPlatforms(
      jobPosting.description,
      jobPosting.title,
      jobPosting.level,
      jobPosting.type
    );

    return NextResponse.json({
      jobId,
      jobTitle: jobPosting.title,
      recommendations: recommendations.map(rec => ({
        ...rec,
        platform: rec.platform,
      })),
    });
  } catch (error) {
    console.error('POST /api/outreach/analyze error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job for platforms' },
      { status: 500 }
    );
  }
}
