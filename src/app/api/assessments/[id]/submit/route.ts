import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AnswerData {
  questionId: string;
  answer: string | number | string[];
  category?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { answers, token } = await request.json();
    const assessmentId = params.id;

    // Find the assessment session by token
    const session = await prisma.assessmentSession.findFirst({
      where: {
        token: token,
        id: assessmentId,
      },
      include: {
        company: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid assessment session or token' },
        { status: 400 }
      );
    }

    if (session.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Assessment already submitted' },
        { status: 400 }
      );
    }

    // Save each answer as an AssessmentResponse
    const responsePromises = answers.map((answer: AnswerData) =>
      prisma.assessmentResponse.create({
        data: {
          sessionId: session.id,
          questionId: answer.questionId,
          answer: typeof answer.answer === 'string' ? answer.answer : JSON.stringify(answer.answer),
          category: answer.category || 'SKILL',
        },
      })
    );

    await Promise.all(responsePromises);

    // Calculate scores per category
    const allResponses = await prisma.assessmentResponse.findMany({
      where: { sessionId: session.id },
    });

    // Simple scoring: count responses, calculate basic score
    const totalQuestions = allResponses.length;
    const scoredResponses = allResponses.filter(r => r.score !== null);
    const avgScore = scoredResponses.length > 0
      ? Math.round(scoredResponses.reduce((sum, r) => sum + (r.score || 0), 0) / scoredResponses.length)
      : null;

    // Update session as completed
    const updatedSession = await prisma.assessmentSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        overallScore: avgScore,
      },
    });

    return NextResponse.json({
      success: true,
      score: avgScore,
      status: 'COMPLETED',
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
