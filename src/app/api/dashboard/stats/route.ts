import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get count of published job postings
    const openJobs = await prisma.jobPosting.count({
      where: {
        status: 'PUBLISHED',
      },
    });

    // Get total candidate count
    const totalCandidates = await prisma.candidate.count();

    // Calculate week boundaries for interviews
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    // Get interviews scheduled this week
    const interviewsThisWeek = await prisma.interview.count({
      where: {
        scheduledAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    // Get pipeline data grouped by candidate status
    const pipelineData = await prisma.candidate.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get recent activity - last 10 candidates with their application details
    const recentCandidates = await prisma.candidate.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        applications: {
          select: {
            jobPosting: {
              select: {
                title: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Map candidate status to activity type
    const statusToType: Record<string, 'application' | 'interview' | 'offer'> = {
      APPLIED: 'application',
      SCREENING: 'application',
      INTERVIEW: 'interview',
      OFFER: 'offer',
      HIRED: 'offer',
      REJECTED: 'application',
      WITHDRAWN: 'application',
    };

    const recentActivity = recentCandidates.map((candidate) => {
      const jobTitle = candidate.applications[0]?.jobPosting.title || 'Unknown Position';
      const activityType = statusToType[candidate.status] || 'application';

      return {
        id: candidate.id,
        type: activityType,
        description: `${candidate.firstName} ${candidate.lastName} ${activityType === 'application' ? 'applied' : activityType === 'interview' ? 'interviewed' : 'received offer'}`,
        details: jobTitle,
        timestamp: candidate.createdAt.toISOString(),
        actor: `${candidate.firstName} ${candidate.lastName}`,
      };
    });

    return NextResponse.json({
      openJobs,
      totalCandidates,
      interviewsThisWeek,
      pipelineData: pipelineData.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
