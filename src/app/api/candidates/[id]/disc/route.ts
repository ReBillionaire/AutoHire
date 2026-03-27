import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = params.id;

    // Find the candidate's most recent completed assessment session with DISC results
    const session = await prisma.assessmentSession.findFirst({
      where: {
        candidateId: candidateId,
        status: 'COMPLETED',
        discResults: { not: null },
      },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        discResults: true,
        completedAt: true,
      },
    });

    if (!session || !session.discResults) {
      return NextResponse.json(
        { error: 'No DISC profile found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session.discResults);
  } catch (error) {
    console.error('Error fetching DISC profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DISC profile' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = params.id;
    const { discResults } = await request.json();

    if (!discResults) {
      return NextResponse.json(
        { error: 'DISC results data is required' },
        { status: 400 }
      );
    }

    // Find the candidate's most recent assessment session
    const session = await prisma.assessmentSession.findFirst({
      where: {
        candidateId: candidateId,
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'No completed assessment found for candidate' },
        { status: 404 }
      );
    }

    // Update the session with DISC results
    const updated = await prisma.assessmentSession.update({
      where: { id: session.id },
      data: { discResults: discResults },
    });

    return NextResponse.json(updated.discResults, { status: 201 });
  } catch (error) {
    console.error('Error saving DISC profile:', error);
    return NextResponse.json(
      { error: 'Failed to save DISC profile' },
      { status: 500 }
    );
  }
}
