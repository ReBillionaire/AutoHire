/**
 * POST /api/ai/analyze-answers
 * Analyze assessment answers using Claude
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeAssessmentAnswers, detectSuspiciousActivity } from '@/lib/ai/answer-analyzer';
import { AnalyzeAnswersRequest, AIAnalysisResponse, AssessmentAnalysis } from '@/types/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeAnswersRequest = await request.json();
    const startTime = Date.now();

    // Validate input
    if (!body.answers || body.answers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment answers are required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<AssessmentAnalysis>,
        { status: 400 }
      );
    }

    if (!body.assessmentType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment type is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<AssessmentAnalysis>,
        { status: 400 }
      );
    }

    if (!body.jobContext?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job context is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<AssessmentAnalysis>,
        { status: 400 }
      );
    }

    // Check for suspicious activity
    const suspiciousCheck = await detectSuspiciousActivity(body.answers, body.questions);

    // Analyze answers
    const analysis = await analyzeAssessmentAnswers(
      body.answers,
      body.assessmentType,
      body.jobContext,
      body.questions
    );

    // Merge suspicious activity findings
    if (suspiciousCheck.suspicious) {
      analysis.suspiciousActivity = {
        detected: true,
        indicators: suspiciousCheck.indicators,
        confidence: suspiciousCheck.confidence,
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: analysis,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      } as AIAnalysisResponse<AssessmentAnalysis>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Answer analysis error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to analyze assessment answers';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        processingTime: 0,
      } as AIAnalysisResponse<AssessmentAnalysis>,
      { status: 500 }
    );
  }
}
