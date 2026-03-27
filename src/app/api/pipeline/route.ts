import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pipeline
 * Fetch pipeline data grouped by candidate stage
 * Query params: jobPostingId, companyId
 * Returns: { stages: [...], candidates: [...], total: number }
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
    const jobPostingId = searchParams.get('jobPostingId');
    const companyId = searchParams.get('companyId');

    // Get user's companies
    const userCompanies = await prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (userCompanies.length === 0) {
      return NextResponse.json({ stages: [], candidates: [], total: 0 });
    }

    const companyIds = companyId
      ? [companyId]
      : userCompanies.map(c => c.id);

    // Fetch candidates grouped by their status
    const where: any = {
      companyId: { in: companyIds },
    };

    if (jobPostingId) {
      where.applications = {
        some: { jobPostingId },
      };
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        applications: jobPostingId
          ? {
              where: { jobPostingId },
              select: {
                id: true,
                jobPostingId: true,
                status: true,
                jobPosting: { select: { title: true } },
              },
            }
          : {
              select: {
                id: true,
                jobPostingId: true,
                status: true,
                jobPosting: { select: { title: true } },
              },
            },
        assessmentSessions: {
          select: { status: true, overallScore: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status (pipeline stage)
    const stageMap: Record<string, any> = {
      APPLIED: { id: 'APPLIED', label: 'Applied', count: 0, candidates: [] },
      SCREENING: { id: 'SCREENING', label: 'Screening', count: 0, candidates: [] },
      INTERVIEW: { id: 'INTERVIEW', label: 'Interview', count: 0, candidates: [] },
      OFFER: { id: 'OFFER', label: 'Offer', count: 0, candidates: [] },
      HIRED: { id: 'HIRED', label: 'Hired', count: 0, candidates: [] },
      REJECTED: { id: 'REJECTED', label: 'Rejected', count: 0, candidates: [] },
      WITHDRAWN: { id: 'WITHDRAWN', label: 'Withdrawn', count: 0, candidates: [] },
    };

    const transformedCandidates = candidates.map(candidate => ({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      status: candidate.status,
      aiScore: candidate.aiScore,
      applications: candidate.applications,
      lastAssessment: candidate.assessmentSessions[0],
    }));

    // Group candidates by status
    transformedCandidates.forEach(candidate => {
      const stage = stageMap[candidate.status];
      if (stage) {
        stage.count++;
        stage.candidates.push(candidate);
      }
    });

    const stages = Object.values(stageMap);

    return NextResponse.json({
      stages,
      candidates: transformedCandidates,
      total: transformedCandidates.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/pipeline error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pipeline
 * Move a candidate to a different stage
 * Body: { candidateId, newStatus, companyId }
 * Returns: { success: true, candidate: {...} }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { candidateId, newStatus, companyId } = body;

    // Validate required fields
    if (!candidateId || !newStatus || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateId, newStatus, companyId' },
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

    // Update candidate status
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status: newStatus,
      },
      include: {
        applications: {
          select: { jobPostingId: true, status: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      candidate: {
        id: updatedCandidate.id,
        firstName: updatedCandidate.firstName,
        lastName: updatedCandidate.lastName,
        email: updatedCandidate.email,
        status: updatedCandidate.status,
        aiScore: updatedCandidate.aiScore,
        movedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('PATCH /api/pipeline error:', error);
    return NextResponse.json(
      { error: 'Failed to update pipeline' },
      { status: 500 }
    );
  }
}
