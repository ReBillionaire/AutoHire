import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDISCReport, determinePrimaryProfile, calculateDISCScores } from '@/lib/ai/disc-analyzer';

export const dynamic = 'force-dynamic';

// Standard 28-question DISC Assessment
const DISC_QUESTIONS = [
  {
    id: 1,
    statements: [
      { id: 'a', text: 'I take charge of situations', dimension: 'D' },
      { id: 'b', text: 'I enjoy socializing with others', dimension: 'I' },
      { id: 'c', text: 'I prefer consistency and stability', dimension: 'S' },
      { id: 'd', text: 'I focus on accuracy and details', dimension: 'C' },
    ],
  },
  {
    id: 2,
    statements: [
      { id: 'a', text: 'I am results-oriented and competitive', dimension: 'D' },
      { id: 'b', text: 'I am enthusiastic and persuasive', dimension: 'I' },
      { id: 'c', text: 'I am patient and reliable', dimension: 'S' },
      { id: 'd', text: 'I am systematic and methodical', dimension: 'C' },
    ],
  },
  {
    id: 3,
    statements: [
      { id: 'a', text: 'I like to be in control', dimension: 'D' },
      { id: 'b', text: 'I like to inspire others', dimension: 'I' },
      { id: 'c', text: 'I like to support my team', dimension: 'S' },
      { id: 'd', text: 'I like to follow procedures', dimension: 'C' },
    ],
  },
  {
    id: 4,
    statements: [
      { id: 'a', text: 'I push to get things done quickly', dimension: 'D' },
      { id: 'b', text: 'I build relationships easily', dimension: 'I' },
      { id: 'c', text: 'I maintain harmonious environments', dimension: 'S' },
      { id: 'd', text: 'I ensure quality in my work', dimension: 'C' },
    ],
  },
  {
    id: 5,
    statements: [
      { id: 'a', text: 'I make decisions quickly', dimension: 'D' },
      { id: 'b', text: 'I am optimistic about the future', dimension: 'I' },
      { id: 'c', text: 'I avoid unnecessary conflicts', dimension: 'S' },
      { id: 'd', text: 'I analyze problems thoroughly', dimension: 'C' },
    ],
  },
  {
    id: 6,
    statements: [
      { id: 'a', text: 'I am direct and straightforward', dimension: 'D' },
      { id: 'b', text: 'I am expressive and animated', dimension: 'I' },
      { id: 'c', text: 'I am calm and patient', dimension: 'S' },
      { id: 'd', text: 'I am careful and conservative', dimension: 'C' },
    ],
  },
  {
    id: 7,
    statements: [
      { id: 'a', text: 'I challenge the status quo', dimension: 'D' },
      { id: 'b', text: 'I seek attention and recognition', dimension: 'I' },
      { id: 'c', text: 'I work best in teams', dimension: 'S' },
      { id: 'd', text: 'I verify facts before acting', dimension: 'C' },
    ],
  },
  {
    id: 8,
    statements: [
      { id: 'a', text: 'I am driven by achievement', dimension: 'D' },
      { id: 'b', text: 'I am motivated by people', dimension: 'I' },
      { id: 'c', text: 'I am motivated by helping others', dimension: 'S' },
      { id: 'd', text: 'I am motivated by accuracy', dimension: 'C' },
    ],
  },
  {
    id: 9,
    statements: [
      { id: 'a', text: 'I take risks to achieve my goals', dimension: 'D' },
      { id: 'b', text: 'I embrace new ideas readily', dimension: 'I' },
      { id: 'c', text: 'I prefer proven approaches', dimension: 'S' },
      { id: 'd', text: 'I research before implementing', dimension: 'C' },
    ],
  },
  {
    id: 10,
    statements: [
      { id: 'a', text: 'I like high-pressure environments', dimension: 'D' },
      { id: 'b', text: 'I thrive in social settings', dimension: 'I' },
      { id: 'c', text: 'I prefer calm work environments', dimension: 'S' },
      { id: 'd', text: 'I prefer organized environments', dimension: 'C' },
    ],
  },
  {
    id: 11,
    statements: [
      { id: 'a', text: 'I want to win in competitions', dimension: 'D' },
      { id: 'b', text: 'I want to influence others', dimension: 'I' },
      { id: 'c', text: 'I want to maintain harmony', dimension: 'S' },
      { id: 'd', text: 'I want to do things correctly', dimension: 'C' },
    ],
  },
  {
    id: 12,
    statements: [
      { id: 'a', text: 'I speak assertively', dimension: 'D' },
      { id: 'b', text: 'I speak enthusiastically', dimension: 'I' },
      { id: 'c', text: 'I speak thoughtfully', dimension: 'S' },
      { id: 'd', text: 'I speak precisely', dimension: 'C' },
    ],
  },
  {
    id: 13,
    statements: [
      { id: 'a', text: 'I solve problems decisively', dimension: 'D' },
      { id: 'b', text: 'I find creative solutions', dimension: 'I' },
      { id: 'c', text: 'I solve problems cooperatively', dimension: 'S' },
      { id: 'd', text: 'I solve problems logically', dimension: 'C' },
    ],
  },
  {
    id: 14,
    statements: [
      { id: 'a', text: 'I handle conflict directly', dimension: 'D' },
      { id: 'b', text: 'I handle conflict with humor', dimension: 'I' },
      { id: 'c', text: 'I avoid conflict when possible', dimension: 'S' },
      { id: 'd', text: 'I analyze conflict objectively', dimension: 'C' },
    ],
  },
  {
    id: 15,
    statements: [
      { id: 'a', text: 'I focus on bottom line results', dimension: 'D' },
      { id: 'b', text: 'I focus on inspiring the team', dimension: 'I' },
      { id: 'c', text: 'I focus on team morale', dimension: 'S' },
      { id: 'd', text: 'I focus on quality standards', dimension: 'C' },
    ],
  },
  {
    id: 16,
    statements: [
      { id: 'a', text: 'I am impatient with slow progress', dimension: 'D' },
      { id: 'b', text: 'I am restless without stimulation', dimension: 'I' },
      { id: 'c', text: 'I am hesitant about change', dimension: 'S' },
      { id: 'd', text: 'I am reluctant to take shortcuts', dimension: 'C' },
    ],
  },
  {
    id: 17,
    statements: [
      { id: 'a', text: 'I am not concerned with others\' feelings', dimension: 'D' },
      { id: 'b', text: 'I occasionally overlook details', dimension: 'I' },
      { id: 'c', text: 'I avoid making difficult decisions', dimension: 'S' },
      { id: 'd', text: 'I can be overly critical', dimension: 'C' },
    ],
  },
  {
    id: 18,
    statements: [
      { id: 'a', text: 'I delegate tasks readily', dimension: 'D' },
      { id: 'b', text: 'I involve others in planning', dimension: 'I' },
      { id: 'c', text: 'I prefer to do work myself', dimension: 'S' },
      { id: 'd', text: 'I supervise work closely', dimension: 'C' },
    ],
  },
  {
    id: 19,
    statements: [
      { id: 'a', text: 'I am demanding of my team', dimension: 'D' },
      { id: 'b', text: 'I am trusting of my team', dimension: 'I' },
      { id: 'c', text: 'I support my team members', dimension: 'S' },
      { id: 'd', text: 'I set clear expectations', dimension: 'C' },
    ],
  },
  {
    id: 20,
    statements: [
      { id: 'a', text: 'I adjust my approach when needed', dimension: 'D' },
      { id: 'b', text: 'I adapt easily to new situations', dimension: 'I' },
      { id: 'c', text: 'I need time to adapt to change', dimension: 'S' },
      { id: 'd', text: 'I plan before adapting', dimension: 'C' },
    ],
  },
  {
    id: 21,
    statements: [
      { id: 'a', text: 'I prefer working independently', dimension: 'D' },
      { id: 'b', text: 'I prefer working with people', dimension: 'I' },
      { id: 'c', text: 'I prefer working in groups', dimension: 'S' },
      { id: 'd', text: 'I prefer defined roles', dimension: 'C' },
    ],
  },
  {
    id: 22,
    statements: [
      { id: 'a', text: 'I view failure as a learning opportunity', dimension: 'D' },
      { id: 'b', text: 'I bounce back quickly from setbacks', dimension: 'I' },
      { id: 'c', text: 'I need support during setbacks', dimension: 'S' },
      { id: 'd', text: 'I analyze what went wrong', dimension: 'C' },
    ],
  },
  {
    id: 23,
    statements: [
      { id: 'a', text: 'I am ambitious about advancement', dimension: 'D' },
      { id: 'b', text: 'I seek prominence and visibility', dimension: 'I' },
      { id: 'c', text: 'I value job security', dimension: 'S' },
      { id: 'd', text: 'I value expertise recognition', dimension: 'C' },
    ],
  },
  {
    id: 24,
    statements: [
      { id: 'a', text: 'I lead by example and action', dimension: 'D' },
      { id: 'b', text: 'I lead by inspiration', dimension: 'I' },
      { id: 'c', text: 'I lead by supporting others', dimension: 'S' },
      { id: 'd', text: 'I lead by establishing standards', dimension: 'C' },
    ],
  },
  {
    id: 25,
    statements: [
      { id: 'a', text: 'I thrive on competition', dimension: 'D' },
      { id: 'b', text: 'I thrive on recognition', dimension: 'I' },
      { id: 'c', text: 'I thrive on stability', dimension: 'S' },
      { id: 'd', text: 'I thrive on perfection', dimension: 'C' },
    ],
  },
  {
    id: 26,
    statements: [
      { id: 'a', text: 'I am straightforward about problems', dimension: 'D' },
      { id: 'b', text: 'I sugarcoat feedback', dimension: 'I' },
      { id: 'c', text: 'I avoid giving negative feedback', dimension: 'S' },
      { id: 'd', text: 'I give constructive feedback', dimension: 'C' },
    ],
  },
  {
    id: 27,
    statements: [
      { id: 'a', text: 'I focus on getting results', dimension: 'D' },
      { id: 'b', text: 'I focus on motivating people', dimension: 'I' },
      { id: 'c', text: 'I focus on maintaining relationships', dimension: 'S' },
      { id: 'd', text: 'I focus on ensuring quality', dimension: 'C' },
    ],
  },
  {
    id: 28,
    statements: [
      { id: 'a', text: 'I am naturally commanding', dimension: 'D' },
      { id: 'b', text: 'I am naturally charismatic', dimension: 'I' },
      { id: 'c', text: 'I am naturally dependable', dimension: 'S' },
      { id: 'd', text: 'I am naturally thorough', dimension: 'C' },
    ],
  },
];

