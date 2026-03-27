import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface ScoreCriterion {
  name: string;
  rating: number;
}

interface FeedbackPayload {
  criteria?: ScoreCriterion[];
  scores?: Record<string, number>;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE' | 'STRONG_NO' | 'STRONG_NO_HIRE' | 'NO_HIRE';
  feedback?: string;
  strengths?: string;
  concerns?: string;
  notes?: string;
}

/**
 * POST /api/interviews/[id]/feedback
 * Submit interview feedback and scorecard
 */
export async function POST(
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

    const body: FeedbackPayload = await request.json();
    const { criteria, scores, recommendation, feedback, strengths, concerns, notes } = body;

    // Verify interview exists
    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (interview.interviewerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the assigned interviewer can submit feedback' },
        { status: 403 }
      );
    }

    // Validate recommendation
    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation is required' },
        { status: 400 }
      );
    }

    // Calculate overall score from criteria or scores
    let overallScore = 0;
    if (criteria && criteria.length > 0) {
      const ratings = criteria.filter((c) => c.rating > 0).map((c) => c.rating);
      overallScore =
        ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : 0;
    } else if (scores) {
      const scoreValues = Object.values(scores);
      overallScore =
        scoreValues.length > 0
          ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 10) / 10
          : 0;
    }

    // Map recommendation to EvaluationRecommendation enum
    const recommendationMap: Record<string, string> = {
      STRONG_HIRE: 'STRONG_YES',
      HIRE: 'YES',
      MAYBE: 'MAYBE',
      NO_HIRE: 'NO',
      STRONG_NO_HIRE: 'STRONG_NO',
      STRONG_NO: 'STRONG_NO',
    };

    // Combine feedback notes
    const feedbackText = [strengths && `Strengths: ${strengths}`, concerns && `Concerns: ${concerns}`, notes && `Notes: ${notes}`]
      .filter(Boolean)
      .join('\n\n');

    // Create evaluation record
    const evaluation = await prisma.interviewEvaluation.create({
      data: {
        interviewId: params.id,
        reviewerId: session.user.id,
        score: Math.round(overallScore * 10), // Store as integer (0-50)
        feedback: feedbackText || feedback || '',
        recommendation: recommendationMap[recommendation] as any,
      },
    });

    // Update interview with overall score
    const updatedInterview = await prisma.interview.update({
      where: { id: params.id },
      data: {
        aiScore: overallScore,
        status: 'COMPLETED',
      },
      include: {
        evaluations: true,
        candidate: true,
      },
    });

    // Update candidate evaluation if this is a positive recommendation
    if (
      recommendation === 'STRONG_HIRE' ||
      recommendation === 'HIRE'
    ) {
      await prisma.candidateEvaluation.create({
        data: {
          candidateId: interview.candidateId,
          score: overallScore,
          notes: feedbackText || feedback || '',
          recommendation: recommendationMap[recommendation] as any,
        },
      });
    }

    return NextResponse.json(
      {
        evaluation,
        interview: updatedInterview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/interviews/[id]/feedback
 * Fetch existing feedback for an interview
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

    const evaluation = await prisma.interviewEvaluation.findFirst({
      where: { interviewId: params.id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/interviews/[id]/feedback
 * Update interview feedback
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

    const body: Partial<FeedbackPayload> = await request.json();

    // Find existing evaluation
    const evaluation = await prisma.interviewEvaluation.findFirst({
      where: { interviewId: params.id },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (evaluation.reviewerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own feedback' },
        { status: 403 }
      );
    }

    // Calculate new overall score if scores provided
    let newScore = evaluation.score;
    if (body.scores) {
      const scoreValues = Object.values(body.scores);
      const overallScore =
        scoreValues.length > 0
          ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 10) / 10
          : 0;
      newScore = Math.round(overallScore * 10);
    }

    const recommendationMap: Record<string, string> = {
      STRONG_HIRE: 'STRONG_YES',
      HIRE: 'YES',
      MAYBE: 'MAYBE',
      NO_HIRE: 'NO',
      STRONG_NO: 'STRONG_NO',
    };

    const updatedEvaluation = await prisma.interviewEvaluation.update({
      where: { id: evaluation.id },
      data: {
        score: newScore,
        feedback: body.feedback || evaluation.feedback,
        recommendation: body.recommendation
          ? (recommendationMap[body.recommendation] as any)
          : evaluation.recommendation,
      },
    });

    return NextResponse.json(updatedEvaluation);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
