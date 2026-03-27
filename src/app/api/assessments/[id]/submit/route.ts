import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCompleteDISCProfile } from '@/lib/ai/disc-analyzer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AnswerData {
  question_id: string;
  answer: string | number | string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { answers, token } = await request.json();
    const assessmentId = params.id;

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get assessment attempt by token
    const { data: attempt, error: attemptError } = await supabase
      .from('assessment_attempts')
      .select('id, candidate_id')
      .eq('token', token)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: 'Invalid assessment token' },
        { status: 400 }
      );
    }

    // Save answers
    const answersToInsert = answers.map((answer: AnswerData) => ({
      attempt_id: attempt.id,
      question_id: answer.question_id,
      answer: answer.answer,
    }));

    const { error: answersError } = await supabase
      .from('assessment_answers')
      .insert(answersToInsert);

    if (answersError) throw answersError;

    let discProfile = null;

    // Generate DISC profile if psychometric assessment
    if (assessment.type === 'PSYCHOMETRIC') {
      try {
        // Get questions with text for DISC analysis
        const { data: questions } = await supabase
          .from('assessment_questions')
          .select('id, text, type')
          .eq('assessment_id', assessmentId);

        const answerData = answers.map((answer: AnswerData) => {
          const question = questions?.find((q: any) => q.id === answer.question_id);
          return {
            question_id: answer.question_id,
            question_text: question?.text || '',
            question_type: question?.type || '',
            answer: answer.answer,
          };
        });

        discProfile = await generateCompleteDISCProfile(answerData);
      } catch (discError) {
        console.error('Error generating DISC profile:', discError);
        // Continue without DISC profile if generation fails
      }
    }

    // Calculate score for skill assessments
    let score = null;
    if (assessment.type === 'SKILL') {
      const { data: questions } = await supabase
        .from('assessment_questions')
        .select('id, correct_answer, weight')
        .eq('assessment_id', assessmentId);

      let correctCount = 0;
      let totalWeight = 0;

      answers.forEach((answer: AnswerData) => {
        const question = questions?.find((q: any) => q.id === answer.question_id);
        if (question) {
          if (answer.answer === question.correct_answer) {
            correctCount += question.weight || 1;
          }
          totalWeight += question.weight || 1;
        }
      });

      score = Math.round((correctCount / totalWeight) * 100) || 0;
    }

    // Update attempt as completed
    const { error: updateError } = await supabase
      .from('assessment_attempts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score,
        disc_profile: discProfile,
      })
      .eq('id', attempt.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      score,
      disc_profile: discProfile,
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
