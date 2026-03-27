import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/interviews/[id]
 * Fetch a single interview
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: {
        candidate: true,
        jobPosting: true,
        interviewer: true,
        company: true,
        questions: true,
        evaluations: true,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (interview.company?.ownerId !== session.user.id && interview.interviewerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/interviews/[id]
 * Update an interview
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verify authorization
    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: { company: true },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (interview.company?.ownerId !== session.user.id && interview.interviewerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: params.id },
      data: {
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
        endedAt: body.endedAt ? new Date(body.endedAt) : undefined,
        duration: body.duration,
        notes: body.notes,
        recording: body.recording,
        transcript: body.transcript,
        aiInsights: body.aiInsights,
        aiScore: body.aiScore,
      },
      include: {
        candidate: true,
        jobPosting: true,
        interviewer: true,
      },
    });

    return NextResponse.json(updatedInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interviews/[id]
 * Cancel an interview
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: { company: true },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (interview.company?.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const cancelledInterview = await prisma.interview.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json(cancelledInterview);
  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
