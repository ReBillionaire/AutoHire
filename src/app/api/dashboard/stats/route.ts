import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeJobs = await prisma.jobPosting.count({
      where: { status: 'PUBLISHED' },
    });

    const totalCandidates = await prisma.candidate.count();

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const interviewsThisWeek = await prisma.interview.count({
      where: {
        scheduledAt: { gte: weekStart, lte: weekEnd },
      },
    });

    // Calculate hire rate
    const hiredCount = await prisma.candidate.count({
      where: { status: 'HIRED' },
    });
    const hireRate = totalCandidates > 0
      ? Math.round((hiredCount / totalCandidates) * 100)
      : 0;

    // Pipeline data
    const pipelineRaw = await prisma.candidate.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const stageColors: Record<string, string> = {
      APPLIED: '#3b82f6',
      SCREENING: '#8b5cf6',
      INTERVIEW: '#06b6d4',
      OFFER: '#10b981',
      HIRED: '#22c55e',
      REJECTED: '#ef4444',
      WITHDRAWN: '#64748b',
    };

    const pipeline = pipelineRaw.map((item) => ({
      stage: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
      count: item._count.id,
      color: stageColors[item.status] || '#94a3b8',
    }));

    // Recent activity
    const recentCandidates = await prisma.candidate.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        applications: {
          select: { jobPosting: { select: { title: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const statusToType: Record<string, string> = {
      APPLIED: 'application',
      SCREENING: 'application',
      INTERVIEW: 'interview',
      OFFER: 'offer',
      HIRED: 'offer',
      REJECTED: 'application',
      WITHDRAWN: 'application',
    };

    const recentActivity = recentCandidates.map((c) => {
      const jobTitle = c.applications[0]?.jobPosting.title || 'Unknown Position';
      const actType = statusToType[c.status] || 'application';
      return {
        id: c.id,
        type: actType,
        description: `${c.firstName} ${c.lastName} ${
          actType === 'application' ? 'applied' : actType === 'interview' ? 'interviewed' : 'received offer'
        }`,
        details: jobTitle,
        timestamp: c.createdAt.toISOString(),
      };
    });

    // Upcoming interviews
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        scheduledAt: { gte: now },
        status: 'SCHEDULED',
      },
      select: {
        id: true,
        scheduledAt: true,
        type: true,
        candidate: {
          select: { firstName: true, lastName: true },
        },
        jobPosting: {
          select: { title: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    const typeMap: Record<string, 'phone' | 'video' | 'in-person'> = {
      SCREENING: 'phone',
      PHONE: 'phone',
      TECHNICAL: 'video',
      BEHAVIORAL: 'video',
      CASE_STUDY: 'video',
      PRESENTATION: 'video',
      FINAL: 'in-person',
    };

    return NextResponse.json({
      stats: {
        activeJobs,
        totalCandidates,
        interviewsThisWeek,
        hireRate,
      },
      pipeline,
      recentActivity,
      upcomingInterviews: upcomingInterviews.map((i) => ({
        id: i.id,
        candidateName: `${i.candidate.firstName} ${i.candidate.lastName}`,
        position: i.jobPosting.title,
        time: i.scheduledAt.toISOString(),
        type: typeMap[i.type] || 'video',
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
