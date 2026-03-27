import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/applications
 * Fetch all applications for the user's company
 * Query params: status, jobPostingId, candidateId
 * Returns: { applications: [...], total: number }
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
    const jobPostingId = searchParams.get('jobPostingId');
    const candidateId = searchParams.get('candidateId');

    // Get user's companies
    const userCompanies = await prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (userCompanies.length === 0) {
      return NextResponse.json({ applications: [], total: 0 });
    }

    const companyIds = userCompanies.map(c => c.id);

    const where: any = {
      jobPosting: {
        companyId: { in: companyIds },
      },
    };

    if (status) {
      where.status = status;
    }

    if (jobPostingId) {
      where.jobPostingId = jobPostingId;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            aiScore: true,
          },
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            slug: true,
            companyId: true,
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

    // Transform to match expected format
    const transformedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      candidateId: app.candidateId,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      candidateEmail: app.candidate.email,
      candidatePhone: app.candidate.phone,
      candidateScore: app.candidate.aiScore,
      jobPostingId: app.jobPostingId,
      jobTitle: app.jobPosting.title,
      companyId: app.jobPosting.companyId,
      coverLetter: app.coverLetter,
      lastAssessment: app.assessmentSessions[0] || null,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      applications: transformedApplications,
      total: transformedApplications.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Create a new application
 * Body: { candidateId, jobPostingId, coverLetter?, companyId }
 * Returns: { application: {...}, success: true }
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
    const { candidateId, jobPostingId, coverLetter, companyId } = body;

    // Validate required fields
    if (!candidateId || !jobPostingId || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateId, jobPostingId, companyId' },
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

    // Verify candidate exists in this company
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || candidate.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Verify job posting exists in this company
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });

    if (!jobPosting || jobPosting.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobPostingId_candidateId: {
          jobPostingId,
          candidateId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Candidate has already applied to this position' },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        candidateId,
        jobPostingId,
        coverLetter: coverLetter || null,
        status: 'APPLIED',
        userId: session.user.id,
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
      },
    });

    return NextResponse.json(
      {
        application: {
          id: application.id,
          status: application.status,
          candidateId: application.candidateId,
          candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          jobPostingId: application.jobPostingId,
          jobTitle: application.jobPosting.title,
          coverLetter: application.coverLetter,
          createdAt: application.createdAt.toISOString(),
        },
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
