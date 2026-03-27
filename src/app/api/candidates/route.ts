import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/candidates
 * Fetch all candidates for the user's company
 * Query params: status, source, search
 * Returns: { candidates: [...], total: number }
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
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    // Get user's companies
    const userCompanies = await prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (userCompanies.length === 0) {
      return NextResponse.json({ candidates: [], total: 0 });
    }

    const companyIds = userCompanies.map(c => c.id);

    const where: any = {
      companyId: { in: companyIds },
    };

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        applications: {
          select: { id: true, jobPostingId: true, status: true },
        },
        evaluations: {
          select: { score: true, recommendation: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        assessmentSessions: {
          select: { status: true, overallScore: true, completedAt: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match expected format
    const transformedCandidates = candidates.map(candidate => ({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      status: candidate.status,
      source: candidate.source,
      aiScore: candidate.aiScore,
      aiSummary: candidate.aiSummary,
      aiTags: candidate.aiTags ? JSON.parse(candidate.aiTags) : [],
      resume: candidate.resume,
      portfolio: candidate.portfolio,
      videoUrl: candidate.videoUrl,
      applicationCount: candidate.applications.length,
      latestApplication: candidate.applications[0]?.jobPostingId || null,
      lastEvaluation: candidate.evaluations[0] || null,
      lastAssessment: candidate.assessmentSessions[0] || null,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      candidates: transformedCandidates,
      total: transformedCandidates.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/candidates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidates
 * Create a new candidate (used by apply flow or manual entry)
 * Body: { firstName, lastName, email, phone?, resume?, portfolio?, companyId }
 * Returns: { candidate: {...}, success: true }
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
      firstName,
      lastName,
      email,
      phone,
      resume,
      portfolio,
      companyId,
      source,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, companyId' },
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

    // Check if candidate already exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email_companyId: { email, companyId } },
    });

    if (existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate already exists' },
        { status: 409 }
      );
    }

    // Create candidate
    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        resume: resume || null,
        portfolio: portfolio || null,
        source: source || 'API',
        status: 'APPLIED',
        companyId,
        userId: session.user.id,
      },
      include: {
        applications: {
          select: { id: true, jobPostingId: true, status: true },
        },
      },
    });

    return NextResponse.json(
      {
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          status: candidate.status,
          source: candidate.source,
          resume: candidate.resume,
          portfolio: candidate.portfolio,
          applicationCount: candidate.applications.length,
          createdAt: candidate.createdAt.toISOString(),
        },
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/candidates error:', error);
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}
