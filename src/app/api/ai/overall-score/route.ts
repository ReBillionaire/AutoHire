/**
 * POST /api/ai/overall-score
 * Calculate composite candidate score across all evaluation dimensions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateOverallScore,
  compareMultipleCandidates,
} from '@/lib/ai/overall-scorer';
import { OverallScoreRequest, AIAnalysisResponse, OverallScore } from '@/types/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: OverallScoreRequest = await request.json();
    const startTime = Date.now();

    // Validate required fields
    if (!body.candidateId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Candidate ID is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<OverallScore>,
        { status: 400 }
      );
    }

    if (!body.jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job ID is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<OverallScore>,
        { status: 400 }
      );
    }

    if (!body.resumeAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume analysis is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<OverallScore>,
        { status: 400 }
      );
    }

    // Calculate overall score
    const overallScore = await calculateOverallScore(
      body.candidateId,
      body.jobId,
      body.resumeAnalysis,
      body.videoAnalysis,
      body.assessmentAnalysis,
      body.discProfile,
      body.jobDescription || 'Unknown job description'
    );

    return NextResponse.json(
      {
        success: true,
        data: overallScore,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      } as AIAnalysisResponse<OverallScore>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Overall scoring error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to calculate overall score';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        processingTime: 0,
      } as AIAnalysisResponse<OverallScore>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/overall-score/compare
 * Compare multiple candidate scores
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const startTime = Date.now();

    if (!body.scores || !Array.isArray(body.scores) || body.scores.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Candidate scores array is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        },
        { status: 400 }
      );
    }

    const comparison = await compareMultipleCandidates(body.scores);

    return NextResponse.json(
      {
        success: true,
        data: comparison,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Candidate comparison error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to compare candidates';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        processingTime: 0,
      },
      { status: 500 }
    );
  }
}
