import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReminderStatus, ReminderType } from '@prisma/client';
import { processReminders } from '@/lib/automation-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/automation/reminders
 * Fetch reminders for the company with optional filters
 * Query params: status, type, startDate, endDate, limit, offset
 * Returns: { reminders: [...], total: number, processed: number }
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
    const status = searchParams.get('status') as ReminderStatus | null;
    const type = searchParams.get('type') as ReminderType | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      companyId: company.id,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.scheduledFor = {};
      if (startDate) {
        where.scheduledFor.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledFor.lte = new Date(endDate);
      }
    }

    const [reminders, total] = await Promise.all([
      prisma.pipelineReminder.findMany({
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
        },
        orderBy: { scheduledFor: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.pipelineReminder.count({ where }),
    ]);

    // Process due reminders (PENDING reminders where scheduledFor <= now)
    const processed = await processReminders(company.id);

    return NextResponse.json({
      reminders,
      total,
      processed,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automation/reminders
 * Create a new reminder
 * Body: { candidateId, applicationId?, type, message, scheduledFor }
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

    const body = await request.json();
    const { candidateId, applicationId, type, message, scheduledFor } = body;

    if (!candidateId || !type || !message || !scheduledFor) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateId, type, message, scheduledFor' },
        { status: 400 }
      );
    }

    // Verify candidate belongs to company
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        companyId: company.id,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const reminder = await prisma.pipelineReminder.create({
      data: {
        companyId: company.id,
        candidateId,
        applicationId: applicationId || null,
        type: type as ReminderType,
        message,
        scheduledFor: new Date(scheduledFor),
        status: ReminderStatus.PENDING,
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
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/automation/reminders
 * Update reminder status (mark sent, cancel, etc.)
 * Body: { reminderId, status }
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

    const body = await request.json();
    const { reminderId, status } = body;

    if (!reminderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: reminderId, status' },
        { status: 400 }
      );
    }

    const reminder = await prisma.pipelineReminder.findFirst({
      where: {
        id: reminderId,
        companyId: company.id,
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    const updatedReminder = await prisma.pipelineReminder.update({
      where: { id: reminderId },
      data: {
        status: status as ReminderStatus,
        sentAt: status === ReminderStatus.SENT ? new Date() : reminder.sentAt,
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
      },
    });

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
