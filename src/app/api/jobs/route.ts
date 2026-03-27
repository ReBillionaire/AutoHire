import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

/**
 * GET /api/jobs
 * Fetch all jobs for the authenticated user's company
 * Returns: { jobs: [...], total: number }
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
    const companyId = searchParams.get('companyId');

    // Get user's primary company or specified company
    const userCompanies = await prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (userCompanies.length === 0) {
      return NextResponse.json({ jobs: [], total: 0 });
    }

    const companyIds = companyId
      ? [companyId]
      : userCompanies.map(c => c.id);

    const where: any = {
      companyId: { in: companyIds },
    };

    if (status) {
      where.status = status;
    }

    const jobs = await prisma.jobPosting.findMany({
      where,
      include: {
        company: {
          select: { name: true, slug: true },
        },
        createdBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match expected format
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      slug: job.slug,
      description: job.description,
      status: job.status,
      level: job.level,
      type: job.type,
      remote: job.remote,
      location: job.location,
      salary: job.salary,
      currency: job.currency,
      applicationCount: job._count.applications,
      postedAt: job.published?.toISOString() || job.createdAt.toISOString(),
      companyId: job.companyId,
      companyName: job.company.name,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      jobs: transformedJobs,
      total: transformedJobs.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Create a new job posting
 * Body: { title, description, requirements, benefits?, location, level, type, remote, salary?, currency?, companyId }
 * Returns: { job: {...}, success: true }
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
      title,
      description,
      requirements,
      benefits,
      location,
      level,
      type,
      remote,
      salary,
      currency,
      companyId,
    } = body;

    // Validate required fields
    if (!title || !description || !requirements || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, requirements, companyId' },
        { status: 400 }
      );
    }

    // Verify company ownership
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company || company.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized or company not found' },
        { status: 403 }
      );
    }

    // Generate slug from title
    let slug = slugify(title);
    let slugExists = await prisma.jobPosting.findUnique({
      where: { companyId_slug: { companyId, slug } },
    });

    let counter = 1;
    while (slugExists) {
      slug = `${slugify(title)}-${counter}`;
      slugExists = await prisma.jobPosting.findUnique({
        where: { companyId_slug: { companyId, slug } },
      });
      counter++;
    }

    // Create job posting
    const job = await prisma.jobPosting.create({
      data: {
        title,
        slug,
        description,
        requirements,
        benefits: benefits || null,
        location: location || null,
        level: level || 'MID',
        type: type || 'FULL_TIME',
        remote: remote || 'ONSITE',
        salary: salary || null,
        currency: currency || null,
        status: 'DRAFT',
        companyId,
        createdById: session.user.id,
      },
      include: {
        company: { select: { name: true, slug: true } },
        createdBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        job: {
          id: job.id,
          title: job.title,
          slug: job.slug,
          description: job.description,
          status: job.status,
          level: job.level,
          type: job.type,
          remote: job.remote,
          location: job.location,
          salary: job.salary,
          currency: job.currency,
          companyId: job.companyId,
          companyName: job.company.name,
          createdAt: job.createdAt.toISOString(),
        },
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
