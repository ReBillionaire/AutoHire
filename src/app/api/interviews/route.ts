import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/interviews
 * Fetch all interviews for the user's company
 * Query params: status, type, candidateId, jobPostingId, interviewerId
 * Returns: { interviews: [...], total: number }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const candidateId = searchParams.get('candidateId');
    const jobPostingId = searchParams.get('jobPostingId');
    const interviewerId = searchParams.get('interviewerId');

    // Get user's companies
    const userCompanies = await prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (userCompanies.length === 0) {
      return NextResponse.json({ interviews: [], total: 0 });
    }

    const companyIds = userCompanies.map(c => c.id);

    const where: any = {
      companyId: { in: companyIds },
    };

    if (status) where.status = status;
    if (type) where.type = type;
    if (candidateId) where.candidateId = candidateId;
    if (jobPostingId) where.jobPostingId = jobPostingId;
    if (interviewerId) where.interviewerId = interviewerId;

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        jobPosting: {
          select: { id: true, title: true, slug: true },
        },
        interviewer: {
          select: { id: true, name: true, email: true },
        },
        evaluations: {
          select: { score: true, recommendation: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Transform to match expected format
    const transformedInterviews = interviews.map(interview => ({
      id: interview.id,
      type: interview.type,
      status: interview.status,
      candidateId: interview.candidateId,
      candidateName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
      candidateEmail: interview.candidate.email,
      jobPostingId: interview.jobPostingId,
      jobTitle: interview.jobPosting.title,
      interviewerId: interview.interviewerId,
      interviewerName: interview.interviewer?.name,
      interviewerEmail: interview.interviewer?.email,
      scheduledAt: interview.scheduledAt?.toISOString(),
      startedAt: interview.startedAt?.toISOString(),
      endedAt: interview.endedAt?.toISOString(),
      duration: interview.duration,
      notes: interview.notes,
      recording: interview.recording,
      transcript: interview.transcript,
      aiInsights: interview.aiInsights,
      aiScore: interview.aiScore,
      evaluation: interview.evaluations[0] || null,
      createdAt: interview.createdAt.toISOString(),
      updatedAt: interview.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      interviews: transformedInterviews,
      total: transformedInterviews.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/interviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interviews
 * Schedule a new interview
 * Body: { candidateId, jobPostingId, companyId, type, scheduledAt, duration?, notes?, interviewerId?, sendInvite? }
 * Returns: { interview: {...}, success: true }
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
      candidateId,
      jobPostingId,
      companyId,
      type,
      scheduledAt,
      duration,
      notes,
      interviewerId,
      sendInvite,
    } = body;

    // Validate required fields
    if (!candidateId || !jobPostingId || !companyId || !type || !scheduledAt) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: candidateId, jobPostingId, companyId, type, scheduledAt',
        },
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

    // Verify candidate
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || candidate.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Verify job posting
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });

    if (!jobPosting || jobPosting.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    // Verify interviewer if provided
    if (interviewerId) {
      const interviewer = await prisma.user.findUnique({
        where: { id: interviewerId },
      });
      if (!interviewer) {
        return NextResponse.json(
          { error: 'Interviewer not found' },
          { status: 404 }
        );
      }
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        jobPostingId,
        companyId,
        type,
        status: 'SCHEDULED',
        scheduledAt: new Date(scheduledAt),
        duration: duration || null,
        notes: notes || null,
        interviewerId: interviewerId || null,
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        jobPosting: {
          select: { id: true, title: true },
        },
        interviewer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // TODO: Send calendar invites if sendInvite is true

    return NextResponse.json(
      {
        interview: {
          id: interview.id,
          type: interview.type,
          status: interview.status,
          candidateId: interview.candidateId,
          candidateName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
          jobPostingId: interview.jobPostingId,
          jobTitle: interview.jobPosting.title,
          interviewerId: interview.interviewerId,
          interviewerName: interview.interviewer?.name,
          scheduledAt: interview.scheduledAt?.toISOString(),
          duration: interview.duration,
          notes: interview.notes,
          createdAt: interview.createdAt.toISOString(),
        },
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/interviews error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule interview' },
      { status: 500 }
    );
  }
}
