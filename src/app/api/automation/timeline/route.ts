import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTimelineEvents } from '@/lib/automation-engine';

/**
 * GET /api/automation/timeline
 * Get pipeline activity timeline for company or specific application
 * Query params: applicationId, limit, offset, startDate, endDate
 * Returns: { events: [...], total: number }
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

    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get('applicationId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filters: any = {
      applicationId,
      limit,
      offset,
    };

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const { events, total } = await getTimelineEvents(company.id, filters);

    return NextResponse.json({
      events,
      total,
    });
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
