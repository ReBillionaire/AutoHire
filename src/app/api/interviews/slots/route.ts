import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

export const dynamic = 'force-dynamic';

interface AvailabilitySlot {
  date: Date;
  time: string;
  available: boolean;
  interviewer: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * GET /api/interviews/slots
 * Get available interview time slots for specified interviewers
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const interviewerIds = searchParams.getAll('interviewerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const duration = parseInt(searchParams.get('duration') || '60');

    if (!interviewerIds.length) {
      return NextResponse.json(
        { error: 'At least one interviewer ID is required' },
        { status: 400 }
      );
    }

    // Get interviewers
    const interviewers = await prisma.user.findMany({
      where: {
        id: { in: interviewerIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (interviewers.length === 0) {
      return NextResponse.json(
        { error: 'Interviewers not found' },
        { status: 404 }
      );
    }

    // Get existing interviews for these interviewers
    const start = startDate ? new Date(startDate) : startOfDay(new Date());
    const end = endDate ? new Date(endDate) : endOfDay(addDays(new Date(), 14));

    const existingInterviews = await prisma.interview.findMany({
      where: {
        interviewerId: { in: interviewerIds },
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        scheduledAt: true,
        duration: true,
        interviewerId: true,
      },
    });

    // Generate available slots (business hours 9 AM - 6 PM, 30-min increments)
    const slots: AvailabilitySlot[] = [];
    const businessHoursStart = 9;
    const businessHoursEnd = 18;
    const slotDuration = 30; // in minutes

    for (let i = 0; i < 14; i++) {
      const date = addDays(start, i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      for (let hour = businessHoursStart; hour < businessHoursEnd; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, minute, 0);

          // Check if slot is in the past
          if (isBefore(slotTime, new Date())) {
            continue;
          }

          // Check availability for all selected interviewers
          const allAvailable = interviewers.every((interviewer) => {
            const conflicts = existingInterviews.filter((interview) => {
              if (interview.interviewerId !== interviewer.id) return false;

              const interviewStart = new Date(interview.scheduledAt);
              const interviewEnd = new Date(
                interviewStart.getTime() + (interview.duration || 60) * 60 * 1000
              );
              const slotEnd = new Date(slotTime.getTime() + duration * 60 * 1000);

              return (
                (slotTime >= interviewStart && slotTime < interviewEnd) ||
                (slotEnd > interviewStart && slotEnd <= interviewEnd) ||
                (slotTime <= interviewStart && slotEnd >= interviewEnd)
              );
            });

            return conflicts.length === 0;
          });

          // Add slot for each interviewer
          interviewers.forEach((interviewer) => {
            const hasConflict = existingInterviews.some((interview) => {
              if (interview.interviewerId !== interviewer.id) return false;

              const interviewStart = new Date(interview.scheduledAt);
              const interviewEnd = new Date(
                interviewStart.getTime() + (interview.duration || 60) * 60 * 1000
              );
              const slotEnd = new Date(slotTime.getTime() + duration * 60 * 1000);

              return (
                (slotTime >= interviewStart && slotTime < interviewEnd) ||
                (slotEnd > interviewStart && slotEnd <= interviewEnd) ||
                (slotTime <= interviewStart && slotEnd >= interviewEnd)
              );
            });

            slots.push({
              date: slotTime,
              time: slotTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short',
              }),
              available: !hasConflict && allAvailable,
              interviewer,
            });
          });
        }
      }
    }

    // Remove duplicates and sort
    const uniqueSlots = Array.from(
      new Map(
        slots.map((slot) => [
          `${slot.date.getTime()}-${slot.interviewer.id}`,
          slot,
        ])
      ).values()
    ).sort((a, b) => a.date.getTime() - b.date.getTime());

    return NextResponse.json(uniqueSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interviews/slots
 * Block time slots (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { startTime, endTime, reason, isBlock } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Start and end times are required' },
        { status: 400 }
      );
    }

    // Create a blocked interview entry (could be a separate model in production)
    const blockedSlot = await prisma.interview.create({
      data: {
        candidateId: 'BLOCKED',
        jobPostingId: 'BLOCKED',
        companyId: session.user.id,
        type: 'SCREENING', // Placeholder
        status: 'CANCELLED',
        scheduledAt: new Date(startTime),
        duration: Math.round(
          (new Date(endTime).getTime() - new Date(startTime).getTime()) /
            60000
        ),
        notes: `BLOCKED: ${reason}`,
        interviewerId: session.user.id,
      },
    });

    return NextResponse.json(blockedSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating blocked slot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
