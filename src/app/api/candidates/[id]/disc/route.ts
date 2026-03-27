import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCompleteDISCProfile } from '@/lib/ai/disc-analyzer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = params.id;
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessment_id');

    // Get candidate's assessment attempt
    let query = supabase
      .from('assessment_attempts')
      .select('id, disc_profile, assessment_id')
      .eq('candidate_id', candidateId);

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId);
    }

    const { data: attempt, error: attemptError } = await query.single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: 'No DISC profile found' },
        { status: 404 }
      );
    }

    return NextResponse.json(attempt.disc_profile || {});
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
    const { assessment_id } = await request.json();

    // Get assessment answers
    const { data: attempt, error: attemptError } = await supabase
      .from('assessment_attempts')
      .select('id, assessment_id')
      .eq('candidate_id', candidateId)
      .eq('assessment_id', assessment_id)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: 'Assessment attempt not found' },
        { status: 404 }
      );
    }

    // Get answers
    const { data: answers, error: answersError } = await supabase
      .from('assessment_answers')
      .select(
        `
        answer,
        assessment_questions (
          text,
          type
        )
      `
      )
      .eq('attempt_id', attempt.id);

    if (answersError) throw answersError;

    // Prepare data for DISC analysis
    const answerData = answers.map((a: any) => ({
      question_id: a.assessment_questions.id,
      question_text: a.assessment_questions.text,
      question_type: a.assessment_questions.type,
      answer: a.answer,
    }));

    // Generate DISC profile
    const discProfile = await generateCompleteDISCProfile(answerData);

    // Save DISC profile
    const { error: updateError } = await supabase
      .from('assessment_attempts')
      .update({ disc_profile: discProfile })
      .eq('id', attempt.id);

    if (updateError) throw updateError;

    return NextResponse.json(discProfile, { status: 201 });
  } catch (error) {
    console.error('Error generating DISC profile:', error);
    return NextResponse.json(
      { error: 'Failed to generate DISC profile' },
      { status: 500 }
    );
  }
}
