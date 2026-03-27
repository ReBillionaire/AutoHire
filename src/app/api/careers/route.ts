import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/careers
 * Fetch career pages (published job postings) for the user's company
 * Returns: { careerPages: [...], total: number }
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

    // Get user's companies
    const userCompanies = await prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (userCompanies.length === 0) {
      return NextResponse.json({ careerPages: [], total: 0 });
    }

    const companyIds = userCompanies.map(c => c.id);

    // Fetch published job postings (these serve as career pages)
    const careerPages = await prisma.jobPosting.findMany({
      where: {
        companyId: { in: companyIds },
        status: 'PUBLISHED',
      },
      include: {
        company: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { published: 'desc' },
    });

    // Transform to match expected format
    const transformedCareerPages = careerPages.map(job => ({
      id: job.id,
      jobId: job.id,
      title: job.title,
      slug: job.slug,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      location: job.location,
      remote: job.remote,
      salary: job.salary,
      currency: job.currency,
      level: job.level,
      type: job.type,
      companyId: job.companyId,
      companyName: job.company.name,
      companySlug: job.company.slug,
      companyLogo: job.company.logo,
      applicationCount: job._count.applications,
      published: job.published?.toISOString(),
      createdAt: job.createdAt.toISOString(),
    }));

    return NextResponse.json({
      careerPages: transformedCareerPages,
      total: transformedCareerPages.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/careers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career pages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/careers
 * Create or configure a career page (publish a job posting)
 * Body: { jobPostingId, companyId }
 * Returns: { careerPage: {...}, success: true }
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
    const { jobPostingId, companyId } = body;

    // Validate required fields
    if (!jobPostingId || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: jobPostingId, companyId' },
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

    // Publish the job posting
    const updatedJob = await prisma.jobPosting.update({
      where: { id: jobPostingId },
      data: {
        status: 'PUBLISHED',
        published: new Date(),
      },
      include: {
        company: {
          select: { name: true, slug: true, logo: true },
        },
      },
    });

    return NextResponse.json(
      {
        careerPage: {
          id: updatedJob.id,
          jobId: updatedJob.id,
          title: updatedJob.title,
          slug: updatedJob.slug,
          description: updatedJob.description,
          companyId: updatedJob.companyId,
          companyName: updatedJob.company.name,
          companySlug: updatedJob.company.slug,
          companyLogo: updatedJob.company.logo,
          published: updatedJob.published?.toISOString(),
          createdAt: updatedJob.createdAt.toISOString(),
        },
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/careers error:', error);
    return NextResponse.json(
      { error: 'Failed to create career page' },
      { status: 500 }
    );
  }
}
