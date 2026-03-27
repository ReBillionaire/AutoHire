import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/assessments
 * Fetch all assessment sessions for the user's company
 * Query params: status, candidateId, applicationId
 * Returns: { assessments: [...], total: number }
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
    const candidateId = searchParams.get('candidateId');
    const applicationId = searchParams.get('applicationId');

    // Get user's companies
    const userCompanies = await prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (userCompanies.length === 0) {
      return NextResponse.json({ assessments: [], total: 0 });
    }

    const companyIds = userCompanies.map(c => c.id);

    const where: any = {
      companyId: { in: companyIds },
    };

    if (status) {
      where.status = status;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (applicationId) {
      where.applicationId = applicationId;
    }

    const assessments = await prisma.assessmentSession.findMany({
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
        application: {
          select: {
            id: true,
            jobPostingId: true,
            jobPosting: { select: { title: true } },
          },
        },
        responses: {
          select: { category: true, isCorrect: true, score: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match expected format
    const transformedAssessments = assessments.map(assessment => ({
      id: assessment.id,
      token: assessment.token,
      status: assessment.status,
      candidateId: assessment.candidateId,
      candidateName: `${assessment.candidate.firstName} ${assessment.candidate.lastName}`,
      candidateEmail: assessment.candidate.email,
      applicationId: assessment.applicationId,
      jobTitle: assessment.application?.jobPosting?.title,
      skillScore: assessment.skillScore,
      communicationScore: assessment.communicationScore,
      experienceScore: assessment.experienceScore,
      psycheScore: assessment.psycheScore,
      overallScore: assessment.overallScore,
      discProfile: assessment.discProfile,
      discCompleted: assessment.discCompleted,
      responseCount: assessment.responses.length,
      timeSpent: assessment.timeSpent,
      startedAt: assessment.startedAt?.toISOString(),
      completedAt: assessment.completedAt?.toISOString(),
      expiresAt: assessment.expiresAt?.toISOString(),
      createdAt: assessment.createdAt.toISOString(),
    }));

    return NextResponse.json({
      assessments: transformedAssessments,
      total: transformedAssessments.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessments
 * Create a new assessment session for a candidate
 * Body: { candidateId, applicationId, companyId }
 * Returns: { assessment: {...}, token: string, success: true }
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
    const { candidateId, applicationId, companyId } = body;

    // Validate required fields
    if (!candidateId || !applicationId || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateId, applicationId, companyId' },
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

    // Verify candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || candidate.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobPosting: true },
    });

    if (!application || application.jobPosting.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get company settings for assessment config
    const settings = await prisma.companySettings.findUnique({
      where: { companyId },
    });

    // Calculate expiration: 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create assessment session
    const assessment = await prisma.assessmentSession.create({
      data: {
        candidateId,
        applicationId,
        companyId,
        status: 'PENDING',
        expiresAt,
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
        application: {
          select: {
            jobPostingId: true,
            jobPosting: { select: { title: true } },
          },
        },
      },
    });

    // TODO: Send email to candidate with assessment link

    return NextResponse.json(
      {
        assessment: {
          id: assessment.id,
          status: assessment.status,
          candidateId: assessment.candidateId,
          candidateName: `${assessment.candidate.firstName} ${assessment.candidate.lastName}`,
          applicationId: assessment.applicationId,
          jobTitle: assessment.application.jobPosting.title,
          expiresAt: assessment.expiresAt?.toISOString(),
          createdAt: assessment.createdAt.toISOString(),
        },
        token: assessment.token,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
