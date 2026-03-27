/**
 * POST /api/ai/interview-prep
 * Generate targeted interview questions based on candidate profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/lib/ai/interview-prep';
import { InterviewPrepRequest, AIAnalysisResponse, InterviewPrep } from '@/types/ai';

export async function POST(request: NextRequest) {
  try {
    const body: InterviewPrepRequest = await request.json();
    const startTime = Date.now();

    // Validate input
    if (!body.candidateProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Candidate profile is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<InterviewPrep>,
        { status: 400 }
      );
    }

    if (!body.jobDescription?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job description is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<InterviewPrep>,
        { status: 400 }
      );
    }

    if (!body.jobTitle?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job title is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<InterviewPrep>,
        { status: 400 }
      );
    }

    // Generate interview questions
    const interviewPrep = await generateInterviewQuestions(
      body.candidateProfile,
      body.jobDescription,
      body.jobTitle,
      body.totalQuestions || 10
    );

    return NextResponse.json(
      {
        success: true,
        data: interviewPrep,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      } as AIAnalysisResponse<InterviewPrep>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Interview prep generation error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate interview prep';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        processingTime: 0,
      } as AIAnalysisResponse<InterviewPrep>,
      { status: 500 }
    );
  }
}
