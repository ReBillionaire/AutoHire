import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/ai-clients';

/**
 * GET /api/assess?token=xxx
 * Fetch assessment session details and questions
 *
 * Returns:
 * {
 *   session: { id, token, candidateId, candidateName, status, ... },
 *   questions: { [category]: [...] },
 *   timeLimit: number,
 *   success: true
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    // Fetch assessment session
    const session = await prisma.assessmentSession.findUnique({
      where: { token },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        application: {
          select: {
            jobPostingId: true,
            jobPosting: { select: { title: true } },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            settings: {
              select: { assessmentTimeLimit: true },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check if session is expired
    if (session.expiresAt && session.expiresAt < new Date()) {
      await prisma.assessmentSession.update({
        where: { token },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'Assessment has expired' },
        { status: 410 }
      );
    }

    // If PENDING, move to IN_PROGRESS and set startedAt
    let updatedSession = session;
    if (session.status === 'PENDING') {
      updatedSession = await prisma.assessmentSession.update({
        where: { token },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
        include: {
          candidate: true,
          application: { include: { jobPosting: true } },
          company: { include: { settings: true } },
        },
      });
    }

    // Get company settings for time limit
    const timeLimit = updatedSession.company.settings?.assessmentTimeLimit || 45; // minutes

    // Fetch and select questions from question bank
    const categories: Array<'SKILL' | 'COMMUNICATION' | 'EXPERIENCE' | 'PSYCHOMETRIC'> = [
      'SKILL',
      'COMMUNICATION',
      'EXPERIENCE',
      'PSYCHOMETRIC',
    ];

    const questionsByCategory: Record<string, any[]> = {};

    for (const category of categories) {
      // Get 5-7 questions per category with mix of difficulties
      const allQuestions = await prisma.questionBank.findMany({
        where: {
          companyId: updatedSession.companyId,
          category,
          active: true,
        },
        select: {
          id: true,
          question: true,
          options: true,
          difficulty: true,
          category: true,
        },
        orderBy: { usageCount: 'asc' }, // Rotate questions by using less-used ones
      });

      // Distribute difficulties: aim for 1-2 EASY, 3-4 MEDIUM, 1-2 HARD
      const easy = allQuestions.filter((q) => q.difficulty === 'EASY');
      const medium = allQuestions.filter((q) => q.difficulty === 'MEDIUM');
      const hard = allQuestions.filter((q) => q.difficulty === 'HARD');

      const selected = [
        ...easy.slice(0, 1),
        ...medium.slice(0, 4),
        ...hard.slice(0, 1),
      ].slice(0, 7); // Get up to 7 questions

      // Shuffle and parse options
      const shuffled = selected.sort(() => Math.random() - 0.5);
      questionsByCategory[category] = shuffled.map((q) => ({
        id: q.id,
        text: q.question,
        category: q.category,
        options: q.options ? JSON.parse(q.options) : null,
        difficulty: q.difficulty,
      }));

      // Increment usage count
      await Promise.all(
        selected.map((q) =>
          prisma.questionBank.update({
            where: { id: q.id },
            data: { usageCount: { increment: 1 } },
          })
        )
      );
    }

    return NextResponse.json(
      {
        success: true,
        session: {
          id: updatedSession.id,
          token: updatedSession.token,
          candidateId: updatedSession.candidateId,
          candidateName: `${updatedSession.candidate.firstName} ${updatedSession.candidate.lastName}`,
          status: updatedSession.status,
          jobTitle: updatedSession.application.jobPosting.title,
          startedAt: updatedSession.startedAt?.toISOString(),
        },
        questions: questionsByCategory,
        timeLimit, // minutes
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/assess error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assess
 * Submit assessment responses and calculate scores
 *
 * Body: {
 *   token: string,
 *   responses: [
 *     {
 *       questionId: string,
 *       questionText: string,
 *       category: string,
 *       answer: string | number | string[],
 *       timeSpent: number (seconds)
 *     },
 *     ...
 *   ]
 * }
 *
 * Returns: { success: true, scores: { ... }, session: { ... } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, responses } = body;

    if (!token || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Missing or invalid token and responses' },
        { status: 400 }
      );
    }

    // Fetch session
    const session = await prisma.assessmentSession.findUnique({
      where: { token },
      include: {
        candidate: true,
        application: { include: { jobPosting: true } },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (session.status === 'COMPLETED' || session.status === 'EXPIRED') {
      return NextResponse.json(
        { error: `Assessment is ${session.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Process each response
    const categoryScores: Record<string, number[]> = {
      SKILL: [],
      COMMUNICATION: [],
      EXPERIENCE: [],
      PSYCHOMETRIC: [],
    };

    const totalTimeSpent = responses.reduce(
      (sum: number, r: any) => sum + (r.timeSpent || 0),
      0
    );

    // Save responses and score them
    for (const response of responses) {
      const {
        questionId,
        questionText,
        category,
        answer,
        timeSpent = 0,
      } = response;

      let score: number | null = null;
      let isCorrect: boolean | null = null;
      let aiEvaluation: string | null = null;

      // For SKILL questions, auto-score MCQ
      if (category === 'SKILL') {
        const question = await prisma.questionBank.findUnique({
          where: { id: questionId },
        });

        if (question?.correctAnswer) {
          isCorrect = question.correctAnswer === answer;
          score = isCorrect ? 100 : 0;
          categoryScores.SKILL.push(score);
        }
      }
      // For COMMUNICATION and EXPERIENCE, use AI to evaluate open-ended answers
      else if (category === 'COMMUNICATION' || category === 'EXPERIENCE') {
        const question = await prisma.questionBank.findUnique({
          where: { id: questionId },
        });

        if (typeof answer === 'string' && answer.length > 0) {
          // Call AI to evaluate
          const evaluationResponse = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are an expert evaluator of ${category.toLowerCase()} skills.
Evaluate the candidate's response and provide:
1. A score from 0-100
2. Brief feedback (1-2 sentences)

Respond in JSON format: { "score": number, "feedback": "string" }`,
              },
              {
                role: 'user',
                content: `Question: ${questionText}
Category: ${category}
Evaluation criteria: ${question?.explanation || ''}

Candidate Response: "${answer}"

Evaluate this response and provide a score (0-100) and brief feedback.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 300,
          });

          try {
            const evaluationText = evaluationResponse.choices[0]?.message.content || '{}';
            const evaluation = JSON.parse(evaluationText);
            score = evaluation.score || 0;
            aiEvaluation = evaluation.feedback || '';

            if (category === 'COMMUNICATION') {
              categoryScores.COMMUNICATION.push(score);
            } else {
              categoryScores.EXPERIENCE.push(score);
            }
          } catch (parseError) {
            console.error('Failed to parse AI evaluation:', evaluationText);
            score = 0;
          }
        }
      }
      // For PSYCHOMETRIC, score Likert scale responses
      else if (category === 'PSYCHOMETRIC') {
        // Likert scale: 1-5 maps to 20-100
        const likertScore = parseInt(String(answer)) || 3;
        score = Math.min(100, Math.max(0, (likertScore - 1) * 25));
        categoryScores.PSYCHOMETRIC.push(score);
      }

      // Save response to database
      await prisma.assessmentResponse.create({
        data: {
          sessionId: session.id,
          questionId: questionId || undefined,
          questionText,
          category,
          answer: String(answer),
          isCorrect,
          score,
          aiEvaluation,
          timeSpent,
        },
      });
    }

    // Calculate category averages
    const calculateAverage = (scores: number[]) =>
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const skillScore = calculateAverage(categoryScores.SKILL);
    const communicationScore = calculateAverage(categoryScores.COMMUNICATION);
    const experienceScore = calculateAverage(categoryScores.EXPERIENCE);
    const psycheScore = calculateAverage(categoryScores.PSYCHOMETRIC);

    // Calculate overall score (weighted average)
    const overallScore =
      (skillScore * 0.4 +
        communicationScore * 0.25 +
        experienceScore * 0.25 +
        psycheScore * 0.1) /
      1;

    // Update session with scores and mark as COMPLETED
    const completedSession = await prisma.assessmentSession.update({
      where: { token },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        skillScore,
        communicationScore,
        experienceScore,
        psycheScore,
        overallScore,
        timeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
      },
      include: {
        candidate: true,
        application: { include: { jobPosting: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        scores: {
          skill: Math.round(skillScore),
          communication: Math.round(communicationScore),
          experience: Math.round(experienceScore),
          psychometric: Math.round(psycheScore),
          overall: Math.round(overallScore),
        },
        session: {
          id: completedSession.id,
          token: completedSession.token,
          status: completedSession.status,
          completedAt: completedSession.completedAt?.toISOString(),
          timeSpent: completedSession.timeSpent,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/assess error:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
