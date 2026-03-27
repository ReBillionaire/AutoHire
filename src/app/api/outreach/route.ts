import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/outreach
 * Fetch all outreach posts for the user's company
 * Query params: status, platform, jobId
 * Returns: { posts: [...], total: number }
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
    const platform = searchParams.get('platform');
    const jobId = searchParams.get('jobId');

    // Get user's companies
    const userCompanies = await prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (userCompanies.length === 0) {
      return NextResponse.json({ posts: [], total: 0 });
    }

    const companyIds = userCompanies.map(c => c.id);

    const where: any = {
      companyId: { in: companyIds },
    };

    if (status) {
      where.status = status;
    }

    if (jobId) {
      where.jobPostingId = jobId;
    }

    const posts = await prisma.outreachPost.findMany({
      where,
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
          },
        },
        platformContents: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by platform if specified
    let filtered = posts;
    if (platform) {
      filtered = posts.filter(post => {
        const platforms = Array.isArray(post.platforms)
          ? post.platforms
          : JSON.parse(post.platforms);
        return platforms.includes(platform);
      });
    }

    // Transform to match expected format
    const transformedPosts = filtered.map(post => {
      const platforms = Array.isArray(post.platforms)
        ? post.platforms
        : JSON.parse(post.platforms);
      return {
        id: post.id,
        title: post.title,
        jobPostingId: post.jobPostingId,
        jobTitle: post.jobPosting.title,
        companyName: post.jobPosting.company.name,
        status: post.status,
        platforms: platforms,
        scheduledAt: post.scheduledAt?.toISOString(),
        postedAt: post.postedAt?.toISOString(),
        views: post.views,
        clicks: post.clicks,
        applications: post.applications,
        platformContents: post.platformContents,
        createdBy: post.createdBy,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      posts: transformedPosts,
      total: transformedPosts.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/outreach error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outreach posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/outreach
 * Create a new outreach post
 * Body: { jobId, platforms: [], platformContents: {...}, scheduledAt?, companyId }
 * Returns: { post: {...}, success: true }
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
    const { jobId, platforms, platformContents, scheduledAt, companyId } = body;

    // Validate required fields
    if (!jobId || !platforms || platforms.length === 0 || !companyId) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: jobId, platforms (non-empty array), companyId',
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

    // Verify job posting exists
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!jobPosting || jobPosting.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    // Create outreach post
    const outreachPost = await prisma.outreachPost.create({
      data: {
        title: `${jobPosting.title} - Outreach`,
        jobPostingId: jobId,
        companyId,
        createdById: session.user.id,
        platforms: JSON.stringify(platforms),
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        aiPlatformRecs: JSON.stringify([]),
        jobType: jobPosting.title.toLowerCase(),
      },
    });

    // Create platform contents if provided
    if (platformContents && Object.keys(platformContents).length > 0) {
      for (const [platform, content] of Object.entries(platformContents)) {
        const platformContent = content as any;
        await prisma.platformContent.create({
          data: {
            platform,
            outreachPostId: outreachPost.id,
            content: platformContent.content || '',
            characterCount: platformContent.characterCount || 0,
            hashtags: platformContent.hashtags
              ? Array.isArray(platformContent.hashtags)
                ? platformContent.hashtags.join(',')
                : platformContent.hashtags
              : null,
            bestPostingTime: platformContent.bestPostingTime || null,
          },
        });
      }
    }

    const createdPost = await prisma.outreachPost.findUnique({
      where: { id: outreachPost.id },
      include: {
        platformContents: true,
        jobPosting: { select: { title: true } },
        createdBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        post: {
          id: createdPost!.id,
          title: createdPost!.title,
          jobTitle: createdPost!.jobPosting.title,
          status: createdPost!.status,
          platforms: Array.isArray(createdPost!.platforms)
            ? createdPost!.platforms
            : JSON.parse(createdPost!.platforms),
          platformContents: createdPost!.platformContents,
          scheduledAt: createdPost!.scheduledAt?.toISOString(),
          createdAt: createdPost!.createdAt.toISOString(),
        },
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/outreach error:', error);
    return NextResponse.json(
      { error: 'Failed to create outreach post' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/outreach
 * Update outreach posts (e.g., change status)
 * Body: { ids: [...], status: string }
 * Returns: { updated: number }
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
    const { ids, status } = body;

    // Validate required fields
    if (!ids || ids.length === 0 || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: ids (non-empty array), status' },
        { status: 400 }
      );
    }

    // Verify all posts belong to user's company
    const posts = await prisma.outreachPost.findMany({
      where: { id: { in: ids } },
      include: { company: true },
    });

    for (const post of posts) {
      if (post.company.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized: one or more posts do not belong to your company' },
          { status: 403 }
        );
      }
    }

    // Update posts
    const updated = await prisma.outreachPost.updateMany({
      where: { id: { in: ids } },
      data: {
        status: status as any,
        ...(status === 'POSTED' && { postedAt: new Date() }),
      },
    });

    return NextResponse.json({
      updated: updated.count,
      success: true,
    });
  } catch (error) {
    console.error('PATCH /api/outreach error:', error);
    return NextResponse.json(
      { error: 'Failed to update outreach posts' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/outreach
 * Delete outreach posts
 * Body: { ids: [...] }
 * Returns: { deleted: number }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    // Validate required fields
    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: ids (non-empty array)' },
        { status: 400 }
      );
    }

    // Verify all posts belong to user's company
    const posts = await prisma.outreachPost.findMany({
      where: { id: { in: ids } },
      include: { company: true },
    });

    for (const post of posts) {
      if (post.company.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized: one or more posts do not belong to your company' },
          { status: 403 }
        );
      }
    }

    // Delete platform contents first (cascade)
    await prisma.platformContent.deleteMany({
      where: { outreachPostId: { in: ids } },
    });

    // Delete posts
    const deleted = await prisma.outreachPost.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      deleted: deleted.count,
      success: true,
    });
  } catch (error) {
    console.error('DELETE /api/outreach error:', error);
    return NextResponse.json(
      { error: 'Failed to delete outreach posts' },
      { status: 500 }
    );
  }
}