// GET: Return DISC questions
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

    // Verify token exists and get session
    const session = await prisma.assessmentSession.findUnique({
      where: { token },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    if (session.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Assessment has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      questions: DISC_QUESTIONS,
    });
  } catch (error) {
    console.error('Error fetching DISC questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST: Submit DISC responses and calculate scores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, responses } = body;

    if (!token || !responses) {
      return NextResponse.json(
        { error: 'Missing token or responses' },
        { status: 400 }
      );
    }

    // Verify token and get session
    const session = await prisma.assessmentSession.findUnique({
      where: { token },
      include: {
        candidate: true,
        application: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    // Calculate DISC scores
    const scores = {
      D: 0,
      I: 0,
      S: 0,
      C: 0,
    };

    // Process responses: MOST = +2, LEAST = -1
    for (const response of responses) {
      const question = DISC_QUESTIONS.find((q) => q.id === response.questionId);
      if (!question) continue;

      // Find the dimension for MOST and LEAST
      const mostStatement = question.statements.find(
        (s) => s.id === response.most
      );
      const leastStatement = question.statements.find(
        (s) => s.id === response.least
      );

      if (mostStatement) {
        scores[mostStatement.dimension as 'D' | 'I' | 'S' | 'C'] += 2;
      }

      if (leastStatement) {
        scores[leastStatement.dimension as 'D' | 'I' | 'S' | 'C'] -= 1;
      }
    }

    // Normalize scores to 0-100 scale
    const minScore = Math.min(...Object.values(scores));
    const maxScore = Math.max(...Object.values(scores));
    const range = maxScore - minScore || 1;

    const normalizedScores = {
      D: Math.round(((scores.D - minScore) / range) * 100),
      I: Math.round(((scores.I - minScore) / range) * 100),
      S: Math.round(((scores.S - minScore) / range) * 100),
      C: Math.round(((scores.C - minScore) / range) * 100),
    };

    // Determine primary profile
    const sortedDimensions = Object.entries(normalizedScores)
      .sort(([, a], [, b]) => b - a)
      .map(([dimension]) => dimension);

    const primaryProfile = sortedDimensions[0] as 'D' | 'I' | 'S' | 'C';
    const secondaryProfile = sortedDimensions[1] as 'D' | 'I' | 'S' | 'C';

    // Generate AI report
    const answerData = responses.map((response: any) => ({
      question_id: response.questionId.toString(),
      question_text: DISC_QUESTIONS.find(
        (q) => q.id === response.questionId
      )?.statements?.find((s) => s.id === response.most)?.text,
      question_type: 'forced_choice',
      answer: response.most,
    }));

    const report = await generateDISCReport(
      answerData,
      {
        dominance: normalizedScores.D,
        influence: normalizedScores.I,
        steadiness: normalizedScores.S,
        conscientiousness: normalizedScores.C,
      },
      { primary: primaryProfile, secondary: secondaryProfile }
    );

    // Update session with DISC results
    const updatedSession = await prisma.assessmentSession.update({
      where: { token },
      data: {
        discCompleted: true,
        discProfile: primaryProfile,
        discScores: JSON.stringify(normalizedScores),
        discReport: JSON.stringify(report),
      },
    });

    return NextResponse.json({
      profile: primaryProfile,
      secondaryProfile: secondaryProfile,
      scores: normalizedScores,
      report: report.title,
    });
  } catch (error) {
    console.error('Error submitting DISC responses:', error);
    return NextResponse.json(
      { error: 'Failed to process responses' },
      { status: 500 }
    );
  }
}
