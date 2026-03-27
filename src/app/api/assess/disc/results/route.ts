import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    // Fetch session with DISC results
    const session = await prisma.assessmentSession.findUnique({
      where: { token },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.discCompleted) {
      return NextResponse.json(
        { error: 'DISC assessment not completed' },
        { status: 400 }
      );
    }

    // Parse scores and report
    const scores = session.discScores ? JSON.parse(session.discScores) : null;
    const report = session.discReport ? JSON.parse(session.discReport) : null;

    if (!scores || !report || !session.discProfile) {
      return NextResponse.json(
        { error: 'Results not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: session.discProfile,
      scores,
      report,
    });
  } catch (error) {
    console.error('Error fetching DISC results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
