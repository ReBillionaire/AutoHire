import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    // Get assessment sessions for this assessment config
    const sessions = await prisma.assessmentSession.findMany({
      where: { id: assessmentId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        responses: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    if (!sessions || sessions.length === 0) {
      // Try finding by treating id as a single session
      const session = await prisma.assessmentSession.findUnique({
        where: { id: assessmentId },
        include: {
          candidate: {
            select: { id: true, name: true, email: true },
          },
          responses: true,
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: session.id,
        results: [{
          id: session.id,
          candidate_name: session.candidate?.name || 'Unknown',
          candidate_email: session.candidate?.email || 'unknown@example.com',
          submitted_at: session.completedAt?.toISOString() || new Date().toISOString(),
          score: session.overallScore || 0,
          status: session.status,
          discResults: session.discResults,
        }],
      });
    }

    const results = sessions.map((s) => ({
      id: s.id,
      candidate_name: s.candidate?.name || 'Unknown',
      candidate_email: s.candidate?.email || 'unknown@example.com',
      submitted_at: s.completedAt?.toISOString() || new Date().toISOString(),
      score: s.overallScore || 0,
      status: s.status,
      discResults: s.discResults,
    }));

    return NextResponse.json({ id: assessmentId, results });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
