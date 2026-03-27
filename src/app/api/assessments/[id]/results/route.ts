import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    // Get assessment
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

    // Get all attempts for this assessment
    const { data: attempts, error: attemptsError } = await supabase
      .from('assessment_attempts')
      .select(
        `
        id,
        candidate_id,
        status,
        score,
        disc_profile,
        completed_at,
        candidates (
          id,
          name,
          email
        )
      `
      )
      .eq('assessment_id', assessmentId)
      .order('completed_at', { ascending: false });

    if (attemptsError) throw attemptsError;

    // Format results
    const results = attempts.map((attempt: any) => ({
      id: attempt.id,
      candidate_name: attempt.candidates?.name || 'Unknown',
      candidate_email: attempt.candidates?.email || 'unknown@example.com',
      submitted_at: attempt.completed_at || new Date().toISOString(),
      score: attempt.score || 0,
      status: attempt.status,
      disc_profile: attempt.disc_profile,
    }));

    return NextResponse.json({
      id: assessment.id,
      title: assessment.title,
      type: assessment.type,
      question_count: assessment.question_count,
      results,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
